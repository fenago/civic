import { safeUrl } from "../lib/format";
import { t } from "../strings";

export function ExternalLink({ href, children, className = "link" }: { href?: string; children: React.ReactNode; className?: string }) {
  const url = safeUrl(href);
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> {t.common.opensNewTab}</span>
    </a>
  );
}
