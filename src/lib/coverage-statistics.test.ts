/// <reference types="bun" />
import { expect, test } from "bun:test";
import { readCoverageStatistics, formatVerificationDate, type CoverageRow } from "./coverage-statistics";

function reader(rows: CoverageRow[], events: number, cap = 500) {
  return {
    countRecords: async () => rows.length,
    countChanges: async () => events,
    fetchRecords: async (offset: number, limit: number) => rows.slice(offset, offset + Math.min(limit, cap)),
  };
}
const snapshot = Array.from({ length: 41 }, (_, i) => ({
  marketplace: ["Amazon", "Walmart", "eBay", "Shopify", "Etsy"][i % 5] ?? "Amazon",
  category: `Label ${i % 35}`,
  last_verified: i === 40 ? "2026-06-20" : "2026-06-01",
}));

test("snapshot has 41 current records, independently of its 12 historical events", async () => {
  const stats = await readCoverageStatistics(reader(snapshot, 12));
  expect(stats.activeRecords).toBe(41);
  expect(stats.historicalChanges).toBe(12);
});
test("snapshot has five current marketplaces including eBay", async () => {
  expect(snapshot.some(row => row.marketplace === "eBay")).toBe(true);
  expect((await readCoverageStatistics(reader(snapshot, 12))).marketplaces).toBe(5);
});
test("category labels are globally distinct, not summed by marketplace", async () => {
  expect((await readCoverageStatistics(reader(snapshot, 12))).categories).toBe(35);
});
test("latest verification is June 20, 2026, from record verification dates", async () => {
  expect((await readCoverageStatistics(reader(snapshot, 12))).lastUpdated).toBe("2026-06-20");
  expect(formatVerificationDate("2026-06-20")).toBe("June 20, 2026");
});
test("counts have no minimum and empty data has no invented verification", async () => {
  expect(await readCoverageStatistics(reader([], 0))).toEqual({
    activeRecords: 0, historicalChanges: 0, marketplaces: 0, categories: 0, lastUpdated: null,
  });
});
test("metadata beyond 1000 rows contributes distinct labels and latest date", async () => {
  const rows = Array.from({ length: 1201 }, () => ({ marketplace: "Amazon", category: "General", last_verified: "2026-06-01" }));
  rows[1200] = { marketplace: "eBay", category: "Late label", last_verified: "2026-06-20" };
  expect(await readCoverageStatistics(reader(rows, 1502))).toEqual({
    activeRecords: 1201, historicalChanges: 1502, marketplaces: 2, categories: 2, lastUpdated: "2026-06-20",
  });
});
test("pagination continues when the service returns fewer rows than requested", async () => {
  expect(await readCoverageStatistics(reader(snapshot, 12, 7))).toEqual({
    activeRecords: 41, historicalChanges: 12, marketplaces: 5, categories: 35, lastUpdated: "2026-06-20",
  });
});
test("record totals use the exact count rather than metadata array length", async () => {
  const source = reader(snapshot, 12);
  source.countRecords = async () => 2041;
  expect((await readCoverageStatistics(source)).activeRecords).toBe(2041);
});
test("query failures do not turn into fabricated zero coverage", async () => {
  const source = reader(snapshot, 12);
  source.fetchRecords = async () => { throw new Error("Read failed"); };
  await expect(readCoverageStatistics(source)).rejects.toThrow("Read failed");
});