import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import caFixture from "../fixtures/voterinfo-ca.json";
import divisionsFixture from "../fixtures/divisions-ca.json";
import divisions from "../netlify/functions/divisions";
import explain from "../netlify/functions/explain";
import voterinfo from "../netlify/functions/voterinfo";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  process.env.GOOGLE_CIVIC_API_KEY = "test-key";
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("/api/voterinfo", () => {
  it("passes Google's data through with a CDN cache keyed by address + electionId", async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(caFixture));
    vi.stubGlobal("fetch", fetchMock);
    const res = await voterinfo(new Request("https://x.test/api/voterinfo?address=2000%20BROADWAY,%20Oakland%20CA"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.election.id).toBe("12000");
    expect(body.fetchedAt).toBeTruthy();
    expect(res.headers.get("Netlify-CDN-Cache-Control")).toContain("s-maxage=3600");
    expect(res.headers.get("Netlify-Vary")).toBe("query=address|electionId");
    const called = new URL(fetchMock.mock.calls[0][0]);
    expect(called.searchParams.get("address")).toBe("2000 broadway, oakland ca");
    expect(called.searchParams.get("key")).toBe("test-key");
  });

  it("maps Google errors to friendly codes and never caches them", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ error: { code: 400, message: "Failed to parse address" } }, 400)));
    const res = await voterinfo(new Request("https://x.test/api/voterinfo?address=zzz"));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: { code: "addressUnparseable" } });
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("validates input before calling Google", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect((await voterinfo(new Request("https://x.test/api/voterinfo"))).status).toBe(400);
    expect((await voterinfo(new Request("https://x.test/api/voterinfo?address=a&electionId=abc"))).status).toBe(400);
    expect((await voterinfo(new Request(`https://x.test/api/voterinfo?address=${"a".repeat(300)}`))).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never logs the address", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(caFixture)));
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    await voterinfo(new Request("https://x.test/api/voterinfo?address=2000%20Broadway%20Oakland"));
    expect(log.mock.calls.flat().join(" ").toLowerCase()).not.toContain("broadway");
  });

  it("reports a missing key as unavailable", async () => {
    delete process.env.GOOGLE_CIVIC_API_KEY;
    const res = await voterinfo(new Request("https://x.test/api/voterinfo?address=a"));
    expect(res.status).toBe(503);
  });
});

describe("/api/divisions", () => {
  it("returns {ocdId, name} pairs cached for 24 hours", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(divisionsFixture)));
    const res = await divisions(new Request("https://x.test/api/divisions?address=2000%20Broadway"));
    const body = await res.json();
    expect(body.divisions).toContainEqual({ ocdId: "ocd-division/country:us/state:ca/cd:12", name: "California's 12th congressional district" });
    expect(res.headers.get("Netlify-CDN-Cache-Control")).toContain("s-maxage=86400");
  });
});

describe("/api/explain", () => {
  it("refuses to summarize a measure that has no official text", async () => {
    process.env.ANTHROPIC_API_KEY = "test";
    const fetchMock = vi.fn().mockResolvedValue(json(caFixture));
    vi.stubGlobal("fetch", fetchMock);
    const res = await explain(
      new Request("https://x.test/api/explain?electionId=12000&districtId=2&title=PROPOSITION%201&address=2000%20Broadway"),
    );
    expect(await res.json()).toEqual({ available: false, reason: "noOfficialText" });
    // Read through our own cached /api/voterinfo, not Google directly.
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/^https:\/\/x\.test\/api\/voterinfo\?/);
    expect(res.headers.get("Netlify-Vary")).toBe("query=electionId|districtId|title");
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("is unavailable without an Anthropic key", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const res = await explain(new Request("https://x.test/api/explain?electionId=1&districtId=2&title=T&address=a"));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: { code: "aiUnavailable" } });
  });
});

describe("/api/explain with official text", () => {
  it("asks Claude for the four answers and caches the shared summary for 24 hours", async () => {
    process.env.ANTHROPIC_API_KEY = "test";
    const testFixture = (await import("../fixtures/voterinfo-test-2000.json")).default;
    const answer = {
      whatItDoes: "Requires street upgrades when streets are repaved.",
      ifPasses: "The city must add planned improvements during repaving.",
      ifFails: "The city keeps deciding project by project.",
      whoIsAffected: "People who use Los Angeles city streets.",
    };
    let claudeRequest: { headers: Headers; body: Record<string, unknown> } | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input instanceof Request ? input.url : input);
        if (url.includes("/api/voterinfo")) return json(testFixture);
        if (url.startsWith("https://api.anthropic.com/v1/messages")) {
          claudeRequest = { headers: new Headers(init?.headers), body: JSON.parse(String(init?.body)) };
          return json({
            id: "msg_1",
            type: "message",
            role: "assistant",
            model: "claude-opus-5-5",
            content: [{ type: "text", text: JSON.stringify(answer) }],
            stop_reason: "end_turn",
            stop_sequence: null,
            usage: { input_tokens: 10, output_tokens: 10 },
          });
        }
        throw new Error(`unexpected fetch ${url}`);
      }),
    );
    vi.spyOn(console, "log").mockImplementation(() => {});

    const q = new URLSearchParams({
      electionId: "2000",
      districtId: "CITY OF LOS ANGELES",
      title: "LOS ANGELES CITY MUNICIPAL ELECTION - MEASURE HLA",
      address: "340 Main St, Venice, CA 90291",
    });
    const res = await explain(new Request(`https://x.test/api/explain?${q}`));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ available: true, ...answer });
    expect(res.headers.get("Netlify-CDN-Cache-Control")).toContain("s-maxage=86400");

    expect(claudeRequest!.body.model).toBe("claude-opus-5-5");
    expect(claudeRequest!.body.fallbacks).toBe("default");
    expect(claudeRequest!.headers.get("anthropic-beta")).toContain("server-side-fallback-2026-07-01");
    const userText = JSON.stringify(claudeRequest!.body.messages);
    expect(userText).toContain("INITIATIVE ORDINANCE HLA");
    // The voter's address is never sent to Anthropic.
    expect(userText.toLowerCase()).not.toContain("340 main");
    delete process.env.ANTHROPIC_API_KEY;
  });
});
