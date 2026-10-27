import type { AdministrationBody, StatusCode } from "../../shared/civic";
import { t } from "../strings";
import { ExternalLink } from "./ExternalLink";

/** A plain-English problem message, always followed by an official place to get help. */
export function StatusMessage({
  code,
  onRetry,
  office,
}: {
  code: StatusCode;
  onRetry?: () => void;
  office?: AdministrationBody;
}) {
  return (
    <section className="card space-y-3 border-amber-300 bg-amber-50" role="alert">
      <h2 tabIndex={-1} className="text-lg font-semibold">
        {t.status[code]}
      </h2>
      {onRetry && (
        <button type="button" className="btn-secondary" onClick={onRetry}>
          {t.common.retry}
        </button>
      )}
      <OfficialHelp office={office} />
    </section>
  );
}

export function OfficialHelp({ office }: { office?: AdministrationBody }) {
  return (
    <div>
      <p className="font-semibold">{t.fallback.title}</p>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        {office?.electionInfoUrl && (
          <li>
            <ExternalLink href={office.electionInfoUrl}>{office.name || t.office.links.electionInfoUrl}</ExternalLink>
          </li>
        )}
        <li>
          <ExternalLink href="https://www.usvotefoundation.org/vote/eoddomestic.htm">{t.fallback.stateLookup}</ExternalLink>
        </li>
        <li>
          <ExternalLink href="https://vote.gov/">{t.fallback.voteGov}</ExternalLink>
        </li>
      </ul>
    </div>
  );
}
