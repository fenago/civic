import { describe, expect, it } from "vitest";
import { hasOfficialText, isMeasure, mapGoogleError, normalizeAddress, type VoterInfo } from "../shared/civic";
import caFixture from "../fixtures/voterinfo-ca.json";
import testFixture from "../fixtures/voterinfo-test-2000.json";

describe("mapGoogleError", () => {
  it.each([
    ["Failed to parse address", 400, "addressUnparseable"],
    ["Election unknown", 400, "electionUnknown"],
    ["Election is over", 400, "electionOver"],
    ["Multiple street segments found", 400, "multipleStreetSegmentsFound"],
    ["No street segment found", 400, "noStreetSegmentFound"],
    ["Quota exceeded", 403, "rateLimited"],
    ["Backend error", 500, "upstreamUnavailable"],
    ["Something new", 400, "unknown"],
  ] as const)("%s -> %s", (message, status, code) => {
    expect(mapGoogleError(status, message)).toBe(code);
  });
});

describe("normalizeAddress", () => {
  it("collapses case, spacing and trailing punctuation so CDN keys match", () => {
    expect(normalizeAddress("  2000  Broadway ,Oakland,  CA 94612. ")).toBe("2000 broadway, oakland, ca 94612");
    expect(normalizeAddress("2000 BROADWAY, OAKLAND, CA 94612")).toBe(normalizeAddress("2000 broadway,oakland,ca 94612"));
  });
});

describe("measures", () => {
  it("detects measures and whether official text exists", () => {
    const ca = (caFixture as VoterInfo).contests!.filter(isMeasure);
    expect(ca.length).toBeGreaterThan(0);
    expect(ca.some(hasOfficialText)).toBe(false); // live CA data: titles only

    const test = (testFixture as VoterInfo).contests!.filter(isMeasure);
    expect(test.length).toBe(2);
    expect(test.every(hasOfficialText)).toBe(true);
  });
});
