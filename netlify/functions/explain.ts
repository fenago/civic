import Anthropic from "@anthropic-ai/sdk";
import type { Config } from "@netlify/functions";
import {
  districtKey,
  hasOfficialText,
  isValidElectionId,
  MAX_ADDRESS_LENGTH,
  normalizeAddress,
  type ExplainResponse,
  type VoterInfo,
} from "../../shared/civic";
import { cachedJson, errorJson, logEvent, TTL } from "../lib/http";
import { summarizeMeasure } from "../lib/summarize";

// Only these parameters form the CDN cache key, so every voter who sees the same
// measure in the same language shares one summary. The address is needed only on a cache miss.
const CACHE_KEY_PARAMS = ["electionId", "districtId", "title", "lang"];

export default async (req: Request): Promise<Response> => {
  const params = new URL(req.url).searchParams;
  const electionId = params.get("electionId");
  const districtId = params.get("districtId") ?? "";
  const title = params.get("title") ?? "";
  const address = normalizeAddress(params.get("address") ?? "");
  const lang = params.get("lang") === "es" ? "es" : "en";

  if (!isValidElectionId(electionId) || !title || title.length > 300 || districtId.length > 300) {
    return errorJson("badRequest", 400);
  }
  if (!address || address.length > MAX_ADDRESS_LENGTH) return errorJson("noAddressParameter", 400);
  if (!process.env.ANTHROPIC_API_KEY) return errorJson("aiUnavailable", 503);

  // Read the measure from our own /api/voterinfo so the lookup is usually a CDN hit.
  const voterInfoUrl = new URL("/api/voterinfo", req.url);
  voterInfoUrl.search = new URLSearchParams({ address, electionId }).toString();
  let info: VoterInfo;
  try {
    const res = await fetch(voterInfoUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return errorJson("upstreamUnavailable", 503);
    info = (await res.json()) as VoterInfo;
  } catch {
    return errorJson("upstreamUnavailable", 503);
  }

  const contest = info.contests?.find(
    (c) => (c.referendumTitle ?? c.ballotTitle) === title && districtKey(c) === districtId,
  );
  if (!contest) {
    const body: ExplainResponse = { available: false, reason: "measureNotFound" };
    return cachedJson(body, TTL.hour, CACHE_KEY_PARAMS);
  }
  if (!hasOfficialText(contest)) {
    // Never summarize a title alone; that would mean guessing. Re-check hourly in case text is added.
    const body: ExplainResponse = { available: false, reason: "noOfficialText" };
    return cachedJson(body, TTL.hour, CACHE_KEY_PARAMS);
  }

  try {
    const summary = await summarizeMeasure(contest, lang);
    logEvent("explain", "success");
    const body: ExplainResponse = { available: true, ...summary };
    return cachedJson(body, TTL.day, CACHE_KEY_PARAMS);
  } catch (err) {
    const kind = err instanceof Anthropic.APIError ? `api_${err.status ?? "conn"}` : (err as Error).name;
    logEvent("explain", "error", { kind });
    return errorJson("aiUnavailable", 503);
  }
};

export const config: Config = {
  path: "/api/explain",
  method: "GET",
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
