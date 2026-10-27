import type { Config } from "@netlify/functions";
import { isValidElectionId, MAX_ADDRESS_LENGTH, normalizeAddress, type VoterInfo } from "../../shared/civic";
import { civicGet } from "../lib/google";
import { cachedJson, errorJson, logEvent, TTL } from "../lib/http";

export default async (req: Request): Promise<Response> => {
  const params = new URL(req.url).searchParams;
  const address = normalizeAddress(params.get("address") ?? "");
  const electionId = params.get("electionId");

  if (!address) return errorJson("noAddressParameter", 400);
  if (address.length > MAX_ADDRESS_LENGTH) return errorJson("addressUnparseable", 400);
  if (electionId !== null && !isValidElectionId(electionId)) return errorJson("badRequest", 400);

  const query: Record<string, string> = { address };
  if (electionId) query.electionId = electionId;

  const result = await civicGet<VoterInfo>("/voterinfo", query);
  if (!result.ok) {
    logEvent("voterinfo", "error", { code: result.code });
    return errorJson(result.code, result.httpStatus);
  }

  logEvent("voterinfo", "success");
  const body: VoterInfo = { ...result.data, fetchedAt: new Date().toISOString() };
  // Google allows up to 24h without cache headers; we keep 1h so late changes show up.
  return cachedJson(body, TTL.hour, ["address", "electionId"]);
};

export const config: Config = {
  path: "/api/voterinfo",
  method: "GET",
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
