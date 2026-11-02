import { useQuery } from "@tanstack/react-query";
import { Archive } from "lucide-react";
import { archiveFor, archiveLinksQuery } from "@/lib/archive-links";

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
  const { data } = useQuery(archiveLinksQuery);
  const archive = archiveFor(data, url);
  if (!archive) return null;

  return (
    <a
      href={archive}
      target="_blank"
      rel="noreferrer"
      title="Archived copy of this source page"
      className={`inline-flex items-center gap-1 font-medium text-primary hover:underline ${className}`}
    >
      Archived copy <Archive className="h-3 w-3 shrink-0" />
    </a>
  );
}
