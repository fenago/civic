import { useEffect, useState } from "react";
import type { Division, StatusCode } from "../../shared/civic";
import { fetchDivisions, LookupError } from "../lib/api";
import { t } from "../strings";

/** F7 (used here by the no-election screen): every district containing the address. */
export function DistrictList({ address }: { address: string }) {
  const [state, setState] = useState<{ divisions?: Division[]; error?: StatusCode }>({});
  const [showIds, setShowIds] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState({});
    fetchDivisions(address)
      .then((r) => !cancelled && setState({ divisions: r.divisions }))
      .catch((e) => !cancelled && setState({ error: e instanceof LookupError ? e.code : "unknown" }));
    return () => {
      cancelled = true;
    };
  }, [address]);

  if (state.error) return <p className="text-slate-700">{t.status[state.error]}</p>;
  if (!state.divisions) return <p role="status">{t.districts.loading}</p>;

  // Broadest first: ocd ids get longer as districts get smaller.
  const sorted = [...state.divisions].sort((a, b) => a.ocdId.split("/").length - b.ocdId.split("/").length || a.name.localeCompare(b.name));
  return (
    <div className="space-y-2">
      <p className="text-slate-700">{t.districts.intro}</p>
      <button type="button" className="link text-sm" aria-pressed={showIds} onClick={() => setShowIds((s) => !s)}>
        {showIds ? t.districts.hideId : t.districts.showId}
      </button>
      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
        {sorted.map((d) => (
          <li key={d.ocdId} className="px-3 py-2">
            <span className="font-medium">{d.name}</span>
            {showIds && <code className="mt-0.5 block break-all text-xs text-slate-600">{d.ocdId}</code>}
          </li>
        ))}
      </ul>
    </div>
  );
}
