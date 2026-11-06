import { expect, test } from "bun:test";
import event from "./amazon-a09.fixture.json";
import amazon from "./amazon-historical-events.fixtures.json";
import legacy from "./historical-fees.fixtures.json";
import { historicalChangeDetailsSchema, historicalDateSchema, historicalEvidenceSchema, latestDocumentedChange } from "./historical-fee-formatting";

test("A09 stores eight cents as an announced average increase, never per-tier scalar values", () => {
  expect(event.change_details).toEqual({ kind: "announced_average_change", direction: "increase", amount_minor: 8, currency: "USD", basis: "announced_average" });
  expect([event.old_value, event.new_value, event.change_amount, event.record_id, event.impact_level]).toEqual([null, null, null, null, null]);
  expect(historicalChangeDetailsSchema.safeParse(event.change_details).success).toBe(true);
  expect(historicalChangeDetailsSchema.safeParse({ ...event.change_details, basis: "rate" }).success).toBe(false);
  expect(historicalChangeDetailsSchema.safeParse({ ...event.change_details, amount_minor: 0.08 }).success).toBe(false);
});

test("A09 retains independent announcement, exact effective and maintainer review dates", () => {
  expect([event.region, event.announcement_date, event.effective_date, event.effective_date_precision, event.evidence_details.reviewer, event.evidence_details.reviewed_on]).toEqual(["US", "2025-10-15", "2026-01-15", "exact", "maintainer", "2026-11-05"]);
  expect(historicalDateSchema.safeParse(event).success).toBe(true);
  expect(historicalEvidenceSchema.safeParse(event.evidence_details).success).toBe(true);
});

test("seven events select A09 Jan 15 2026 as the latest documented change", () => {
  const events = [...legacy, ...amazon, event];
  expect(events).toHaveLength(7);
  expect(latestDocumentedChange(events)?.id).toBe(event.id);
});