import { expect, test } from "bun:test";
import { historicalChangeLabel, historicalDateSchema, historicalEffectiveDate } from "./historical-fee-formatting";

test("zero baseline is New fee, never +100%", () => {
  expect(historicalChangeLabel(0,3.80)).toBe("New fee");
  expect(historicalChangeLabel(0,0)).toBe("New fee");
});
test("nonzero historical change retains relative calculation", () => {
  expect(historicalChangeLabel(0.30,0.40)).toBe("+33.3%");
  expect(historicalChangeLabel(10,8)).toBe("-20.0%");
});
test("historical exact day has UTC-stable representation", () => {
  expect(historicalEffectiveDate({effective_date:"2024-03-15",effective_date_precision:"exact"})).toBe("Mar 15, 2024");
});
test("month-level evidence cannot introduce an exact first day", () => {
  const r={effective_date:null,effective_date_precision:"month",effective_period:"2023-04"};
  expect(historicalDateSchema.safeParse(r).success).toBe(true);
  expect(historicalEffectiveDate(r)).toBe("April 2023 (month-level evidence)");
  expect(historicalDateSchema.safeParse({...r,effective_date:"2023-04-01"}).success).toBe(false);
});
test("year-level evidence must not masquerade as an exact date", () => {
  const r={effective_date:null,effective_date_precision:"year",effective_period:"2023"};
  expect(historicalDateSchema.safeParse(r).success).toBe(true);
  expect(historicalEffectiveDate(r)).toBe("2023 (year-level evidence)");
  expect(historicalDateSchema.safeParse({...r,effective_period:"2023-01"}).success).toBe(false);
});
test("unknown effective date is explicit rather than fabricated", () => {
  const r={effective_date:null,effective_date_precision:"unknown",effective_period:null};
  expect(historicalDateSchema.safeParse(r).success).toBe(true);
  expect(historicalEffectiveDate(r)).toBe("Effective date not established");
  expect(historicalDateSchema.safeParse({...r,effective_date:"2023-01-01"}).success).toBe(false);
});