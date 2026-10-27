import type { StatusCode } from "../../shared/civic";

const HOUR = 60 * 60;

export const TTL = {
  hour: HOUR,
  day: 24 * HOUR,
} as const;

/**
 * JSON response cached at Netlify's CDN (not in the browser).
 * `vary` lists the query parameters that make up the cache key; any other
 * parameter is ignored, which is how voters share one cached entry.
 */
export function cachedJson(body: unknown, ttlSeconds: number, vary: string[]): Response {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    // Browsers revalidate; the CDN holds the shared copy.
    "Cache-Control": "public, max-age=0, must-revalidate",
    "Netlify-CDN-Cache-Control": `public, s-maxage=${ttlSeconds}, stale-while-revalidate=60, durable`,
  });
  headers.set("Netlify-Vary", vary.length ? `query=${vary.join("|")}` : "query");
  return new Response(JSON.stringify(body), { status: 200, headers });
}

export function errorJson(code: StatusCode, httpStatus: number): Response {
  return new Response(JSON.stringify({ error: { code } }), {
    status: httpStatus,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/** Log without ever including the voter's address or other query data. */
export function logEvent(fn: string, event: string, extra: Record<string, string | number> = {}): void {
  console.log(JSON.stringify({ fn, event, ...extra }));
}
