import type { CivicAddress, Source } from "../../shared/civic";
import { t } from "../strings";

/** Google sends some fields in ALL CAPS; title-case those for readability. */
export function tidy(s: string | undefined): string {
  if (!s) return "";
  const trimmed = s.trim();
  if (trimmed !== trimmed.toUpperCase() || !/[A-Z]/.test(trimmed)) return trimmed;
  return trimmed.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

export function addressLines(a: CivicAddress | undefined): string[] {
  if (!a) return [];
  const street = [a.line1, a.line2, a.line3].map(tidy).filter(Boolean);
  const cityLine = [tidy(a.city), [a.state, a.zip].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return [...street, cityLine].filter(Boolean);
}

export function oneLineAddress(a: CivicAddress | undefined): string {
  return addressLines(a).join(", ");
}

/** "2026-11-03" -> "Tuesday, November 3, 2026" (parsed as a local date, not UTC). */
export function longDate(ymd: string): string {
  const d = parseYmd(ymd);
  if (!d) return ymd;
  return d.toLocaleDateString(t.locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export function parseYmd(ymd: string | undefined): Date | null {
  const m = ymd?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function toYmd(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function isOfficial(sources: Source[] | undefined): boolean {
  return !!sources?.some((s) => s.official);
}

export function sourceNames(sources: Source[] | undefined): string {
  return [...new Set((sources ?? []).map((s) => s.name).filter(Boolean))].join(", ");
}

/** Only allow http(s) links from API data into href attributes. */
export function safeUrl(url: string | undefined): string | null {
  if (!url) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`;
  try {
    const u = new URL(withScheme);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export function formatMiles(miles: number): string {
  return miles.toLocaleString(t.locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
