import { describe, expect, test } from "bun:test";
import {
  amazonReferralFee,
  calculateFees,
  WALMART_REFERRAL_RATES,
  type FeeInputs,
} from "./marketplace-fees";

const base: FeeInputs = {
  price: 30,
  cost: 0,
  shipping: 0,
  marketplace: "amazon",
  category: "home",
  weightLb: 1,
  sizeTier: "small_standard",
  storageMonths: 0,
};

const close = (a: number, b: number) => expect(a).toBeCloseTo(b, 2);

describe("Amazon referral tiers", () => {
  test("Apparel: 5% at ≤ $15, 10% at > $15–$20, 17% above $20", () => {
    close(amazonReferralFee("apparel", 12), 0.6);
    close(amazonReferralFee("apparel", 18), 1.8);
    close(amazonReferralFee("apparel", 30), 5.1);
  });

  test("Beauty: 8% at ≤ $10, 15% above", () => {
    close(amazonReferralFee("beauty", 8), 0.64);
    close(amazonReferralFee("beauty", 20), 3.0);
  });

  test("Grocery: 8% at ≤ $15, 15% above", () => {
    close(amazonReferralFee("grocery", 10), 0.8);
    close(amazonReferralFee("grocery", 25), 3.75);
  });

  test("Consumer Electronics 8% is distinct from Accessories marginal tiers", () => {
    close(amazonReferralFee("electronics", 80), 6.4);
    close(amazonReferralFee("electronics", 150), 12);
    close(amazonReferralFee("electronics_accessories", 150), 15 + 4);
    close(amazonReferralFee("home", 1), 0.30);
  });

  test("Flat categories unchanged: home 15%, toys 15%, books 15%, tools 15%", () => {
    close(amazonReferralFee("home", 30), 4.5);
    close(amazonReferralFee("toys", 30), 4.5);
    close(amazonReferralFee("books", 30), 4.5);
    close(amazonReferralFee("tools", 30), 4.5);
  });
});

describe("Walmart uses verified Walmart rates, never Amazon-derived", () => {
  test("Apparel 15%, Electronics 8%, Home 15%", () => {
    close(calculateFees({ ...base, marketplace: "walmart", category: "apparel" }).referralFee, 4.5);
    close(calculateFees({ ...base, marketplace: "walmart", category: "electronics", price: 100 }).referralFee, 8.0);
    close(calculateFees({ ...base, marketplace: "walmart", category: "home" }).referralFee, 4.5);
    close(calculateFees({ ...base, marketplace: "walmart", category: "apparel", price:15 }).referralFee, 0.75);
    close(calculateFees({ ...base, marketplace: "walmart", category: "apparel", price:20 }).referralFee, 2);
  });

  test("No Walmart rate is the Amazon rate × 0.95", () => {
    for (const rate of Object.values(WALMART_REFERRAL_RATES)) {
      if (rate == null) continue;
      expect(rate).not.toBeCloseTo(0.17 * 0.95, 4);
      expect(rate).not.toBeCloseTo(0.15 * 0.95, 4);
      expect(rate).not.toBeCloseTo(0.08 * 0.95, 4);
    }
  });

  test("Categories without a verified Walmart record are flagged unsupported, not estimated", () => {
    for (const category of ["toys", "beauty", "grocery", "books", "tools"]) {
      const r = calculateFees({ ...base, marketplace: "walmart", category });
      expect(r.referralFee).toBe(0);
      expect(r.unsupported.some((u) => u.includes("referral"))).toBe(true);
    }
  });

  test("WFS cannot estimate a base from unit weight without packaged dimensions and eligibility", () => {
    const small = calculateFees({ ...base, marketplace: "walmart", category: "home", weightLb: 1 });
    expect(small.fulfillmentFee).toBe(0);
    expect(small.unsupported.some((u) => u.includes("WFS fulfillment"))).toBe(true);
    const heavy = calculateFees({ ...base, marketplace: "walmart", category: "home", weightLb: 2 });
    expect(heavy.fulfillmentFee).toBe(0);
    expect(heavy.unsupported.some((u) => u.includes("WFS fulfillment"))).toBe(true);
    const large = calculateFees({ ...base, marketplace: "walmart", category: "home", sizeTier: "large_standard" });
    expect(large.unsupported.some((u) => u.includes("WFS fulfillment"))).toBe(true);
  });

  test("Walmart storage is not estimated without season, actual volume and age", () => {
    const r = calculateFees({ ...base, marketplace: "walmart", category: "home", storageMonths: 2 });
    expect(r.storageFee).toBe(0);
    expect(r.unsupported.some((u) => u.includes("WFS storage"))).toBe(true);
  });
});

describe("Shopify Basic online card rate", () => {
  test("$50 sale → 2.9% + $0.30 = $1.75", () => {
    const r = calculateFees({ ...base, marketplace: "shopify", price: 50 });
    close(r.referralFee, 1.75);
  });
});

describe("Etsy verified values", () => {
  test("$20 sale → 6.5% + 3% + $0.25 + $0.20 = $2.35", () => {
    const r = calculateFees({ ...base, marketplace: "etsy", price: 20 });
    close(r.referralFee, 1.3 + 0.6 + 0.25 + 0.2);
  });
});

describe("Amazon fulfillment and storage", () => {
  test("FBA complex current schedule is not approximated with retired universal flat values", () => {
    for (const sizeTier of ["small_standard","large_standard","small_oversize","medium_oversize"] as const) {
      const r = calculateFees({ ...base, sizeTier });
      expect(r.fulfillmentFee).toBe(0);
      expect(r.unsupported.some((u) => u.includes("Amazon FBA fulfillment"))).toBe(true);
    }
  });

  test("Amazon storage cannot infer season and volume from months alone", () => {
    const r = calculateFees({ ...base, storageMonths: 2 });
    expect(r.storageFee).toBe(0);
    expect(r.unsupported.some((u) => u.includes("Amazon storage"))).toBe(true);
  });
});

describe("Excluded components are explicit", () => {
  test("Shopify and Etsy disclose applicable exclusions rather than imply all-in totals", () => {
    for (const marketplace of ["shopify", "etsy"] as const) {
      expect(calculateFees({ ...base, marketplace }).unsupported.length).toBeGreaterThan(0);
    }
  });
  test("Amazon Books charges $1.80 separately and includes it exactly once", () => {
    const r = calculateFees({ ...base, category:"books" });
    expect(r.closingFee).toBe(1.80);
    expect(r.referralFee).toBe(4.50);
    expect(r.totalFees).toBeCloseTo(r.referralFee+r.closingFee+r.fulfillmentFee+r.storageFee+r.returnCost,2);
    expect(calculateFees(base).closingFee).toBe(0);
  });
});
