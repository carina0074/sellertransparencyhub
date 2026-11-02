import { describe, expect, test } from "bun:test";
import { latestDocumentedChange } from "./historical-fee-formatting";

describe("latestDocumentedChange", () => {
  test("picks the latest established date and skips unknown dates", () => {
    const changes = [
      { id: "a", effective_date: "2025-02-14", effective_date_precision: "exact", effective_period: null },
      { id: "b", effective_date: null, effective_date_precision: "unknown", effective_period: null },
      { id: "c", effective_date: null, effective_date_precision: "month", effective_period: "2025-06" },
    ];
    expect(latestDocumentedChange(changes)?.id).toBe("c");
  });
  test("returns null when no change has an established date", () => {
    expect(latestDocumentedChange([{ effective_date: null, effective_date_precision: "unknown", effective_period: null }])).toBeNull();
  });
});
