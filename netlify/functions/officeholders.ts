import type { Config } from "@netlify/functions";
import { canonicalOcdIds, isValidOcdId, MAX_OCD_IDS, type OfficeholdersResponse } from "../../shared/civic";
import { fetchOfficeholders } from "../lib/ballotready";
import { cachedJson, errorJson, logEvent, TTL } from "../lib/http";

// F8 (v1.2). Off unless FEATURE_OFFICEHOLDERS=true and PARTNER_API_KEY are set in Netlify.
// Only OCD division IDs are sent to the partner, never the voter's address.
export default async (req: Request): Promise<Response> => {
  const apiKey = process.env.PARTNER_API_KEY;
  if (process.env.FEATURE_OFFICEHOLDERS !== "true" || !apiKey) {
    const off: OfficeholdersResponse = { enabled: false };
    return cachedJson(off, TTL.hour, []);
  }

  const raw = new URL(req.url).searchParams.get("ocdIds") ?? "";
  const ocdIds = canonicalOcdIds(raw.split(",").map((s) => s.trim()).filter(Boolean));
  if (!ocdIds.length || ocdIds.length > MAX_OCD_IDS || !ocdIds.every(isValidOcdId)) {
    return errorJson("badRequest", 400);
  }

  const result = await fetchOfficeholders(ocdIds, apiKey);
  if (!result.ok) {
    logEvent("officeholders", "error");
    return errorJson("upstreamUnavailable", 503);
  }
  logEvent("officeholders", "success", { divisions: ocdIds.length });
  const body: OfficeholdersResponse = { enabled: true, byDivision: result.byDivision };
  return cachedJson(body, TTL.day, ["ocdIds"]);
};

export const config: Config = {
  path: "/api/officeholders",
  method: "GET",
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
