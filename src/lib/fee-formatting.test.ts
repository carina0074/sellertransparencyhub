import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { formatFeeValue, presentFee, pricingDetailsSchema, resolveOffsiteAdsRate } from "./fee-formatting";

const rows = JSON.parse(readFileSync(new URL("./fee-formatting.fixtures.json", import.meta.url), "utf8")) as Array<{ marketplace: string; fee_name: string; value: number; value_type: string; pricing_details: unknown }>;
const row = (name: string) => {
  const found = rows.find((r) => r.fee_name === name);
  if (!found) throw new Error(`Missing fixture ${name}`);
  return found;
};
describe("fee amount formatting", () => {
  test.each([[0.065, "6.5%"], [0.03, "3.0%"], [0.12, "12.0%"], [0.15, "15.0%"], [0.1325, "13.3%"]])("fraction %s", (value, output) => expect(formatFeeValue(Number(value), "percent")).toBe(output));
  test("USD listing unit", () => expect(formatFeeValue(0.20, "usd")).toBe("$0.20 USD"));
  test.each([[3.45, "usd_per_unit", "$3.45 / unit"], [0.75, "usd_per_cuft", "$0.75 / cu.ft"], [39, "usd_per_month", "$39.00 / mo"]])("existing unit %s", (value, unit, output) => expect(formatFeeValue(Number(value), String(unit))).toBe(output));
});
test("US processing includes its fixed minor-unit component", () => {
  const record = row("Payment Processing Fee");
  expect(record.value).toBe(0.03);
  const details = pricingDetailsSchema.parse(record.pricing_details);
  expect(details.kind).toBe("processing");
  if (details.kind !== "processing") throw new Error("Wrong pricing kind");
  expect(details.fixed_minor).toBe(25);
  expect(details.currency).toBe("USD");
  expect(details.bank_account_country).toBe("US");
  expect(presentFee(record).value).toBe("3.0% + $0.25 USD / order (US)");
});
const ads = pricingDetailsSchema.parse(row("Offsite Ads Fee").pricing_details);
if (ads.kind !== "offsite_ads") throw new Error("Wrong ads fixture");
test("below threshold is 15%", () => expect(resolveOffsiteAdsRate(ads, 999999, false)).toBe(0.15));
test("exactly $10,000 is 12%", () => expect(resolveOffsiteAdsRate(ads, 1000000, false)).toBe(0.12));
test("previous threshold retains 12%", () => expect(resolveOffsiteAdsRate(ads, 0, true)).toBe(0.12));
test("ads attribution is 30 days", () => expect(ads.attribution_days).toBe(30));
test("ads fee cap is $100 USD", () => { expect(ads.cap_minor).toBe(10000); expect(ads.currency).toBe("USD"); });
test("ads revenue window is 365 days", () => expect(ads.window_days).toBe(365));
test("both ads rates are presented", () => expect(presentFee(row("Offsite Ads Fee")).value).toBe("12.0% or 15.0% — conditional"));
test("missing ads details cannot imply a universal rate", () => expect(presentFee({ ...row("Offsite Ads Fee"), pricing_details: null }).value).toBe("Pricing details unavailable"));
test("malformed ads details cannot imply a universal rate", () => expect(presentFee({ ...row("Offsite Ads Fee"), pricing_details: { ...ads, threshold_reached_rate: 12 } }).value).toBe("Pricing details unavailable"));
test("other marketplaces do not receive Etsy conditions", () => expect(presentFee({ ...row("Offsite Ads Fee"), marketplace: "Amazon" })).toEqual({ value: "15.0%", details: null }));