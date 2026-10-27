import { useEffect, useState } from "react";
import {
  MAX_OCD_IDS,
  type Division,
  type Officeholder,
  type OfficeholdersResponse,
  type StatusCode,
} from "../../shared/civic";
import { fetchDivisions, fetchOfficeholders, LookupError } from "../lib/api";
import { t } from "../strings";
import { ExternalLink } from "./ExternalLink";

/** F7: every district containing the address. F8: who holds office there, when the partner feature is on. */
export function DistrictList({ address }: { address: string }) {
  const [state, setState] = useState<{ divisions?: Division[]; error?: StatusCode }>({});
  const [holders, setHolders] = useState<OfficeholdersResponse | "loading" | "error">("loading");
  const [showIds, setShowIds] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState({});
    setHolders("loading");
    fetchDivisions(address).then(
      (r) => {
        if (cancelled) return;
        setState({ divisions: r.divisions });
        fetchOfficeholders(r.divisions.slice(0, MAX_OCD_IDS).map((d) => d.ocdId))
          .then((h) => !cancelled && setHolders(h))
          .catch(() => !cancelled && setHolders("error"));
      },
      (e) => !cancelled && setState({ error: e instanceof LookupError ? e.code : "unknown" }),
    );
    return () => {
      cancelled = true;
    };
  }, [address]);

  if (state.error) return <p className="text-slate-700">{t.status[state.error]}</p>;
  if (!state.divisions) return <p role="status">{t.districts.loading}</p>;

  // Broadest first: OCD IDs get longer as districts get smaller.
  const sorted = [...state.divisions].sort(
    (a, b) => a.ocdId.split("/").length - b.ocdId.split("/").length || a.name.localeCompare(b.name, t.locale),
  );
  const partnerOn = typeof holders === "object" && holders.enabled;

  return (
    <div className="space-y-3">
      <p className="text-slate-700">{t.districts.intro}</p>
      <button type="button" className="link text-sm" aria-pressed={showIds} onClick={() => setShowIds((s) => !s)}>
        {showIds ? t.districts.hideId : t.districts.showId}
      </button>
      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {sorted.map((d) => (
          <li key={d.ocdId} className="px-3 py-2">
            <span className="font-medium">{d.name}</span>
            {showIds && <code className="mt-0.5 block break-all text-xs text-slate-600">{d.ocdId}</code>}
            {partnerOn && <Holders list={holders.byDivision[d.ocdId]} />}
          </li>
        ))}
      </ul>
      {holders === "loading" && (
        <p role="status" className="text-sm text-slate-700">
          {t.districts.officeholdersLoading}
        </p>
      )}
      {partnerOn ? (
        <p className="text-xs text-slate-600">{t.districts.officeholdersSource}</p>
      ) : (
        holders !== "loading" && <LookupLinks />
      )}
    </div>
  );
}

function Holders({ list }: { list: Officeholder[] | undefined }) {
  if (!list) return null;
  if (!list.length) return <p className="mt-1 text-sm text-slate-600">{t.districts.noOfficeholders}</p>;
  return (
    <div className="mt-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{t.districts.representedBy}</p>
      <ul className="mt-1 space-y-1">
        {list.map((h, i) => (
          <li key={`${h.name}-${i}`} className="text-sm">
            <span className="font-medium">{h.name}</span>
            {h.office && <span className="text-slate-700">, {h.office}</span>}
            {h.parties.length > 0 && <span className="text-slate-600"> ({h.parties.join(", ")})</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Fallback while F8 is off (or the partner is down): free official lookup tools. */
function LookupLinks() {
  return (
    <div className="rounded-lg bg-brand-light p-3">
      <p className="font-semibold">{t.districts.lookupTitle}</p>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        <li>
          <ExternalLink href="https://www.usa.gov/elected-officials">{t.districts.lookupUsaGov}</ExternalLink>
        </li>
        <li>
          <ExternalLink href="https://openstates.org/find_your_legislator/">{t.districts.lookupOpenStates}</ExternalLink>
        </li>
      </ul>
    </div>
  );
}
