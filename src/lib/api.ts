import type {
  ApiError,
  Division,
  ElectionsResponse,
  ExplainResponse,
  OfficeholdersResponse,
  StatusCode,
  VoterInfo,
} from "../../shared/civic";
import { canonicalOcdIds, normalizeAddress } from "../../shared/civic";

export class LookupError extends Error {
  constructor(public code: StatusCode) {
    super(code);
  }
}

async function getJson<T>(path: string, params: Record<string, string | undefined>): Promise<T> {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) query.set(k, v);
  let res: Response;
  try {
    res = await fetch(`${path}?${query}`, { headers: { Accept: "application/json" } });
  } catch {
    throw new LookupError("upstreamUnavailable");
  }
  if (res.status === 429) throw new LookupError("rateLimited");
  const body = (await res.json().catch(() => null)) as T | ApiError | null;
  if (!res.ok || !body) throw new LookupError((body as ApiError | null)?.error?.code ?? "unknown");
  return body as T;
}

// Addresses are normalized before the request so equivalent inputs hit the same CDN cache entry.
export const fetchVoterInfo = (address: string, electionId?: string) =>
  getJson<VoterInfo>("/api/voterinfo", { address: normalizeAddress(address), electionId });

export const fetchElections = () => getJson<ElectionsResponse>("/api/elections", {});

export const fetchDivisions = (address: string) =>
  getJson<{ divisions: Division[] }>("/api/divisions", { address: normalizeAddress(address) });

export const fetchExplanation = (p: {
  electionId: string;
  districtId: string;
  title: string;
  address: string;
  lang: "en" | "es";
}) =>
  getJson<ExplainResponse>("/api/explain", {
    // Only electionId, districtId, title and lang form the CDN cache key; the address does not.
    electionId: p.electionId,
    districtId: p.districtId,
    title: p.title,
    lang: p.lang,
    address: normalizeAddress(p.address),
  });

export const fetchOfficeholders = (ocdIds: string[]) =>
  getJson<OfficeholdersResponse>("/api/officeholders", { ocdIds: canonicalOcdIds(ocdIds).join(",") });
