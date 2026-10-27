import type { Officeholder } from "../../shared/civic";

// BallotReady (CivicEngine) GraphQL API: https://developers.civicengine.com/docs/api/graphql
const ENDPOINT = "https://bpi.civicengine.com/graphql";
const TIMEOUT_MS = 8000;

interface OfficeHolderNode {
  person?: { fullName?: string } | null;
  parties?: { name?: string }[] | null;
  position?: { name?: string } | null;
}

/**
 * Current officeholders for each OCD division, in one request: one aliased
 * `officeHolders(division: ...)` field per division, passed as variables.
 */
export function buildQuery(ocdIds: string[]): { query: string; variables: Record<string, unknown> } {
  const vars = ocdIds.map((_, i) => `$d${i}: DivisionFilter`).join(", ");
  const fields = ocdIds
    .map(
      (_, i) => `d${i}: officeHolders(division: $d${i}, filterBy: { isCurrent: true }, first: 25) {
    nodes { person { fullName } parties { name } position { name } }
  }`,
    )
    .join("\n  ");
  const variables = Object.fromEntries(ocdIds.map((id, i) => [`d${i}`, { ocdId: id, recursive: false }]));
  return { query: `query Officeholders(${vars}) {\n  ${fields}\n}`, variables };
}

export type PartnerResult = { ok: true; byDivision: Record<string, Officeholder[]> } | { ok: false };

export async function fetchOfficeholders(ocdIds: string[], apiKey: string): Promise<PartnerResult> {
  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(buildQuery(ocdIds)),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return { ok: false };
  }
  if (!res.ok) return { ok: false };

  const body = (await res.json().catch(() => null)) as {
    data?: Record<string, { nodes?: OfficeHolderNode[] } | null>;
    errors?: unknown[];
  } | null;
  if (!body?.data) return { ok: false };

  const byDivision: Record<string, Officeholder[]> = {};
  ocdIds.forEach((id, i) => {
    byDivision[id] = (body.data![`d${i}`]?.nodes ?? [])
      .filter((n) => n.person?.fullName)
      .map((n) => ({
        name: n.person!.fullName!,
        office: n.position?.name ?? "",
        parties: (n.parties ?? []).map((p) => p.name).filter((p): p is string => !!p),
      }));
  });
  return { ok: true, byDivision };
}
