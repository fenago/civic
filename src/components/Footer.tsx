import { t } from "../strings";
import { ExternalLink } from "./ExternalLink";

export function Footer({ onPrivacy }: { onPrivacy: () => void }) {
  return (
    <footer className="no-print border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-3xl space-y-2 px-4 py-5 text-sm text-slate-700">
        <p>
          <ExternalLink href="https://developers.google.com/civic-information">{t.footer.attribution}</ExternalLink>
        </p>
        <p>{t.footer.nonpartisan}</p>
        <p>{t.footer.notOfficial}</p>
        <p>
          <a
            href="?view=privacy"
            className="link"
            onClick={(e) => {
              e.preventDefault();
              onPrivacy();
            }}
          >
            {t.footer.privacy}
          </a>
        </p>
      </div>
    </footer>
  );
}
