import { useEffect, useId, useMemo, useState } from "react";
import type { VoterInfo } from "../../shared/civic";
import { formatMiles, longDate, oneLineAddress, parseYmd, tidy, toYmd } from "../lib/format";
import type { LatLng } from "../lib/geo";
import { downloadIcs, googleCalendarUrl, type CalendarEvent } from "../lib/ics";
import { allLocations, distanceOrigin, withDistances, type LocationType } from "../lib/locations";
import { loadJson, removeKey, saveJson } from "../lib/storage";
import { t } from "../strings";
import { ExternalLink } from "./ExternalLink";

type Method = "election" | "early" | "mail";
const METHODS: Method[] = ["election", "early", "mail"];
const LOCATION_FOR: Record<Method, LocationType> = { election: "election", early: "early", mail: "dropoff" };
const MAIL_BY_POST = "post";

interface Plan {
  method: Method;
  locationId: string;
  locationName: string;
  locationAddress: string;
  date: string;
  start: string;
  end: string;
}

export function VotingPlan({ data, here }: { data: VoterInfo; here: LatLng | null }) {
  const election = data.election;
  const storageKey = `voter-guide:plan:${election?.id ?? "unknown"}`;
  const [saved, setSaved] = useState<Plan | null>(() => loadJson<Plan>(storageKey));
  const [editing, setEditing] = useState(!saved);
  useEffect(() => {
    const p = loadJson<Plan>(storageKey);
    setSaved(p);
    setEditing(!p);
  }, [storageKey]);

  return (
    <section className="space-y-4" aria-labelledby="plan-title">
      <h2 id="plan-title" className="text-xl font-bold">
        {t.plan.title}
      </h2>
      <p className="text-slate-700">{t.plan.intro}</p>
      {saved && !editing && election && (
        <PlanCard
          plan={saved}
          electionName={election.name}
          onEdit={() => setEditing(true)}
          onDelete={() => {
            removeKey(storageKey);
            setSaved(null);
            setEditing(true);
          }}
        />
      )}
      {editing && (
        <PlanForm
          data={data}
          here={here}
          initial={saved}
          onSave={(plan) => {
            saveJson(storageKey, plan);
            setSaved(plan);
            setEditing(false);
          }}
        />
      )}
    </section>
  );
}

function PlanForm({
  data,
  here,
  initial,
  onSave,
}: {
  data: VoterInfo;
  here: LatLng | null;
  initial: Plan | null;
  onSave: (plan: Plan) => void;
}) {
  const id = useId();
  const electionDay = data.election?.electionDay ?? "";
  const today = toYmd(new Date());
  const [method, setMethod] = useState<Method>(initial?.method ?? (data.mailOnly ? "mail" : "election"));
  const [locationId, setLocationId] = useState(initial?.locationId ?? "");
  const [date, setDate] = useState(initial?.date ?? electionDay);
  const [start, setStart] = useState(initial?.start ?? "08:00");
  const [end, setEnd] = useState(initial?.end ?? "09:00");
  const [error, setError] = useState<string | null>(null);

  const origin = useMemo(() => distanceOrigin(data, here)?.origin ?? null, [data, here]);
  const options = useMemo(
    () => withDistances(allLocations(data).filter((l) => l.type === LOCATION_FOR[method]), origin),
    [data, method, origin],
  );
  useEffect(() => {
    setLocationId((prev) =>
      options.some((o) => o.id === prev) || (method === "mail" && prev === MAIL_BY_POST)
        ? prev
        : (options[0]?.id ?? (method === "mail" ? MAIL_BY_POST : "")),
    );
    if (method === "election") setDate(electionDay);
  }, [method, options, electionDay]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = parseYmd(date);
    if (!d || date < today || (electionDay && date > electionDay)) return setError(t.plan.pastDate);
    if (end <= start) return setError(t.plan.invalidTime);
    const loc = options.find((o) => o.id === locationId);
    onSave({
      method,
      locationId,
      locationName: loc ? tidy(loc.address?.locationName || loc.name) : locationId === MAIL_BY_POST ? t.plan.mailByPost : "",
      locationAddress: loc ? oneLineAddress(loc.address) : "",
      date,
      start,
      end,
    });
  };

  return (
    <form className="card space-y-4" onSubmit={submit} noValidate>
      <fieldset>
        <legend className="font-semibold">{t.plan.method}</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {METHODS.map((m) => (
            <label key={m} className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 has-[:checked]:border-brand has-[:checked]:bg-brand-light">
              <input type="radio" name={`${id}-method`} className="h-5 w-5 accent-brand" checked={method === m} onChange={() => setMethod(m)} />
              {t.plan.methods[m]}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`${id}-loc`} className="font-semibold">
          {t.plan.location}
        </label>
        {options.length === 0 && method !== "mail" ? (
          <p className="text-sm text-slate-700">{t.plan.noLocations}</p>
        ) : (
          <select id={`${id}-loc`} className="field mt-1" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
            {method === "mail" && <option value={MAIL_BY_POST}>{t.plan.mailByPost}</option>}
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {tidy(o.address?.locationName || o.name)} – {oneLineAddress(o.address)}
                {o.miles !== undefined ? ` (${t.vote.distance(formatMiles(o.miles))})` : ""}
              </option>
            ))}
          </select>
        )}
        {options.find((o) => o.id === locationId)?.pollingHours && (
          <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
            {t.vote.hours}: {options.find((o) => o.id === locationId)!.pollingHours!.split("\n").slice(-3).join("\n")}
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={`${id}-date`} className="font-semibold">
            {t.plan.date}
          </label>
          <input
            id={`${id}-date`}
            type="date"
            className="field mt-1"
            value={date}
            min={today}
            max={electionDay || undefined}
            disabled={method === "election"}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`${id}-start`} className="font-semibold">
            {t.plan.from}
          </label>
          <input id={`${id}-start`} type="time" className="field mt-1" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <label htmlFor={`${id}-end`} className="font-semibold">
            {t.plan.to}
          </label>
          <input id={`${id}-end`} type="time" className="field mt-1" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>
      <div aria-live="assertive">{error && <p className="font-medium text-red-700">{error}</p>}</div>
      <button type="submit" className="btn-primary w-full sm:w-auto">
        {t.plan.save}
      </button>
    </form>
  );
}

function to12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(t.locale, { hour: "numeric", minute: "2-digit" });
}

function PlanCard({
  plan,
  electionName,
  onEdit,
  onDelete,
}: {
  plan: Plan;
  electionName: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const when = `${longDate(plan.date)}, ${to12h(plan.start)}–${to12h(plan.end)}`;
  const summary = t.plan.summary(t.plan.methods[plan.method], plan.locationName, when);
  const event: CalendarEvent = {
    title: t.plan.eventTitle(electionName),
    description: [summary, plan.locationAddress].filter(Boolean).join("\n"),
    location: [plan.locationName, plan.locationAddress].filter(Boolean).join(", "),
    date: plan.date,
    start: plan.start,
    end: plan.end,
  };
  const shareText = `${t.plan.eventTitle(electionName)}\n${summary}${plan.locationAddress ? `\n${plan.locationAddress}` : ""}`;

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: t.plan.myPlan, text: shareText });
        return;
      } catch {
        // Cancelled or unsupported: fall back to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="card space-y-3 border-brand">
      <h3 className="text-lg font-semibold">{t.plan.myPlan}</h3>
      <p className="text-lg">{summary}</p>
      {plan.locationAddress && <p className="text-slate-700">{plan.locationAddress}</p>}
      <p className="text-sm text-slate-700">{t.plan.reminderNote}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button type="button" className="btn-primary" onClick={() => downloadIcs(event)}>
          {t.plan.addCalendar}
        </button>
        <ExternalLink href={googleCalendarUrl(event)} className="btn-secondary">
          {t.plan.googleCalendar}
        </ExternalLink>
        <button type="button" className="btn-secondary" onClick={share}>
          {t.plan.share}
        </button>
      </div>
      <div aria-live="polite" className="text-sm">
        {copied && t.plan.copied}
      </div>
      <div className="flex gap-4">
        <button type="button" className="link" onClick={onEdit}>
          {t.plan.edit}
        </button>
        <button type="button" className="link text-red-700" onClick={onDelete}>
          {t.plan.remove}
        </button>
      </div>
    </div>
  );
}
