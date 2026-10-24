/** Current rows and historical events are independent collections. */
export type CoverageRow = { marketplace: string; category: string; last_verified: string };
export type DatabaseStats = {
  activeRecords: number;
  historicalChanges: number;
  marketplaces: number;
  categories: number;
  lastUpdated: string | null;
};

export type CoverageReader = {
  countRecords: () => Promise<number>;
  countChanges: () => Promise<number>;
  fetchRecords: (offset: number, limit: number) => Promise<CoverageRow[]>;
};

/** Exact head counts for totals; page all metadata for global distinct labels. */
export async function readCoverageStatistics(reader: CoverageReader): Promise<DatabaseStats> {
  const [activeRecords, historicalChanges] = await Promise.all([
    reader.countRecords(), reader.countChanges(),
  ]);
  const marketplaces = new Set<string>();
  const categories = new Set<string>();
  let lastUpdated: string | null = null;
  let offset = 0;
  while (true) {
    const rows = await reader.fetchRecords(offset, 500);
    if (rows.length === 0) break;
    for (const row of rows) {
      marketplaces.add(row.marketplace);
      categories.add(row.category);
      if (!lastUpdated || row.last_verified > lastUpdated) lastUpdated = row.last_verified;
    }
    // Advance by the returned length, even if the service caps below our limit.
    offset += rows.length;
  }
  return { activeRecords, historicalChanges, marketplaces: marketplaces.size, categories: categories.size, lastUpdated };
}

export function formatVerificationDate(date: string | null): string {
  if (!date) return "Not yet verified";
  return new Intl.DateTimeFormat("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}