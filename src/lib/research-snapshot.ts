export const COLLECTIONS = ["fee_records", "fee_changes", "policy_changes"] as const;
export type Collection = typeof COLLECTIONS[number];
export type SchemaField = { table_name: Collection; column_name: string; data_type: string; is_nullable: string; column_default: string | null; ordinal_position: number };
export type Snapshot = { version: string; exported_at: string; status: "unreleased_sample"; schema: SchemaField[]; collections: Record<Collection, Record<string, unknown>[]> };

export function validateSnapshot(value: Snapshot): Snapshot {
  if (!/^\d+\.\d+\.\d+$/.test(value.version)) throw new Error("Version must be X.Y.Z");
  if (Number.isNaN(Date.parse(value.exported_at))) throw new Error("Invalid export timestamp");
  for (const collection of COLLECTIONS) {
    if (!Array.isArray(value.collections[collection])) throw new Error(`Missing ${collection}`);
    const columns = value.schema.filter((field) => field.table_name === collection);
    if (!columns.length) throw new Error(`Missing schema for ${collection}`);
    for (const row of value.collections[collection]) {
      if (!columns.every((field) => Object.hasOwn(row, field.column_name))) throw new Error(`Incomplete ${collection} row`);
      if (typeof row.region !== "string" || !/^(?:[A-Z]{2}|UNSPECIFIED)$/.test(row.region)) throw new Error("Region must be explicit");
    }
  }
  return value;
}

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function snapshotCsv(snapshot: Snapshot, collection: Collection): string {
  const columns = snapshot.schema.filter((field) => field.table_name === collection).sort((a, b) => a.ordinal_position - b.ordinal_position).map((field) => field.column_name);
  return [columns.map(csvCell).join(","), ...snapshot.collections[collection].map((row) => columns.map((column) => csvCell(row[column])).join(","))].join("\r\n") + "\r\n";
}

export function dataDictionary(snapshot: Snapshot): string {
  return ["# Research snapshot data dictionary", `Version: ${snapshot.version}`, `Exported: ${snapshot.exported_at}`, "Status: unreleased sample; no license, DOI or public release is asserted.", "Generated from information_schema.columns in the same database snapshot as the records.", "CSV uses schema column order, quoted RFC-style cells, empty cells for SQL NULL, and JSON strings for structured values. JSON preserves nulls, numbers, arrays and objects. Regions use explicit source scope; UNSPECIFIED is not a country or a U.S. inference.", ...COLLECTIONS.flatMap((collection) => [
    `\n## ${collection}\n`, "| Field | SQL type | Nullable | Default |", "|---|---|---|---|",
    ...snapshot.schema.filter((field) => field.table_name === collection).sort((a, b) => a.ordinal_position - b.ordinal_position).map((field) => `| ${field.column_name} | ${field.data_type} | ${field.is_nullable} | ${(field.column_default ?? "—").replaceAll("|", "\\|")} |`),
  ])].join("\n");
}