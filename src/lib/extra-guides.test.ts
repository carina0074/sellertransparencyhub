import { expect, test } from "bun:test";
import fixture from "./subtitle-guide.fixture.json";
import { pricingDetailsSchema, evaluateFlatListingTiers } from "./fee-formatting";
import { subtitleIllustration } from "./extra-guides";

function tiers() {
  const details = pricingDetailsSchema.parse(fixture);
  if (details.kind !== "tiered") throw new Error("Subtitle fixture must contain tiers");
  return details;
}
test("auction up to exactly $150 costs $1.50", () => {
  expect(evaluateFlatListingTiers(tiers(), 15000, "auction", "standard")).toBe(150);
});
test("auction above $150 costs $3.00", () => {
  expect(evaluateFlatListingTiers(tiers(), 15001, "auction", "standard")).toBe(300);
});
test("auction Real Estate costs $0.50 independently of price", () => {
  expect(evaluateFlatListingTiers(tiers(), 15001, "auction", "real_estate")).toBe(50);
});
test("fixed price up to exactly $150 costs $2.00", () => {
  expect(evaluateFlatListingTiers(tiers(), 15000, "fixed_price", "standard")).toBe(200);
});
test("fixed price above $150 costs $6.00", () => {
  expect(evaluateFlatListingTiers(tiers(), 15001, "fixed_price", "standard")).toBe(600);
});
test("fixed price Real Estate costs $1.50 independently of price", () => {
  expect(evaluateFlatListingTiers(tiers(), 15001, "fixed_price", "real_estate")).toBe(150);
});
test("$40 fixed-price subtitle for three months totals $6.00", () => {
  expect(subtitleIllustration(tiers(), 4000, 3)).toEqual({ monthlyMinor: 200, totalMinor: 600 });
});
test("illustration follows live amounts rather than a copied $2 fee", () => {
  const details = tiers();
  const changed = { ...details, tiers: details.tiers.map(t => t.listing_format === "fixed_price" && t.category_scope === "standard" && t.upper_minor === 15000 ? { ...t, amount_minor: 250 } : t) };
  expect(subtitleIllustration(changed, 4000, 3)).toEqual({ monthlyMinor: 250, totalMinor: 750 });
});
