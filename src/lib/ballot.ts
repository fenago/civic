import type { Contest } from "../../shared/civic";

export type LevelGroup = "federal" | "state" | "county" | "city" | "school" | "special" | "other";

export const GROUP_ORDER: LevelGroup[] = ["federal", "state", "county", "city", "school", "special", "other"];

const LEVEL_MAP: Record<string, LevelGroup> = {
  country: "federal",
  international: "federal",
  administrativeArea1: "state",
  regional: "county",
  administrativeArea2: "county",
  locality: "city",
  subLocality1: "city",
  subLocality2: "city",
  special: "special",
};

const SCOPE_MAP: Record<string, LevelGroup> = {
  national: "federal",
  congressional: "federal",
  statewide: "state",
  stateUpper: "state",
  stateLower: "state",
  countywide: "county",
  countyCouncil: "county",
  judicial: "county",
  citywide: "city",
  cityCouncil: "city",
  township: "city",
  ward: "city",
  schoolBoard: "school",
  special: "special",
};

const SCHOOL_PATTERN = /\bschool\b|board of education|unified|community college/i;

export function levelGroup(c: Contest): LevelGroup {
  const label = `${c.office ?? ""} ${c.ballotTitle ?? ""} ${c.district?.name ?? ""}`;
  if (c.district?.scope === "schoolBoard" || c.roles?.includes("schoolBoard") || SCHOOL_PATTERN.test(label)) {
    return "school";
  }
  for (const level of c.level ?? []) if (LEVEL_MAP[level]) return LEVEL_MAP[level];
  if (c.district?.scope && SCOPE_MAP[c.district.scope]) return SCOPE_MAP[c.district.scope];
  return "other";
}

function placement(c: Contest): number {
  const n = Number(c.ballotPlacement);
  return Number.isFinite(n) && c.ballotPlacement !== undefined && c.ballotPlacement !== "" ? n : Infinity;
}

/** Contests in ballot order. The sort is stable, so contests without a placement keep Google's order. */
export function inBallotOrder(contests: Contest[]): Contest[] {
  return [...contests].sort((a, b) => placement(a) - placement(b));
}

export function groupContests(contests: Contest[]): { group: LevelGroup; contests: Contest[] }[] {
  const ordered = inBallotOrder(contests);
  return GROUP_ORDER.map((group) => ({ group, contests: ordered.filter((c) => levelGroup(c) === group) })).filter(
    (g) => g.contests.length > 0,
  );
}

/** Candidates exactly as the ballot lists them: by orderOnBallot, else Google's order. */
export function candidatesInOrder(c: Contest) {
  const list = c.candidates ?? [];
  const pos = (x: { orderOnBallot?: string }) => {
    const n = Number(x.orderOnBallot);
    return x.orderOnBallot && Number.isFinite(n) ? n : Infinity;
  };
  return [...list].sort((a, b) => pos(a) - pos(b));
}

/** Stable per-contest key for anchors and saved marks. */
export function contestKey(c: Contest): string {
  const raw = `${c.ballotPlacement ?? ""}|${c.district?.id ?? c.district?.name ?? ""}|${c.office ?? c.ballotTitle ?? c.referendumTitle ?? ""}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0;
  return `c${(h >>> 0).toString(36)}`;
}
