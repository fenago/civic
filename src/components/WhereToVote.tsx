import { lazy, Suspense, useMemo, useState } from "react";
import type { VoterInfo } from "../../shared/civic";
import { addressLines, formatMiles, isOfficial, oneLineAddress, sourceNames, tidy } from "../lib/format";
import type { LatLng } from "../lib/geo";
import {
  allLocations,
  directionsUrl,
  distanceOrigin,
  LOCATION_TYPES,
  withDistances,
  type LocationType,
  type TypedLocation,
} from "../lib/locations";
import { t } from "../strings";
import { ExternalLink } from "./ExternalLink";

// Leaflet is the heaviest dependency; load it after the first screen.
const LocationMap = lazy(() => import("./LocationMap"));

export function WhereToVote({ data, here }: { data: VoterInfo; here: LatLng | null }) {
  // Mail-only precincts lead with drop boxes.
  const order: LocationType[] = data.mailOnly ? ["dropoff", "early", "election"] : LOCATION_TYPES;
  const all = useMemo(() => allLocations(data), [data]);
  const available = order.filter((type) => all.some((l) => l.type === type));
  const [shown, setShown] = useState<Set<LocationType>>(() => new Set(LOCATION_TYPES));

  const origin = useMemo(() => distanceOrigin(data, here), [data, here]);
  const visible = useMemo(
    () => withDistances(all.filter((l) => shown.has(l.type)), origin?.origin ?? null),
    [all, shown, origin?.origin],
  );
  const toggle = (type: LocationType) =>
    setShown((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });

  return (
    <section className="space-y-4" aria-labelledby="vote-title">
      <h2 id="vote-title" className="text-xl font-bold">
        {t.vote.title}
      </h2>

      {data.mailOnly && (
        <div className="card border-brand bg-brand-light">
          <h3 className="font-semibold">{t.vote.mailOnlyTitle}</h3>
          <p className="mt-1">{t.vote.mailOnlyBody}</p>
        </div>
      )}

      {available.length === 0 ? (
        <p className="card">{t.vote.none}</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.vote.filters}>
            {available.map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={shown.has(type)}
                onClick={() => toggle(type)}
                className={`btn min-h-[40px] rounded-full border px-3 py-1 text-sm ${
                  shown.has(type) ? "border-brand bg-brand text-white" : "border-slate-400 bg-white text-ink"
                }`}
              >
                {t.vote.types[type]} ({all.filter((l) => l.type === type).length})
              </button>
            ))}
          </div>

          <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-slate-200 sm:h-96" />}>
            <LocationMap locations={visible} here={here} />
          </Suspense>

          <p className="text-sm text-slate-700" aria-live="polite">
            {t.vote.count(visible.length)}.{" "}
            {origin?.from === "here" ? t.vote.sortedByDistance : origin?.from === "polling" ? t.vote.sortedFromPolling : t.vote.sortHint}{" "}
            {visible.some((l) => l.latitude === undefined) && t.vote.mapNote}
          </p>

          {visible.length === 0 ? (
            <p className="card">{t.vote.none}</p>
          ) : (
            <ol className="space-y-3">
              {visible.slice(0, 50).map((l) => (
                <LocationCard key={l.id} location={l} />
              ))}
            </ol>
          )}
          {visible.length > 50 && <ShowMore rest={visible.slice(50)} />}
        </>
      )}
    </section>
  );
}

function ShowMore({ rest }: { rest: TypedLocation[] }) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button type="button" className="btn-secondary w-full" onClick={() => setOpen(true)}>
        {t.vote.showMore(rest.length)}
      </button>
    );
  return (
    <ol className="space-y-3">
      {rest.map((l) => (
        <LocationCard key={l.id} location={l} />
      ))}
    </ol>
  );
}

function LocationCard({ location: l }: { location: TypedLocation }) {
  const [allHours, setAllHours] = useState(false);
  const hours = (l.pollingHours ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
  const visibleHours = allHours ? hours : hours.slice(0, 3);
  const name = tidy(l.address?.locationName || l.name) || addressLines(l.address)[0];

  return (
    <li className="card space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className={`badge ${l.type === "election" ? "bg-blue-100 text-blue-900" : l.type === "early" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}>
            {t.vote.types[l.type]}
          </span>
          <h3 className="mt-1 font-semibold">{name}</h3>
        </div>
        {l.miles !== undefined && <span className="text-sm font-medium text-slate-700">{t.vote.distance(formatMiles(l.miles))}</span>}
      </div>
      <address className="not-italic text-slate-800">
        {addressLines(l.address).map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </address>
      {(l.startDate || l.endDate) && <p className="text-sm">{t.vote.dates(l.startDate ?? "", l.endDate ?? "")}</p>}
      {hours.length > 0 && (
        <div className="text-sm">
          <p className="font-semibold">{t.vote.hours}</p>
          <ul>
            {visibleHours.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          {hours.length > 3 && (
            <button type="button" className="link mt-1" aria-expanded={allHours} onClick={() => setAllHours((v) => !v)}>
              {allHours ? t.vote.showFewerHours : t.vote.showAllHours(hours.length)}
            </button>
          )}
        </div>
      )}
      {l.notes && <p className="text-sm">{l.notes}</p>}
      {l.voterServices && <p className="text-sm">{l.voterServices}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ExternalLink href={directionsUrl(l, oneLineAddress(l.address))} className="btn-secondary">
          {t.vote.directions}
        </ExternalLink>
        <SourceTag sources={l.sources} />
      </div>
    </li>
  );
}

export function SourceTag({ sources }: { sources: TypedLocation["sources"] }) {
  if (!sources?.length) return null;
  const official = isOfficial(sources);
  return (
    <span className="text-xs text-slate-700">
      <span className={`badge mr-1 ${official ? "bg-emerald-100 text-emerald-900" : "bg-slate-200 text-slate-800"}`}>
        {official ? t.results.official : t.results.unofficial}
      </span>
      {t.results.sourceLabel(sourceNames(sources))}
    </span>
  );
}
