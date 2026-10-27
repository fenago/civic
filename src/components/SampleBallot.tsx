import { useEffect, useState } from "react";
import { contestTitle, isMeasure, normalizeAddress, type Contest, type VoterInfo } from "../../shared/civic";
import { candidatesInOrder, contestKey, groupContests } from "../lib/ballot";
import { tidy } from "../lib/format";
import { loadJson, removeKey, saveJson } from "../lib/storage";
import { t } from "../strings";
import { CandidateHub } from "./CandidateHub";
import { MeasureDetail } from "./MeasureDetail";
import { SourceTag } from "./WhereToVote";

type Marks = Record<string, string[]>;

function marksKey(electionId: string, address: string): string {
  let h = 0;
  for (const ch of normalizeAddress(address)) h = (Math.imul(31, h) + ch.charCodeAt(0)) | 0;
  return `voter-guide:marks:${electionId}:${(h >>> 0).toString(36)}`;
}

export function SampleBallot({
  data,
  address,
  openMeasure,
  onOpenMeasure,
  openContest,
  onOpenContest,
}: {
  data: VoterInfo;
  address: string;
  openMeasure?: string;
  onOpenMeasure: (key: string | undefined) => void;
  openContest?: string;
  onOpenContest: (key: string | undefined) => void;
}) {
  const electionId = data.election?.id ?? "unknown";
  const storageKey = marksKey(electionId, address);
  const [marks, setMarks] = useState<Marks>(() => loadJson<Marks>(storageKey) ?? {});
  useEffect(() => setMarks(loadJson<Marks>(storageKey) ?? {}), [storageKey]);

  const update = (key: string, values: string[]) => {
    setMarks((prev) => {
      const next = { ...prev, [key]: values };
      saveJson(storageKey, next);
      return next;
    });
  };

  const contests = data.contests ?? [];
  const measure = openMeasure ? contests.find((c) => contestKey(c) === openMeasure) : undefined;
  if (measure && data.election) {
    return (
      <MeasureDetail
        contest={measure}
        electionId={data.election.id}
        address={address}
        onBack={() => onOpenMeasure(undefined)}
      />
    );
  }

  const race = openContest ? contests.find((c) => contestKey(c) === openContest && !isMeasure(c)) : undefined;
  if (race) return <CandidateHub contest={race} onBack={() => onOpenContest(undefined)} />;

  const groups = groupContests(contests);
  const onlyOther = groups.length === 1 && groups[0].group === "other";

  return (
    <section className="space-y-4" aria-labelledby="ballot-title">
      <h2 id="ballot-title" className="text-xl font-bold">
        {t.ballot.title}
      </h2>
      <p className="text-slate-700">{t.ballot.intro}</p>
      {contests.length === 0 ? (
        <p className="card">{t.ballot.noContests}</p>
      ) : (
        <>
          <p className="text-sm text-slate-700">{t.ballot.marksNote}</p>
          <div className="no-print flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={() => window.print()}>
              {t.ballot.print}
            </button>
            {Object.values(marks).some((v) => v.length) && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  removeKey(storageKey);
                  setMarks({});
                }}
              >
                {t.ballot.clearMarks}
              </button>
            )}
          </div>
          {groups.map(({ group, contests }) => (
            <section key={group} aria-labelledby={`group-${group}`} className="space-y-3">
              <h3 id={`group-${group}`} className={onlyOther ? "sr-only" : "border-b border-slate-300 pb-1 text-lg font-bold"}>
                {t.ballot.groups[group]}
              </h3>
              <ol className="space-y-3">
                {contests.map((c) => {
                  const key = contestKey(c);
                  return (
                    <li key={key} id={key}>
                      {isMeasure(c) ? (
                        <MeasureCard contest={c} selected={marks[key] ?? []} onChange={(v) => update(key, v)} onRead={() => onOpenMeasure(key)} />
                      ) : (
                        <CandidateContest
                          contest={c}
                          selected={marks[key] ?? []}
                          onChange={(v) => update(key, v)}
                          onResearch={() => onOpenContest(key)}
                        />
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </>
      )}
    </section>
  );
}

function CandidateContest({
  contest,
  selected,
  onChange,
  onResearch,
}: {
  contest: Contest;
  selected: string[];
  onChange: (v: string[]) => void;
  onResearch: () => void;
}) {
  const title = tidy(contestTitle(contest)) || t.ballot.untitled;
  const limit = contest.numberVotingFor;
  const over = limit !== undefined && Number(limit) > 0 && selected.length > Number(limit);
  const candidates = candidatesInOrder(contest);
  return (
    <fieldset className="card space-y-2">
      <legend className="sr-only">{title}</legend>
      <div aria-hidden="true">
        <p className="text-lg font-semibold">{title}</p>
        {contest.district?.name && <p className="text-sm text-slate-700">{tidy(contest.district.name)}</p>}
      </div>
      {limit && <p className="text-sm font-semibold">{t.ballot.voteFor(limit)}</p>}
      <ul className="space-y-1">
        {candidates.map((cand, i) => {
          const value = cand.name;
          const id = `${contestKey(contest)}-${i}`;
          return (
            <li key={id}>
              <label htmlFor={id} className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-slate-100">
                <input
                  id={id}
                  type="checkbox"
                  className="h-5 w-5 accent-brand"
                  checked={selected.includes(value)}
                  onChange={(e) => onChange(e.target.checked ? [...selected, value] : selected.filter((s) => s !== value))}
                />
                <span>
                  <span className="font-medium">{tidy(cand.name)}</span>
                  <span className="block text-sm text-slate-700">{cand.party ? tidy(cand.party) : t.candidate.noParty}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {over && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {t.ballot.tooMany(limit!)}
        </p>
      )}
      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        {candidates.length > 0 && (
          <button type="button" className="btn-secondary" onClick={onResearch}>
            {t.ballot.research}
          </button>
        )}
        <SourceTag sources={contest.sources} />
      </div>
    </fieldset>
  );
}

function MeasureCard({
  contest,
  selected,
  onChange,
  onRead,
}: {
  contest: Contest;
  selected: string[];
  onChange: (v: string[]) => void;
  onRead: () => void;
}) {
  const title = tidy(contest.referendumTitle || contestTitle(contest)) || t.ballot.untitled;
  const responses = contest.referendumBallotResponses?.length ? contest.referendumBallotResponses : [t.ballot.yes, t.ballot.no];
  const name = `m-${contestKey(contest)}`;
  return (
    <fieldset className="card space-y-2">
      <legend className="sr-only">{title}</legend>
      <div aria-hidden="true">
        <span className="badge bg-violet-100 text-violet-900">{t.ballot.measure}</span>
        <p className="mt-1 text-lg font-semibold">{title}</p>
        {contest.referendumSubtitle && <p className="text-slate-800">{contest.referendumSubtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {responses.map((r) => (
          <label key={r} className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3">
            <input
              type="radio"
              name={name}
              className="h-5 w-5 accent-brand"
              checked={selected[0] === r}
              onChange={() => onChange([r])}
            />
            {tidy(r)}
          </label>
        ))}
      </div>
      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        <button type="button" className="btn-secondary" onClick={onRead}>
          {t.ballot.readMeasure}
        </button>
        <SourceTag sources={contest.sources} />
      </div>
    </fieldset>
  );
}
