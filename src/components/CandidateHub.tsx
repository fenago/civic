import { useEffect, useState } from "react";
import { contestTitle, type Candidate, type Contest } from "../../shared/civic";
import { candidatesInOrder } from "../lib/ballot";
import { channelUrl, hasContactDetails, newsSearchUrl, photoUrl } from "../lib/candidates";
import { tidy } from "../lib/format";
import { t } from "../strings";
import { ExternalLink } from "./ExternalLink";
import { SourceTag } from "./WhereToVote";

/** F4: one card per candidate in a race, in ballot order, showing only what officials provided. */
export function CandidateHub({ contest, onBack }: { contest: Contest; onBack: () => void }) {
  const office = tidy(contestTitle(contest)) || t.ballot.untitled;

  useEffect(() => {
    document.getElementById("contest-title")?.focus();
  }, []);

  return (
    <article className="space-y-4" aria-labelledby="contest-title">
      <button type="button" className="link no-print" onClick={onBack}>
        ← {t.candidate.back}
      </button>
      <header className="card space-y-1">
        <h2 id="contest-title" tabIndex={-1} className="text-2xl font-bold">
          {office}
        </h2>
        {contest.district?.name && <p className="text-slate-700">{tidy(contest.district.name)}</p>}
        {contest.numberVotingFor && <p className="font-semibold">{t.ballot.voteFor(contest.numberVotingFor)}</p>}
        <p className="text-sm text-slate-700">{t.candidate.intro}</p>
        <SourceTag sources={contest.sources} />
      </header>
      <ol className="space-y-3">
        {candidatesInOrder(contest).map((c, i) => (
          <li key={`${c.name}-${i}`}>
            <CandidateCard candidate={c} office={office} />
          </li>
        ))}
      </ol>
    </article>
  );
}

function CandidateCard({ candidate: c, office }: { candidate: Candidate; office: string }) {
  const name = tidy(c.name);
  const photo = photoUrl(c);
  const [photoOk, setPhotoOk] = useState(true);
  const channels = (c.channels ?? [])
    .map((ch) => ({ ch, url: channelUrl(ch) }))
    .filter((x): x is { ch: typeof x.ch; url: string } => !!x.url);

  return (
    <section className="card space-y-3" aria-label={name}>
      <div className="flex items-start gap-4">
        {photo && photoOk && (
          <img
            src={photo}
            alt={t.candidate.photoAlt(name)}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setPhotoOk(false)}
            className="h-20 w-20 shrink-0 rounded-lg border border-slate-200 object-cover"
          />
        )}
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-slate-700">
            <span className="sr-only">{t.candidate.party}: </span>
            {c.party ? tidy(c.party) : t.candidate.noParty}
          </p>
        </div>
      </div>

      {hasContactDetails(c) ? (
        <dl className="grid gap-2 sm:grid-cols-2">
          {c.candidateUrl && (
            <div>
              <dt className="text-sm font-semibold">{t.candidate.website}</dt>
              <dd className="break-all">
                <ExternalLink href={c.candidateUrl}>{c.candidateUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}</ExternalLink>
              </dd>
            </div>
          )}
          {c.phone && (
            <div>
              <dt className="text-sm font-semibold">{t.candidate.phone}</dt>
              <dd>
                <a className="link" href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}>
                  {c.phone}
                </a>
              </dd>
            </div>
          )}
          {c.email && (
            <div>
              <dt className="text-sm font-semibold">{t.candidate.email}</dt>
              <dd className="break-all">
                <a className="link" href={`mailto:${c.email}`}>
                  {c.email}
                </a>
              </dd>
            </div>
          )}
          {channels.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-semibold">{t.candidate.social}</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {channels.map(({ ch, url }) => (
                  <ExternalLink key={`${ch.type}-${ch.id}`} href={url} className="btn-secondary min-h-[40px] py-1 text-sm">
                    {t.candidate.channels[ch.type] ?? ch.type}
                  </ExternalLink>
                ))}
              </dd>
            </div>
          )}
        </dl>
      ) : (
        <p className="text-sm text-slate-700">{t.candidate.noDetails}</p>
      )}

      <div>
        <ExternalLink href={newsSearchUrl(name, office)} className="btn-secondary">
          {t.candidate.searchNews}
        </ExternalLink>
        <p className="mt-1 text-xs text-slate-600">{t.candidate.newsNote}</p>
      </div>
    </section>
  );
}
