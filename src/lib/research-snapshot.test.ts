import { describe, expect, test } from "bun:test";
import { COLLECTIONS, dataDictionary, snapshotCsv, validateSnapshot, type Snapshot } from "./research-snapshot";
const fixture: Snapshot = {
  version: "0.0.0", exported_at: "2026-11-01T00:00:00Z", status: "unreleased_sample",
  schema: COLLECTIONS.flatMap((table_name) => ["id", "region", "notes"].map((column_name, index) => ({ table_name, column_name, data_type: "text", is_nullable: "YES", column_default: null, ordinal_position: index + 1 }))),
  collections: { fee_records: [{ id: "fee", region: "US", notes: 'quoted "value",\nnext' }], fee_changes: [{ id: "change", region: "UNSPECIFIED", notes: null }], policy_changes: [{ id: "policy", region: "UK", notes: null }] },
};
describe("Private three-collection research snapshots", () => {
  test("one version and export timestamp cover all three collections", () => {
    expect(validateSnapshot(fixture).collections.policy_changes[0]?.region).toBe("UK");
    expect(Object.keys(fixture.collections)).toEqual([...COLLECTIONS]);
    expect(() => validateSnapshot({ ...fixture, version: "missing" })).toThrow("Version");
  });
  test("region must be explicit, not inferred from currency", () => {
    expect(() => validateSnapshot({ ...fixture, collections: { ...fixture.collections, fee_changes: [{ id: "change", region: null, notes: null }] } })).toThrow("Region");
    expect(fixture.collections.fee_changes[0]?.region).toBe("UNSPECIFIED");
  });
  test("CSV preserves quoted text, embedded newline and NULL cells in schema order", () => {
    expect(snapshotCsv(fixture, "fee_records")).toBe('"id","region","notes"\r\n"fee","US","quoted ""value"",\nnext"\r\n');
    expect(snapshotCsv(fixture, "policy_changes")).toBe('"id","region","notes"\r\n"policy","UK",""\r\n');
  });
  test("dictionary includes every schema field and incomplete rows fail", () => {
    expect(dataDictionary(fixture)).toContain("## fee_changes");
    expect(dataDictionary(fixture)).toContain("| region | text | YES | — |");
    expect(() => validateSnapshot({ ...fixture, collections: { ...fixture.collections, fee_records: [{ id: "fee", region: "US" }] } })).toThrow("Incomplete");
  });
});