import { expect, test } from "bun:test";
import events from "./historical-fees.fixtures.json";
import { historicalDateSchema, historicalEvidenceSchema } from "./historical-fee-formatting";

function event(id: string) {
  const r=events.find((e) => e.id===id);
  if (!r) throw new Error(`Missing ${id}`);
  return r;
}
test("eBay per-order historical event is March 15 2024 $0.30 to $0.40, not per unit", () => {
  const r=event("47d5cb5e-2ac5-4d02-9c26-d66295efe60a");
  expect([r.old_value,r.new_value,r.effective_date,r.value_type]).toEqual([0.30,0.40,"2024-03-15","usd_per_order"]);
  expect(r.record_id).toBe("1da4ded9-fc30-4ea6-819c-7777d04088ba");
});
test("eBay 2025 standard apparel transition is 13.25% to 13.6%, February 14", () => {
  const r=event("2ab83dc6-dd91-45de-a5b8-4633f3d102bb");
  expect([r.old_value,r.new_value,r.change_amount,r.effective_date]).toEqual([0.1325,0.136,0.0035,"2025-02-14"]);
  expect(r.record_id).toBe("0e454921-1c5a-44ba-9182-c543f50cacdc");
});
test("Shopify historical USD monthly billing keeps $29 to $39 with existing-cohort date", () => {
  const r=event("0cb1ef44-8e6f-4d77-940b-065d85aa990a");
  expect([r.old_value,r.new_value,r.effective_date]).toEqual([29,39,"2023-04-23"]);
  expect(historicalEvidenceSchema.parse(r.evidence_details).scope).toBe("Shopify Basic USD monthly-billing plan price; April 23, 2023 applies to merchants existing before January 24, 2023, not all accounts");
  expect(r.record_id).toBe("0313eff8-fa79-41a8-a2f8-89b874cf41b8");
});
test("retained dataset contains only the three independently supported transitions", () => {
  expect(events.map((r) => r.id).sort()).toEqual(["47d5cb5e-2ac5-4d02-9c26-d66295efe60a","2ab83dc6-dd91-45de-a5b8-4633f3d102bb","0cb1ef44-8e6f-4d77-940b-065d85aa990a"].sort());
  for (const r of events) {
    expect(historicalDateSchema.safeParse(r).success).toBe(true);
    expect(historicalEvidenceSchema.parse(r.evidence_details).status).toBe("verified_historical_event");
    expect(r.announcement_date).toBeNull();
  }
});