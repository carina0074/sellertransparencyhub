import { expect, test } from "bun:test";
import rows from "./amazon-historical-events.fixtures.json";
import legacy from "./historical-fees.fixtures.json";
import { historicalChangeDetailsSchema, historicalDateSchema, historicalEvidenceSchema, historicalPresentation, latestDocumentedChange } from "./historical-fee-formatting";

test("A01 retains both announced price bands in one linked event", () => {
  const r = rows[0];
  expect(r?.change_details).toEqual({kind:"tiered_rate_change",tiers:[{label:"Under $15",old_rate:0.17,new_rate:0.05},{label:"$15–$20",old_rate:0.17,new_rate:0.1}]});
  expect([r?.effective_date,r?.record_id,r?.old_value,r?.new_value]).toEqual(["2024-01-15","ad6481c1-e887-41ac-8241-d4464504c8d0",null,null]);
});
test("A04 stores averages, never a prior value or universal scalar rate", () => {
  const r = rows[1];
  expect([r?.old_value,r?.new_value,r?.change_amount,r?.effective_date]).toEqual([null,null,null,"2024-03-01"]);
  expect(r?.change_details).toEqual({kind:"new_fee",amounts:[{label:"Standard size",amount_minor:27,currency:"USD",basis:"announced_average"},{label:"Large Bulky",amount_minor:158,currency:"USD",basis:"announced_average"}]});
  expect(historicalChangeDetailsSchema.safeParse({kind:"new_fee",amounts:[{label:"Standard",amount_minor:27,currency:"USD",basis:"rate"}]}).success).toBe(false);
});
test("A05 has no announced amount, preserves exact introduction day and current linkage", () => {
  const r = rows[2];
  expect([r?.old_value,r?.new_value,r?.effective_date,r?.record_id]).toEqual([null,null,"2024-04-01","8df97652-1d8d-4d26-865f-d977a701484e"]);
  if (!r) throw new Error("Missing A05");
  expect(historicalPresentation(r).label).toBe("New fee");
});
test("all three events preserve US, announcement date, reviewer and distinct review dates", () => {
  expect(rows.map(r=>[r.region,r.announcement_date,r.evidence_details.reviewer,r.evidence_details.reviewed_on])).toEqual([["US","2023-12-05","maintainer","2026-11-01"],["US","2023-12-05","maintainer","2026-11-04"],["US","2023-12-05","maintainer","2026-11-04"]]);
  for (const r of rows) { expect(historicalDateSchema.safeParse(r).success).toBe(true); expect(historicalEvidenceSchema.safeParse(r.evidence_details).success).toBe(true); expect(r.impact_level).toBeNull(); }
});
test("six historical events still select eBay Feb 14 2025 by effective date", () => {
  const all = [...legacy,...rows];
  expect(all).toHaveLength(6);
  expect(latestDocumentedChange(all)?.effective_date).toBe("2025-02-14");
});