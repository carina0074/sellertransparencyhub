import { queryOptions } from "@tanstack/react-query";
import { getArchiveLinks } from "./archive-links.functions";

/**
 * Normalizes a source URL for archive lookups: drops the fragment, a trailing
 * slash and case differences, so a record's link and the monitored URL match.
 */
export function normalizeSourceUrl(url: string): string {
  let u = url.trim();
  const fragment = u.indexOf("#");
  if (fragment !== -1) u = u.slice(0, fragment);
  if (u.endsWith("/")) u = u.slice(0, -1);
  return u.toLowerCase();
}

/** Capture timestamp comes from the Wayback URL, never the record review date. */
export function archiveDate(url: string): string | null {
  const match = url.match(/^https:\/\/web\.archive\.org\/web\/(\d{14})(?:[a-z_]+)?\//i);
  if (!match?.[1]) return null;
  const t = match[1];
  const date = new Date(`${t.slice(0,4)}-${t.slice(4,6)}-${t.slice(6,8)}T${t.slice(8,10)}:${t.slice(10,12)}:${t.slice(12,14)}Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
}

/** The archived copy for a source URL, or null when none is held. */
export function archiveFor(
  archiveLinks: Record<string, string> | undefined,
  url: string | null | undefined,
): string | null {
  if (!url || !archiveLinks) return null;
  return archiveLinks[normalizeSourceUrl(url)] ?? null;
}

export const archiveLinksQuery = queryOptions({
  queryKey: ["archive-links"],
  queryFn: async (): Promise<Record<string, string>> => {
    const rows = await getArchiveLinks();
    const map: Record<string, string> = {};
    for (const row of rows) {
      if (row?.url && row?.archive_url) map[normalizeSourceUrl(row.url)] = row.archive_url;
    }
    return map;
  },
  staleTime: 5 * 60 * 1000,
});
