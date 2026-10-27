import { en, type Strings } from "./en";
import { es } from "./es";

export type Lang = "en" | "es";
const LANG_KEY = "voter-guide:lang";

/**
 * The active strings. Components read `t` during render; `setLang` swaps it
 * (ES module live binding) and App re-renders the tree.
 */
export let t: Strings = en;

export function setLang(lang: Lang): void {
  t = lang === "es" ? es : en;
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
    document.title = t.appName;
  }
  try {
    window.localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Storage unavailable: the choice still holds for this page view.
  }
}

/** URL first (shared links keep their language), then the saved choice, then the browser. */
export function initialLang(): Lang {
  const fromUrl = new URLSearchParams(window.location.search).get("lang");
  if (fromUrl === "es" || fromUrl === "en") return fromUrl;
  try {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved === "es" || saved === "en") return saved;
  } catch {
    // ignore
  }
  return navigator.language?.toLowerCase().startsWith("es") ? "es" : "en";
}
