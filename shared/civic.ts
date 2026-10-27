// Types and helpers shared by the Netlify Functions and the browser app.
// Field names mirror the Google Civic Information API v2 responses.

export interface CivicAddress {
  locationName?: string;
  line1?: string;
  line2?: string;
  line3?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface Source {
  name?: string;
  official?: boolean;
}

export interface Election {
  id: string;
  name: string;
  electionDay: string; // YYYY-MM-DD
  ocdDivisionId?: string;
}

export interface PollingLocation {
  address?: CivicAddress;
  notes?: string;
  pollingHours?: string;
  name?: string;
  voterServices?: string;
  startDate?: string;
  endDate?: string;
  latitude?: number;
  longitude?: number;
  sources?: Source[];
}

export interface Channel {
  type: string;
  id: string;
}

export interface Candidate {
  name: string;
  party?: string;
  candidateUrl?: string;
  phone?: string;
  photoUrl?: string;
  email?: string;
  orderOnBallot?: string;
  channels?: Channel[];
}

export interface District {
  name?: string;
  scope?: string;
  id?: string;
}

export interface Contest {
  type?: string;
  ballotTitle?: string;
  office?: string;
  level?: string[];
  roles?: string[];
  district?: District;
  numberElected?: string;
  numberVotingFor?: string;
  ballotPlacement?: string;
  candidates?: Candidate[];
  referendumTitle?: string;
  referendumSubtitle?: string;
  referendumUrl?: string;
  referendumBrief?: string;
  referendumText?: string;
  referendumProStatement?: string;
  referendumConStatement?: string;
  referendumPassageThreshold?: string;
  referendumEffectOfAbstain?: string;
  referendumBallotResponses?: string[];
  sources?: Source[];
}

export interface ElectionOfficial {
  name?: string;
  title?: string;
  officePhoneNumber?: string;
  faxNumber?: string;
  emailAddress?: string;
}

export interface AdministrationBody {
  name?: string;
  electionInfoUrl?: string;
  electionRegistrationUrl?: string;
  electionRegistrationConfirmationUrl?: string;
  electionNoticeText?: string;
  electionNoticeUrl?: string;
  absenteeVotingInfoUrl?: string;
  votingLocationFinderUrl?: string;
  ballotInfoUrl?: string;
  electionRulesUrl?: string;
  voter_services?: string[];
  hoursOfOperation?: string;
  correspondenceAddress?: CivicAddress;
  physicalAddress?: CivicAddress;
  electionOfficials?: ElectionOfficial[];
}

export interface AdministrativeRegion {
  name?: string;
  electionAdministrationBody?: AdministrationBody;
  local_jurisdiction?: AdministrativeRegion;
  sources?: Source[];
}

export interface VoterInfo {
  election?: Election;
  otherElections?: Election[];
  normalizedInput?: CivicAddress;
  pollingLocations?: PollingLocation[];
  earlyVoteSites?: PollingLocation[];
  dropOffLocations?: PollingLocation[];
  contests?: Contest[];
  state?: AdministrativeRegion[];
  mailOnly?: boolean;
  precinctId?: string;
  /** Added by our function: when Google's data was fetched (ISO 8601). */
  fetchedAt?: string;
}

export interface ElectionsResponse {
  elections: Election[];
}

export interface Division {
  ocdId: string;
  name: string;
}

export interface MeasureSummary {
  whatItDoes: string;
  ifPasses: string;
  ifFails: string;
  whoIsAffected: string;
}

export type ExplainResponse =
  | ({ available: true } & MeasureSummary)
  | { available: false; reason: "noOfficialText" | "measureNotFound" };

/** Status codes the app explains to voters in plain English. */
export type StatusCode =
  | "noStreetSegmentFound"
  | "addressUnparseable"
  | "electionOver"
  | "electionUnknown"
  | "multipleStreetSegmentsFound"
  | "noAddressParameter"
  | "badRequest"
  | "rateLimited"
  | "upstreamUnavailable"
  | "aiUnavailable"
  | "unknown";

export interface ApiError {
  error: { code: StatusCode };
}

/**
 * Map a Google Civic API error message to one of our status codes.
 * Google reports most problems as HTTP 400 with a human-readable message,
 * so the message text is the only reliable signal.
 */
export function mapGoogleError(httpStatus: number, message = ""): StatusCode {
  const m = message.toLowerCase();
  if (m.includes("parse address")) return "addressUnparseable";
  if (m.includes("election unknown")) return "electionUnknown";
  if (m.includes("election is over") || m.includes("election over")) return "electionOver";
  if (m.includes("multiple street segments")) return "multipleStreetSegmentsFound";
  if (m.includes("street segment") || m.includes("no address matches") || m.includes("no information"))
    return "noStreetSegmentFound";
  if (m.includes("address") && m.includes("required")) return "noAddressParameter";
  if (httpStatus === 429 || m.includes("quota") || m.includes("rate limit")) return "rateLimited";
  if (httpStatus >= 500 || httpStatus === 403) return "upstreamUnavailable";
  return "unknown";
}

/**
 * Normalize an address so equivalent inputs share one CDN cache entry.
 * Case and whitespace don't change what Google returns.
 */
export function normalizeAddress(input: string): string {
  return input
    .normalize("NFKC")
    .replace(/[\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/[\s,.]+$/, "")
    .trim()
    .toLowerCase();
}

export const MAX_ADDRESS_LENGTH = 200;

export function isValidElectionId(id: string | null | undefined): id is string {
  return !!id && /^\d{1,10}$/.test(id);
}

/** Stable key for a contest's district; Google sometimes omits district.id. */
export function districtKey(contest: Contest): string {
  return contest.district?.id || contest.district?.name || "";
}

export function contestTitle(contest: Contest): string {
  return (contest.office || contest.ballotTitle || contest.referendumTitle || "").trim();
}

export function isMeasure(contest: Contest): boolean {
  return (
    !!contest.referendumTitle ||
    contest.type === "Referendum" ||
    contest.type?.toLowerCase() === "ballot-measure"
  );
}

/** True when Google gave us enough official text for an AI summary. */
export function hasOfficialText(contest: Contest): boolean {
  return !!(
    contest.referendumText ||
    contest.referendumBrief ||
    contest.referendumSubtitle ||
    contest.referendumProStatement ||
    contest.referendumConStatement
  );
}

export interface Officeholder {
  name: string;
  office: string;
  parties: string[];
}

/** F8 is feature-flagged: when off, the client links to free lookup tools instead. */
export type OfficeholdersResponse =
  | { enabled: false }
  | { enabled: true; byDivision: Record<string, Officeholder[]> };

export const MAX_OCD_IDS = 25;

export function isValidOcdId(id: string): boolean {
  return id.length <= 200 && /^ocd-division\/country:[a-z]{2}(\/[a-z_]+:[a-z0-9_.~-]+)*$/i.test(id);
}

/** Sorted and de-duplicated, so the same set of districts always shares one CDN cache entry. */
export function canonicalOcdIds(ids: string[]): string[] {
  return [...new Set(ids)].sort();
}
