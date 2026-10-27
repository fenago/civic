import { useEffect, useState } from "react";
import { districtKey, type Contest, type ExplainResponse, type StatusCode } from "../../shared/civic";
import { fetchExplanation, LookupError } from "../lib/api";
import { tidy } from "../lib/format";
import { t } from "../strings";
import { ExternalLink } from "./ExternalLink";
import { SourceTag } from "./WhereToVote";

const QUESTIONS = ["whatItDoes", "ifPasses", "ifFails", "whoIsAffected"] as const;

export function MeasureDetail({
  contest,
  electionId,
  address,
  onBack,
}: {
  contest: Contest;
  electionId: string;
  address: string;
  onBack: () => void;
}) {
  const title = contest.referendumTitle ?? contest.ballotTitle ?? "";
  const [summary, setSummary] = useState<ExplainResponse | null>(null);
  const [error, setError] = useState<StatusCode | null>(null);
  const [showText, setShowText] = useState(false);

  // The official text renders immediately; the AI summary loads after it.
  useEffect(() => {
    let cancelled = false;
    setSummary(null);
    setError(null);
    fetchExplanation({ electionId, districtId: districtKey(contest), title, address })
      .then((r) => !cancelled && setSummary(r))
      .catch((e) => !cancelled && setError(e instanceof LookupError ? e.code : "aiUnavailable"));
    return () => {
      cancelled = true;
    };
  }, [contest, electionId, title, address]);

  useEffect(() => {
    document.getElementById("measure-title")?.focus();
  }, []);

  const longText = (contest.referendumText?.length ?? 0) > 600;
  const reportUrl = `https://github.com/fenago/civic/issues/new?${new URLSearchParams({
    title: `Summary problem: ${title}`,
    body: `Election ID: ${electionId}\nMeasure: ${title}\n\nWhat's wrong with the summary?\n`,
  })}`;

  return (
    <article className="space-y-4" aria-labelledby="measure-title">
      <button type="button" className="link no-print" onClick={onBack}>
        ← {t.measure.back}
      </button>
      <header className="card space-y-1">
        <span className="badge bg-violet-100 text-violet-900">{t.ballot.measure}</span>
        <h2 id="measure-title" tabIndex={-1} className="text-2xl font-bold">
          {tidy(title)}
        </h2>
        {contest.referendumSubtitle && <p className="text-lg">{contest.referendumSubtitle}</p>}
        <SourceTag sources={contest.sources} />
      </header>

      <section className="card space-y-3" aria-labelledby="ai-title" aria-busy={!summary && !error}>
        <div>
          <h3 id="ai-title" className="text-lg font-semibold">
            {t.measure.aiTitle}
          </h3>
          <p className="badge mt-1 bg-amber-100 text-amber-900">{t.measure.aiLabel}</p>
        </div>
        {error ? (
          <p>{t.status[error]}</p>
        ) : !summary ? (
          <p role="status" className="animate-pulse text-slate-700">
            {t.measure.aiLoading}
          </p>
        ) : !summary.available ? (
          <p>{t.measure.aiNoText}</p>
        ) : (
          <>
            <dl className="space-y-3">
              {QUESTIONS.map((q) => (
                <div key={q}>
                  <dt className="font-semibold">{t.measure.q[q]}</dt>
                  <dd className="mt-0.5">{summary[q]}</dd>
                </div>
              ))}
            </dl>
            <ExternalLink href={reportUrl} className="link text-sm">
              {t.measure.report}
            </ExternalLink>
          </>
        )}
      </section>

      <section className="card space-y-3" aria-labelledby="official-title">
        <h3 id="official-title" className="flex items-center gap-2 text-lg font-semibold">
          {t.measure.officialTitle}
          <span className="badge bg-emerald-100 text-emerald-900">{t.results.official}</span>
        </h3>
        <Field label={t.measure.threshold} value={contest.referendumPassageThreshold} />
        <Field label={t.measure.abstain} value={contest.referendumEffectOfAbstain} />
        {contest.referendumBrief && <p className="whitespace-pre-line">{contest.referendumBrief}</p>}
        {contest.referendumText &&
          (longText ? (
            <div>
              <button type="button" className="link" aria-expanded={showText} onClick={() => setShowText((s) => !s)}>
                {showText ? t.measure.hideFullText : t.measure.showFullText}
              </button>
              {showText && <p className="mt-2 whitespace-pre-line">{contest.referendumText}</p>}
            </div>
          ) : (
            <Field label={t.measure.fullText} value={contest.referendumText} />
          ))}
        <Statement label={t.measure.pro} text={contest.referendumProStatement} />
        <Statement label={t.measure.con} text={contest.referendumConStatement} />
        {contest.referendumUrl && <ExternalLink href={contest.referendumUrl}>{t.measure.moreInfo}</ExternalLink>}
      </section>
    </article>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="font-semibold">{label}</p>
      <p className="whitespace-pre-line">{value}</p>
    </div>
  );
}

function Statement({ label, text }: { label: string; text?: string }) {
  if (!text) return null;
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="flex items-center gap-2 font-semibold">
        {label} <span className="badge bg-emerald-100 text-emerald-900">{t.results.official}</span>
      </p>
      <p className="mt-1 whitespace-pre-line">{text}</p>
    </div>
  );
}
