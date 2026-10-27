import type { VoterInfo } from "../../shared/civic";
import { t } from "../strings";
import { ExternalLink } from "./ExternalLink";

/** Emergency or general notice from election officials, shown at the top of every screen. */
export function NoticeBanner({ data }: { data: VoterInfo }) {
  const notices = (data.state ?? []).flatMap((s) =>
    [s.electionAdministrationBody, s.local_jurisdiction?.electionAdministrationBody].filter(
      (b) => b?.electionNoticeText,
    ),
  );
  if (!notices.length) return null;
  return (
    <div role="region" aria-label={t.notice.label} className="border-b border-amber-300 bg-amber-100">
      <div className="mx-auto max-w-3xl space-y-2 px-4 py-3">
        {notices.map((b, i) => (
          <p key={i}>
            <strong>{t.notice.label}: </strong>
            {b!.electionNoticeText}{" "}
            {b!.electionNoticeUrl && <ExternalLink href={b!.electionNoticeUrl}>{t.notice.more}</ExternalLink>}
          </p>
        ))}
      </div>
    </div>
  );
}
