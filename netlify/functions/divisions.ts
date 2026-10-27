import type { Config } from "@netlify/functions";
import { MAX_ADDRESS_LENGTH, normalizeAddress, type Division } from "../../shared/civic";
import { civicGet } from "../lib/google";
import { cachedJson, errorJson, logEvent, TTL } from "../lib/http";

interface DivisionsByAddress {
  divisions?: Record<string, { name?: string }>;
}

export default async (req: Request): Promise<Response> => {
  const address = normalizeAddress(new URL(req.url).searchParams.get("address") ?? "");
  if (!address) return errorJson("noAddressParameter", 400);
  if (address.length > MAX_ADDRESS_LENGTH) return errorJson("addressUnparseable", 400);

  const result = await civicGet<DivisionsByAddress>("/divisionsByAddress", { address });
  if (!result.ok) {
    logEvent("divisions", "error", { code: result.code });
    return errorJson(result.code, result.httpStatus);
  }

  const divisions: Division[] = Object.entries(result.data.divisions ?? {}).map(([ocdId, d]) => ({
    ocdId,
    name: d.name ?? ocdId,
  }));
  logEvent("divisions", "success");
  return cachedJson({ divisions }, TTL.day, ["address"]);
};

export const config: Config = {
  path: "/api/divisions",
  method: "GET",
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
