import { afterEach, describe, expect, it, vi } from "vitest";
import { canonicalOcdIds, isValidOcdId } from "../shared/civic";
import { buildQuery } from "../netlify/lib/ballotready";
import officeholders from "../netlify/functions/officeholders";
import { channelUrl, newsSearchUrl, photoUrl } from "../src/lib/candidates";
import { en } from "../src/strings/en";
import { es } from "../src/strings/es";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.FEATURE_OFFICEHOLDERS;
  delete process.env.PARTNER_API_KEY;
});

describe("Spanish strings", () => {
  // Every key in English must exist in Spanish with the same kind of value.
  const shape = (o: unknown): unknown =>
    typeof o === "function"
      ? "fn"
      : Array.isArray(o)
        ? `array:${o.length}`
        : o && typeof o === "object"
          ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, shape(v)]))
          : typeof o;
  it("mirrors the English shape exactly", () => {
    expect(shape(es)).toEqual(shape(en));
  });
  it("is actually translated", () => {
    expect(es.address.submit).not.toBe(en.address.submit);
    expect(es.locale).toBe("es-US");
    expect(es.plan.summary("Por correo", "Biblioteca", "martes")).toBe("Por correo en Biblioteca, martes");
  });
  it("keeps Google's required attribution wording", () => {
    expect(es.footer.attribution).toBe(en.footer.attribution);
  });
});

describe("candidate links", () => {
  it("builds social links from handles or URLs and drops unsafe ones", () => {
    expect(channelUrl({ type: "Twitter", id: "@jane" })).toBe("https://x.com/jane");
    expect(channelUrl({ type: "Facebook", id: "https://facebook.com/jane" })).toBe("https://facebook.com/jane");
    expect(channelUrl({ type: "YouTube", id: "UCabcdefghijklmnopqrstuv" })).toBe("https://www.youtube.com/channel/UCabcdefghijklmnopqrstuv");
    expect(channelUrl({ type: "GooglePlus", id: "123" })).toBeNull();
    expect(channelUrl({ type: "Facebook", id: "javascript:alert(1)" })).toBe("https://www.facebook.com/javascript%3Aalert(1)");
  });
  it("only loads photos over https", () => {
    expect(photoUrl({ name: "A", photoUrl: "http://example.org/a.jpg" })).toBe("https://example.org/a.jpg");
    expect(photoUrl({ name: "A", photoUrl: "javascript:alert(1)" })).toBeNull();
    expect(photoUrl({ name: "A" })).toBeNull();
  });
  it("makes a neutral news search", () => {
    const url = new URL(newsSearchUrl("Jane Doe", "Mayor"));
    expect(url.searchParams.get("q")).toBe('"Jane Doe" Mayor');
    expect(url.searchParams.get("tbm")).toBe("nws");
  });
});

describe("OCD IDs", () => {
  it("validates and canonicalizes", () => {
    expect(isValidOcdId("ocd-division/country:us/state:ca/cd:12")).toBe(true);
    expect(isValidOcdId("ocd-division/country:us/state:ca/county:alameda/school_district:oakland_unified")).toBe(true);
    expect(isValidOcdId("ocd-division/country:us\"){ evil }")).toBe(false);
    expect(canonicalOcdIds(["b", "a", "b"])).toEqual(["a", "b"]);
  });
});

describe("/api/officeholders (F8)", () => {
  const ids = "ocd-division/country:us/state:ca/cd:12,ocd-division/country:us/state:ca";

  it("is off by default and costs no partner call", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const res = await officeholders(new Request(`https://x.test/api/officeholders?ocdIds=${ids}`));
    expect(await res.json()).toEqual({ enabled: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("queries BallotReady by division and returns officeholders per OCD ID", async () => {
    process.env.FEATURE_OFFICEHOLDERS = "true";
    process.env.PARTNER_API_KEY = "partner";
    vi.spyOn(console, "log").mockImplementation(() => {});
    let sent: { headers: Headers; body: { query: string; variables: Record<string, unknown> } } | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: RequestInit) => {
        sent = { headers: new Headers(init.headers), body: JSON.parse(String(init.body)) };
        return json({
          data: {
            d0: { nodes: [{ person: { fullName: "Gavin Example" }, parties: [{ name: "Democratic" }], position: { name: "Governor" } }] },
            d1: { nodes: [] },
          },
        });
      }),
    );
    const res = await officeholders(new Request(`https://x.test/api/officeholders?ocdIds=${ids}`));
    const body = await res.json();
    expect(body.enabled).toBe(true);
    // IDs are sorted: state:ca comes before state:ca/cd:12.
    expect(body.byDivision["ocd-division/country:us/state:ca"]).toEqual([
      { name: "Gavin Example", office: "Governor", parties: ["Democratic"] },
    ]);
    expect(body.byDivision["ocd-division/country:us/state:ca/cd:12"]).toEqual([]);
    expect(sent!.headers.get("Authorization")).toBe("Bearer partner");
    expect(sent!.body.variables.d0).toEqual({ ocdId: "ocd-division/country:us/state:ca", recursive: false });
    expect(res.headers.get("Netlify-Vary")).toBe("query=ocdIds");
  });

  it("rejects malformed IDs", async () => {
    process.env.FEATURE_OFFICEHOLDERS = "true";
    process.env.PARTNER_API_KEY = "partner";
    const res = await officeholders(new Request("https://x.test/api/officeholders?ocdIds=not-an-id"));
    expect(res.status).toBe(400);
  });

  it("builds a variables-only GraphQL query (no IDs interpolated)", () => {
    const { query } = buildQuery(["ocd-division/country:us"]);
    expect(query).toContain("query Officeholders($d0: DivisionFilter)");
    expect(query).toContain("d0: officeHolders(division: $d0, filterBy: { isCurrent: true }, first: 25)");
    expect(query).not.toContain("ocd-division");
  });
});
