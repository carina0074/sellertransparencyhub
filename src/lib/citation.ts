/**
 * Pure citation, version-label and CSV helpers shared by /cite, the
 * "Cite this record" links and the dataset CSV downloads.
 */
export const SITE_URL = "https://sellertransparency.com";
export const PUBLISHER = "Seller Transparency Hub";

export const DATA_LICENSE_NAME = "Creative Commons Attribution 4.0 International License (CC BY 4.0)";
export const DATA_LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/legalcode";
/** Taken from LICENSE-DATA. */
export const DATA_LICENSE_LINE =
  `Data license: ${DATA_LICENSE_NAME}. ${DATA_LICENSE_URL}. Quoted excerpts from marketplace documentation remain the property of their respective owners and are included for verification purposes only.`;

export type DatasetKey = "fee_database" | "fee_change_feed" | "policy_archive";

export const DATASETS: Record<DatasetKey, { title: string; path: string; api: string; file: string }> = {
  fee_database: { title: "Marketplace Fee Database", path: "/rate-card", api: "/api/public/fees", file: "marketplace-fee-database" },
  fee_change_feed: { title: "Seller Fee Change Feed", path: "/fees", api: "/api/public/fee-changes", file: "seller-fee-change-feed" },
  policy_archive: { title: "Policy Archive", path: "/policy-changes", api: "/api/public/policy-changes", file: "policy-archive" },
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/** "2026-11-21T02:27:31Z" -> "November 21, 2026" (UTC calendar date). */
export function longDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/** Version label from the latest data change date, e.g. "2026-11-21". */
export function versionLabel(latestChange: string | null): string {
  return latestChange ? latestChange.slice(0, 10) : "unversioned";
}

export function citationYear(latestChange: string | null, fallback = new Date()): string {
  return latestChange ? latestChange.slice(0, 4) : String(fallback.getUTCFullYear());
}

export function permanentRecordUrl(dataset: DatasetKey, id: string): string {
  return `${SITE_URL}${DATASETS[dataset].path}?record=${encodeURIComponent(id)}`;
}

export function datasetCitation(dataset: DatasetKey, opts: { year: string; version: string; retrieved: string }): string {
  const d = DATASETS[dataset];
  return `${PUBLISHER}. (${opts.year}). ${d.title} (Version ${opts.version}) [Data set]. Retrieved ${opts.retrieved}, from ${SITE_URL}${d.path}`;
}

export function recordCitation(dataset: DatasetKey, opts: { id: string; title: string; year: string; lastChecked: string | null; retrieved: string }): string {
  const d = DATASETS[dataset];
  const checked = opts.lastChecked ? ` Last checked ${longDate(opts.lastChecked)}.` : "";
  return `${PUBLISHER}. (${opts.year}). ${opts.title} [Data set record]. In ${d.title}.${checked} Retrieved ${opts.retrieved}, from ${permanentRecordUrl(dataset, opts.id)}`;
}

function bibKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export function datasetBibtex(dataset: DatasetKey, opts: { year: string; version: string; retrievedIso: string }): string {
  const d = DATASETS[dataset];
  return [
    `@misc{sth_${bibKey(d.title)}_${opts.version.replace(/-/g, "")},`,
    `  author       = {{${PUBLISHER}}},`,
    `  title        = {${d.title}},`,
    `  year         = {${opts.year}},`,
    `  version      = {${opts.version}},`,
    `  howpublished = {\\url{${SITE_URL}${d.path}}},`,
    `  note         = {Data set. Retrieved ${opts.retrievedIso}. License: CC BY 4.0}`,
    `}`,
  ].join("\n");
}

/** RFC 4180 cell: JSON-encodes objects, doubles quotes, wraps when needed. */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV: header row first (line 1), then rows in the given column order. */
export function toCsv(columns: readonly string[], rows: ReadonlyArray<Record<string, unknown>>): string {
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map(c => csvCell(row[c])).join(","));
  return lines.join("\r\n") + "\r\n";
}

/** Public API field order (must match src/routes/api/public/*). */
export const API_COLUMNS: Record<DatasetKey, readonly string[]> = {
  fee_database: "id,marketplace,region,fee_name,category,fee_type,value,value_type,effective_date,first_effective_date,first_effective_event_id,public_corroborating_source_url,source_url,source_title,last_verified,notes,pricing_details,verification_status".split(","),
  fee_change_feed: "id,record_id,marketplace,region,fee_type,category,title,old_value,new_value,value_type,change_amount,change_details,effective_date,announcement_date,impact_level,source_url,source_title,summary,effective_date_precision,effective_period,evidence_details".split(","),
  policy_archive: "id,marketplace,region,policy_area,title,summary,body_markdown,effective_date,announcement_date,impact_level,affected_sellers,source_url,source_title,last_verified,effective_date_precision,effective_period,evidence_details".split(","),
};
