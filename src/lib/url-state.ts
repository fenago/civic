import { useCallback, useEffect, useState } from "react";

export type Tab = "vote" | "ballot" | "plan" | "office" | "districts";
export const TABS: Tab[] = ["vote", "ballot", "plan", "office", "districts"];

export interface UrlState {
  address: string;
  electionId?: string;
  tab: Tab;
  /** Contest key of the ballot measure being read, if any. */
  measure?: string;
  /** Contest key of the race whose candidates are being viewed, if any. */
  contest?: string;
  lang?: "en" | "es";
  view?: "privacy";
}

function read(): UrlState {
  const p = new URLSearchParams(window.location.search);
  const tab = p.get("tab") as Tab | null;
  return {
    address: p.get("address") ?? "",
    electionId: p.get("electionId") ?? undefined,
    tab: tab && TABS.includes(tab) ? tab : "vote",
    measure: p.get("measure") ?? undefined,
    contest: p.get("contest") ?? undefined,
    lang: p.get("lang") === "es" ? "es" : p.get("lang") === "en" ? "en" : undefined,
    view: p.get("view") === "privacy" ? "privacy" : undefined,
  };
}

function write(s: UrlState): string {
  const p = new URLSearchParams();
  if (s.address) p.set("address", s.address);
  if (s.electionId) p.set("electionId", s.electionId);
  if (s.address && s.tab !== "vote") p.set("tab", s.tab);
  if (s.measure) p.set("measure", s.measure);
  if (s.contest) p.set("contest", s.contest);
  if (s.lang) p.set("lang", s.lang);
  if (s.view) p.set("view", s.view);
  const q = p.toString();
  return q ? `?${q}` : window.location.pathname;
}

/**
 * App state lives in the query string: links are shareable, the back button works,
 * and the address is never stored anywhere but the URL and the voter's browser.
 */
export function useUrlState(): [UrlState, (next: Partial<UrlState>, opts?: { replace?: boolean }) => void] {
  const [state, setState] = useState(read);

  useEffect(() => {
    const onPop = () => setState(read());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const update = useCallback((next: Partial<UrlState>, opts?: { replace?: boolean }) => {
    setState((prev) => {
      const merged = { ...prev, ...next };
      const url = write(merged);
      if (opts?.replace) window.history.replaceState(null, "", url);
      else window.history.pushState(null, "", url);
      return merged;
    });
  }, []);

  return [state, update];
}
