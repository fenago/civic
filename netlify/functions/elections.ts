import type { Config } from "@netlify/functions";
import type { ElectionsResponse } from "../../shared/civic";
import { civicGet } from "../lib/google";
import { cachedJson, errorJson, logEvent, TTL } from "../lib/http";

export default async (): Promise<Response> => {
  const result = await civicGet<ElectionsResponse>("/elections", {});
  if (!result.ok) {
    logEvent("elections", "error", { code: result.code });
    return errorJson(result.code, result.httpStatus);
  }
  const elections = (result.data.elections ?? []).map(({ id, name, electionDay, ocdDivisionId }) => ({
    id,
    name,
    electionDay,
    ocdDivisionId,
  }));
  return cachedJson({ elections }, TTL.hour, []);
};

export const config: Config = {
  path: "/api/elections",
  method: "GET",
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
