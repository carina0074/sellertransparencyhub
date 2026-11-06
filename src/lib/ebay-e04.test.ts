import { expect, test } from "bun:test";
import event from "./ebay-e04.fixture.json";
import { policyDateSchema, policyEvidenceSchema } from "./policy-evidence";
import { recentChanges } from "./recent-changes";
import type { FeeChange, PolicyChange } from "./fees.functions";

test("E04 preserves exact announcement/effective dates and maintainer November 5 review", () => {
  expect([event.announcement_date, event.effective_date, event.last_verified, event.evidence_details.reviewer]).toEqual(["2025-10-29", "2026-01-13", "2026-11-05", "maintainer"]);
  expect(policyDateSchema.safeParse(event).success).toBe(true);
});
test("E04 is a US fee-rule policy with no assessed impact or numeric rate", () => {
  expect(event.region).toBe("US");
  expect(event.impact_level).toBeNull();
  expect(policyEvidenceSchema.parse(event.evidence_details).change_type).toBe("fee_rule_change");
  expect("old_value" in event || "new_value" in event).toBe(false);
});
test("E04 stores four references across both approved source URLs", () => {
  expect(event.evidence_details.references).toHaveLength(4);
  expect(new Set(event.evidence_details.references.map(r => r.url)).size).toBe(2);
});
test("E04 sorts between January 15 Amazon and earlier fee events in recent lists", () => {
  const fee = (id: string, date: string) => ({ id, effective_date: date, effective_date_precision: "exact" }) as FeeChange;
  const result = recentChanges([fee("amazon", "2026-01-15"), fee("ebay", "2025-02-14")], [event as PolicyChange]);
  expect(result.map(r => r.record.id)).toEqual(["amazon", event.id, "ebay"]);
  expect(result[1]?.href).toBe("/policy-changes");
});
test("unclassified and undated policies are not mistaken for dated fee-rule events", () => {
  const unclassified = { ...event, evidence_details: { ...event.evidence_details, change_type: undefined } } as PolicyChange;
  const undated = { ...event, effective_date: null, effective_date_precision: "unknown" } as PolicyChange;
  expect(recentChanges([], [unclassified, undated])).toEqual([]);
});