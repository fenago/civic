import { mapGoogleError, type StatusCode } from "../../shared/civic";

const BASE = "https://www.googleapis.com/civicinfo/v2";
const TIMEOUT_MS = 8000;

export type GoogleResult<T> = { ok: true; data: T } | { ok: false; code: StatusCode; httpStatus: number };

/** GET a Civic Information API endpoint with the server-side key. */
export async function civicGet<T>(path: string, params: Record<string, string>): Promise<GoogleResult<T>> {
  const key = process.env.GOOGLE_CIVIC_API_KEY;
  if (!key) return { ok: false, code: "upstreamUnavailable", httpStatus: 503 };

  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", key);

  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch {
    return { ok: false, code: "upstreamUnavailable", httpStatus: 504 };
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return { ok: false, code: "upstreamUnavailable", httpStatus: 502 };
  }

  if (!res.ok) {
    const message = (body as { error?: { message?: string } })?.error?.message;
    const code = mapGoogleError(res.status, message);
    // Our own problems (quota, outages) are 503; problems with the voter's input are 400.
    const httpStatus = code === "upstreamUnavailable" || code === "rateLimited" ? 503 : 400;
    return { ok: false, code, httpStatus };
  }
  return { ok: true, data: body as T };
}
