import { useSuspenseQuery } from "@tanstack/react-query";
import { Archive } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { archiveDate, archiveFor, archiveLinksQuery } from "@/lib/archive-links";

/**
 * Shows an "Archived copy" link next to a source link, but only when a dated
 * archived copy of that exact source page is held. Reads the public projection
 * of the private evidence list; it never writes to the record.
 */
export function ArchiveCopyLink({
  url,
  className = "text-xs",
}: {
  url: string | null | undefined;
  className?: string;
}) {
  const { data } = useSuspenseQuery(archiveLinksQuery);
  const archive = archiveFor(data, url);
  if (!archive) return null;

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
    <a
      href={archive}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackEvent("archived_copy_clicked", { dataset: datasetForPath(window.location.pathname) })}
      title="Archived copy of this source page"
      className={`inline-flex items-center gap-1 font-medium text-primary hover:underline ${className}`}
    >
      Archived copy <Archive className="h-3 w-3 shrink-0" />
    </a>
    {archiveDate(archive) && <span className="text-xs font-normal text-muted-foreground">Archived {archiveDate(archive)}</span>}
    </span>
  );
}

function datasetForPath(path: string): string {
  if (path.startsWith("/rate-card")) return "fee_database";
  if (path.startsWith("/fees")) return "fee_change_feed";
  if (path.startsWith("/policy-changes")) return "policy_archive";
  return "other";
}
