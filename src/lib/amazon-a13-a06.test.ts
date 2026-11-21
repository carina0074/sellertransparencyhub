import { expect, test } from "bun:test";
import a13 from "./amazon-a13.fixture.json";
import a06 from "./amazon-a06.fixture.json";
import a09 from "./amazon-a09.fixture.json";
import e04 from "./ebay-e04.fixture.json";
import amazon from "./amazon-historical-events.fixtures.json";
import legacy from "./historical-fees.fixtures.json";
import { historicalChangeDetailsSchema, historicalDateSchema, historicalEvidenceSchema, historicalPresentation } from "./historical-fee-formatting";
import { policyDateSchema, policyEvidenceSchema } from "./policy-evidence";
import { recentChanges } from "./recent-changes";
import type { FeeChange, PolicyChange } from "./fees.functions";

test("A13 stores 20 and 61 cents as labeled average decreases, without scalar rates", () => {
  expect(historicalChangeDetailsSchema.parse(a13.change_details)).toEqual({ kind: "announced_average_change", direction: "decrease", amounts: [{ label: "Standard-sized products", amount_minor: 20 }, { label: "Large Bulky-sized products", amount_minor: 61 }], currency: "USD", basis: "announced_average" });
  expect([a13.old_value, a13.new_value, a13.change_amount, a13.record_id, a13.impact_level]).toEqual([null, null, null, null, null]);
  expect(historicalPresentation(a13).lines).toEqual(["Standard-sized products: −$0.20 / unit (announced average, not a rate)", "Large Bulky-sized products: −$0.61 / unit (announced average, not a rate)"]);
});

test("announced averages reject competing scalar/list amounts and non-integer cents", () => {
  expect(historicalChangeDetailsSchema.safeParse({ ...a13.change_details, amount_minor: 20 }).success).toBe(false);
  expect(historicalChangeDetailsSchema.safeParse({ ...a13.change_details, amounts: [] }).success).toBe(false);
  expect(historicalChangeDetailsSchema.safeParse({ ...a13.change_details, amounts: [{ label: "Standard-sized products", amount_minor: 0.2 }] }).success).toBe(false);
});

test("A13 keeps the below-$10 additional $0.77 discount as a condition", () => {
  expect(historicalEvidenceSchema.parse(a13.evidence_details).conditions).toContain("Products priced below $10 continue to receive an additional $0.77 discount on per-unit fees.");
});

test("A13 keeps April 15 timing separate from announcement and November 20 review", () => {
  expect(historicalDateSchema.safeParse(a13).success).toBe(true);
  expect([a13.announcement_date, a13.effective_date, a13.evidence_details.reviewed_on, a13.evidence_details.reviewer, a13.region]).toEqual(["2023-12-05", "2024-04-15", "2026-11-20", "maintainer", "US"]);
});

test("A06 is a June 1 scope-expansion policy, not numeric fee history", () => {
  const evidence = policyEvidenceSchema.parse(a06.evidence_details);
  expect(policyDateSchema.safeParse(a06).success).toBe(true);
  expect([a06.effective_date, a06.announcement_date, a06.last_verified, evidence.reviewed_on, evidence.reviewer, a06.region, evidence.change_type, a06.impact_level]).toEqual(["2024-06-01", "2023-12-05", "2026-11-20", "2026-11-20", "maintainer", "US", "fee_rule_change", null]);
  expect(evidence.conditions).toEqual(["Applies only to products with the highest return rates relative to other products in their category.", "Apparel and shoes are excluded from the expansion; existing returns processing fees for those categories remain unchanged on average."]);
  expect("old_value" in a06 || "new_value" in a06 || "change_details" in a06).toBe(false);
});

test("eight fee events plus A06 leave January 2026 events first in recent lists", () => {
  const fees = [...legacy, ...amazon, a09, a13] as FeeChange[];
  expect(fees).toHaveLength(8);
  const result = recentChanges(fees, [e04, a06] as PolicyChange[]);
  expect(result.slice(0, 2).map(item => item.record.id)).toEqual([a09.id, e04.id]);
  expect(result.findIndex(item => item.record.id === a06.id)).toBeLessThan(result.findIndex(item => item.record.id === a13.id));
  expect(result.find(item => item.record.id === a06.id)?.href).toBe("/policy-changes");
});