import { describe, expect, test } from "bun:test";
import rows from "./current-fees.fixtures.json";
import { effectiveDateLabel, evaluatePercentageTiers, presentFee, pricingDetailsSchema, resolveOffsiteAdsRate } from "./fee-formatting";

function record(marketplace: string, category: string) {
  const row = rows.find((r) => r.marketplace === marketplace && r.category === category);
  if (!row) throw new Error(`Missing ${marketplace} ${category}`);
  return row;
}
function tiers(marketplace: string, category: string) {
  const d = pricingDetailsSchema.parse(record(marketplace, category).pricing_details);
  if (d.kind !== "tiered") throw new Error("Expected tiers");
  return d;
}
describe("first-party current-fee remediation", () => {
  test("Amazon Apparel exact boundaries 5%/10%/17% and $0.30 minimum", () => {
    const d = tiers("Amazon", "Clothing and Accessories");
    expect(d.minimum_minor).toBe(30);
    for (const [p,fee] of [[1500,75],[1501,150.1],[2000,200],[2001,340.17]]) expect(evaluatePercentageTiers(d,p)).toBeCloseTo(fee,2);
  });
  test("Consumer Electronics 8% is separate from marginal Accessories 15%/8%", () => {
    expect(record("Amazon", "Consumer Electronics").value).toBe(0.08);
    const d = tiers("Amazon", "Electronics Accessories");
    expect(evaluatePercentageTiers(d,15000)).toBe(1900);
    expect(d.minimum_minor).toBe(30);
  });
  test("Amazon Professional subscription is $39.99 and not scoped to all sellers", () => {
    const r = record("Amazon", "US Professional selling plan");
    expect(r.value).toBe(39.99);
    expect(pricingDetailsSchema.parse(r.pricing_details).scope).toBe("U.S. Professional selling plan, not Individual");
  });
  test("Walmart Apparel exact thresholds 5%/10%/15%", () => {
    const d = tiers("Walmart", "Apparel & Accessories");
    for (const [p,fee] of [[1500,75],[1501,150.1],[2000,200],[2001,300.15]]) expect(evaluatePercentageTiers(d,p)).toBeCloseTo(fee,2);
  });
  test("eBay default final value is marginal 13.6%/2.35% at $7500", () => {
    const d = tiers("eBay", "Home & Garden");
    expect(evaluatePercentageTiers(d,800000)).toBeCloseTo(103175,2);
    expect(d.per_order_fee).toBe(true);
  });
  test("eBay Books first tier is 15.3%, not 13.6%", () => {
    expect(evaluatePercentageTiers(tiers("eBay", "Books & Magazines"),750000)).toBe(114750);
  });
  test("eBay per-order charge is $0.30 at ≤$10 and $0.40 above", () => {
    const r = rows.find((r) => r.marketplace === "eBay" && r.fee_type === "Per-order");
    if (!r) throw new Error("Missing order charge");
    const d = pricingDetailsSchema.parse(r.pricing_details);
    if (d.kind !== "order_fee") throw new Error("Expected order fee");
    expect([d.threshold_minor,d.below_or_equal_minor,d.above_minor]).toEqual([1000,30,40]);
    expect(r.value_type).toBe("usd_per_order");
  });
  test("eBay International is 1.65% with OR location trigger and shipping exemption", () => {
    const r = record("eBay", "Applicable U.S.-registered sellers");
    expect(r.value).toBe(0.0165);
    const d = pricingDetailsSchema.parse(r.pricing_details);
    expect(d.scope).toBe("Applicable U.S.-registered sellers not using qualifying eBay International Shipping");
    expect(d.conditions).toContain("Triggered if delivery address outside U.S. OR buyer registered address outside U.S., regardless of delivery address.");
    expect(d.conditions).toContain("Canada can satisfy these outside-U.S. conditions; no blanket Canada exemption.");
  });
  test("Etsy ordinary listing is $0.20 USD per listing", () => {
    const r = record("Etsy", "Listing");
    expect(r.value).toBe(0.20);
    expect(pricingDetailsSchema.parse(r.pricing_details).basis).toBe("per listing, not universally per sale");
  });
  test("Etsy transaction is 6.5% with U.S. tax exclusion", () => {
    const r = record("Etsy", "Selling — U.S. fee basis");
    expect(r.value).toBe(0.065);
    expect(pricingDetailsSchema.parse(r.pricing_details).basis).toBe("listing prices plus shipping and gift wrapping; paid personalization included; U.S. sales tax excluded");
  });
  test("Etsy Offsite Ads qualifies at exactly $10,000 and caps at $100", () => {
    const d = pricingDetailsSchema.parse(record("Etsy", "Advertising — attributed orders").pricing_details);
    if (d.kind !== "offsite_ads") throw new Error("Expected ads");
    expect(resolveOffsiteAdsRate(d,999999,false)).toBe(0.15);
    expect(resolveOffsiteAdsRate(d,1000000,false)).toBe(0.12);
    expect(d.cap_minor).toBe(10000);
  });
  test("unsupported exact effective dates are nullable; dated low-inventory schedule retained", () => {
    expect(record("Amazon", "Clothing and Accessories").effective_date).toBeNull();
    expect(record("Amazon", "Eligible standard-size and Small/Large Bulky products").effective_date).toBe("2026-01-15");
    expect(effectiveDateLabel(null)).toBe("Not independently established");
  });
  test("tier summaries cannot hide the actual 5%–17% Apparel schedule", () => {
    const r = record("Amazon", "Clothing and Accessories");
    expect(presentFee(r).value).toBe("5.0%–17.0% — conditional");
    expect(tiers("Amazon",r.category).tiers.map((t) => t.rate)).toEqual([0.05,0.10,0.17]);
  });
  test("all current records have valid structures and evidence links; retired FBA flats absent", () => {
    expect(rows.length).toBe(38);
    for (const r of rows) {
      const d = pricingDetailsSchema.parse(r.pricing_details);
      expect(d.references.length).toBeGreaterThan(0);
      expect(r.verification_status).toBe("verified_current_value");
      if (r.value_type === "percent") expect(r.value).toBeGreaterThan(0);
    }
    expect(rows.filter((r) => r.marketplace === "Amazon" && r.fee_name === "FBA Fulfillment Fee")).toHaveLength(0);
  });
});