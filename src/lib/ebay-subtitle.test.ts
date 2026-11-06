import { expect, test } from "bun:test";
import record from "./ebay-subtitle.fixture.json";
import { evaluateFlatListingTiers, pricingDetailsSchema } from "./fee-formatting";

const parsed = pricingDetailsSchema.parse(record.pricing_details);
if (parsed.kind !== "tiered") throw new Error("Subtitle must use structured tiers");
const details = parsed;

test("Auction Subtitle charges the whole listing fee on either side of $150", () => {
  expect(evaluateFlatListingTiers(details, 15000, "auction", "standard")).toBe(150);
  expect(evaluateFlatListingTiers(details, 15001, "auction", "standard")).toBe(300);
});
test("Fixed-price Subtitle charges the whole listing fee on either side of $150", () => {
  expect(evaluateFlatListingTiers(details, 15000, "fixed_price", "standard")).toBe(200);
  expect(evaluateFlatListingTiers(details, 15001, "fixed_price", "standard")).toBe(600);
});
test("Real Estate Subtitle overrides both price bands by listing format", () => {
  for (const price of [100, 15000, 15001]) {
    expect(evaluateFlatListingTiers(details, price, "auction", "real_estate")).toBe(50);
    expect(evaluateFlatListingTiers(details, price, "fixed_price", "real_estate")).toBe(150);
  }
});
test("Subtitle keeps US scope, unknown effective date and maintainer November 5 source check", () => {
  expect([record.region, record.effective_date, record.last_verified, record.pricing_details.reviewer]).toEqual(["US", null, "2026-11-05", "maintainer"]);
});