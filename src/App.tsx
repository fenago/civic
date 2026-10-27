import { useEffect, useRef, useState } from "react";
import type { StatusCode, VoterInfo } from "../shared/civic";
import { AddressForm } from "./components/AddressForm";
import { ElectionPicker } from "./components/ElectionPicker";
import { Footer } from "./components/Footer";
import { NoElection } from "./components/NoElection";
import { NoticeBanner } from "./components/NoticeBanner";
import { Privacy } from "./components/Privacy";
import { Results } from "./components/Results";
import { StatusMessage } from "./components/StatusMessage";
import { fetchVoterInfo, LookupError } from "./lib/api";
import type { LatLng } from "./lib/geo";
import { useUrlState } from "./lib/url-state";
import { initialLang, setLang, t, type Lang } from "./strings";

type Lookup =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; code: StatusCode }
  | { kind: "ok"; data: VoterInfo };

const NO_ELECTION_CODES: StatusCode[] = ["electionUnknown", "electionOver"];

export default function App() {
  const [url, setUrl] = useUrlState();
  const lang: Lang = url.lang ?? initialLang();
  // Swap the active strings before anything below renders with them.
  if (t.lang !== lang) setLang(lang);
  const [lookup, setLookup] = useState<Lookup>({ kind: "idle" });
  const [attempt, setAttempt] = useState(0);
  // Coordinates from "Use my location", kept in memory only, used to sort locations by distance.
  const [here, setHere] = useState<LatLng | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!url.address) {
      setLookup({ kind: "idle" });
      return;
    }
    let cancelled = false;
    setLookup({ kind: "loading" });
    fetchVoterInfo(url.address, url.electionId)
      .then((data) => !cancelled && setLookup({ kind: "ok", data }))
      .catch((err) => !cancelled && setLookup({ kind: "error", code: err instanceof LookupError ? err.code : "unknown" }));
    return () => {
      cancelled = true;
    };
  }, [url.address, url.electionId, attempt]);

  // Move focus to the new content when a lookup finishes so screen readers announce it.
  useEffect(() => {
    if (lookup.kind === "ok" || lookup.kind === "error") {
      mainRef.current?.querySelector<HTMLElement>("h1, h2")?.focus();
    }
  }, [lookup.kind]);

  const submitAddress = (address: string, coords: LatLng | null) => {
    setHere(coords);
    setUrl({ address, electionId: undefined, tab: "vote", measure: undefined, contest: undefined, view: undefined });
  };

  const data = lookup.kind === "ok" ? lookup.data : null;
  const needsElectionChoice = !!data?.otherElections?.length && !url.electionId;

  let content: React.ReactNode;
  if (url.view === "privacy") {
    content = <Privacy onBack={() => setUrl({ view: undefined })} />;
  } else if (!url.address) {
    content = <AddressForm initial="" onSubmit={submitAddress} busy={false} />;
  } else if (lookup.kind === "loading" || lookup.kind === "idle") {
    content = (
      <div className="card" role="status" aria-live="polite">
        <p className="text-lg">{t.address.loading}</p>
      </div>
    );
  } else if (lookup.kind === "error" && NO_ELECTION_CODES.includes(lookup.code)) {
    content = (
      <NoElection
        address={url.address}
        code={lookup.code}
        onChangeAddress={() => setUrl({ address: "", electionId: undefined })}
      />
    );
  } else if (lookup.kind === "error") {
    content = (
      <>
        <StatusMessage
          code={lookup.code}
          onRetry={["upstreamUnavailable", "rateLimited", "unknown"].includes(lookup.code) ? () => setAttempt((n) => n + 1) : undefined}
        />
        <AddressForm initial={url.address} onSubmit={submitAddress} busy={false} />
      </>
    );
  } else if (data && needsElectionChoice) {
    content = (
      <ElectionPicker
        elections={[...(data.election ? [data.election] : []), ...(data.otherElections ?? [])]}
        onPick={(id) => setUrl({ electionId: id })}
      />
    );
  } else if (data) {
    content = (
      <Results
        data={data}
        url={url}
        setUrl={setUrl}
        here={here}
        onChangeAddress={() => setUrl({ address: "", electionId: undefined, measure: undefined, contest: undefined, tab: "vote" })}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[2000] focus:rounded focus:bg-white focus:p-2">
        {t.skipToContent}
      </a>
      <header className="no-print bg-brand text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setUrl({ address: "", electionId: undefined, measure: undefined, contest: undefined, view: undefined, tab: "vote" });
            }}
            className="text-xl font-bold tracking-tight"
          >
            {t.appName}
          </a>
          <button
            type="button"
            lang={t.language.switchLang}
            aria-label={t.language.switchAria}
            onClick={() => {
              const next = t.language.switchLang;
              setLang(next);
              setUrl({ lang: next }, { replace: true });
            }}
            className="min-h-[44px] rounded-lg border border-white/60 px-3 text-sm font-semibold hover:bg-white/10"
          >
            {t.language.switchLabel}
          </button>
        </div>
      </header>
      {data && url.view !== "privacy" && <NoticeBanner data={data} />}
      <main id="main" ref={mainRef} className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-5">
        {content}
      </main>
      <Footer onPrivacy={() => setUrl({ view: "privacy" })} />
    </div>
  );
}
