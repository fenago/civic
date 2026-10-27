import type { Candidate, Channel } from "../../shared/civic";
import { safeUrl } from "./format";

const CHANNEL_BASE: Record<string, string> = {
  Facebook: "https://www.facebook.com/",
  Twitter: "https://x.com/",
  YouTube: "https://www.youtube.com/",
  Instagram: "https://www.instagram.com/",
  LinkedIn: "https://www.linkedin.com/in/",
};

/** A link for a social channel, or null when we can't build one safely (e.g. retired Google+). */
export function channelUrl(c: Channel): string | null {
  const id = c.id?.trim();
  if (!id) return null;
  if (/^https?:\/\//i.test(id)) return safeUrl(id);
  const base = CHANNEL_BASE[c.type];
  if (!base) return null;
  if (c.type === "YouTube" && /^UC[\w-]{22}$/.test(id)) return `${base}channel/${id}`;
  return safeUrl(base + encodeURIComponent(id.replace(/^@/, "")).replace(/%2F/g, "/"));
}

/** Only load photos over HTTPS (the page's CSP and mixed-content rules require it). */
export function photoUrl(c: Candidate): string | null {
  const url = safeUrl(c.photoUrl);
  if (!url) return null;
  return url.replace(/^http:/, "https:");
}

/** A neutral news search for the candidate's name and office. */
export function newsSearchUrl(name: string, office: string): string {
  const q = `"${name.trim()}" ${office.trim()}`.trim();
  return `https://www.google.com/search?${new URLSearchParams({ q, tbm: "nws" })}`;
}

export function hasContactDetails(c: Candidate): boolean {
  return !!(c.candidateUrl || c.phone || c.email || c.photoUrl || c.channels?.some((ch) => channelUrl(ch)));
}
