import { describe, expect, test } from "bun:test";
import {
  amazonReferralFee,
  calculateFees,
  WALMART_REFERRAL_RATES,
  WALMART_WFS_SMALL_FEE,
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

  test("Electronics: 15% on portion ≤ $100, 8% above", () => {
    close(amazonReferralFee("electronics", 80), 12.0);
    close(amazonReferralFee("electronics", 150), 15 + 4);
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

  test("WFS fulfillment: $3.45 only for Small ≤ 1 lb; other sizes flagged unsupported", () => {
    const small = calculateFees({ ...base, marketplace: "walmart", category: "home", weightLb: 1 });
    close(small.fulfillmentFee, WALMART_WFS_SMALL_FEE);
    const heavy = calculateFees({ ...base, marketplace: "walmart", category: "home", weightLb: 2 });
    expect(heavy.fulfillmentFee).toBe(0);
    expect(heavy.unsupported.some((u) => u.includes("WFS fulfillment"))).toBe(true);
    const large = calculateFees({ ...base, marketplace: "walmart", category: "home", sizeTier: "large_standard" });
    expect(large.unsupported.some((u) => u.includes("WFS fulfillment"))).toBe(true);
  });

  test("Walmart storage uses the verified WFS $0.75/cu ft, not Amazon's $0.87", () => {
    const r = calculateFees({ ...base, marketplace: "walmart", category: "home", storageMonths: 2 });
    close(r.storageFee, 0.05 * 0.75 * 2);
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
  test("FBA fulfillment matches verified tier fees with no weight surcharge", () => {
    close(calculateFees({ ...base, weightLb: 3 }).fulfillmentFee, 3.22);
    close(calculateFees({ ...base, sizeTier: "large_standard" }).fulfillmentFee, 5.87);
    close(calculateFees({ ...base, sizeTier: "small_oversize" }).fulfillmentFee, 9.61);
    close(calculateFees({ ...base, sizeTier: "medium_oversize" }).fulfillmentFee, 14.32);
  });

  test("Amazon storage uses $0.87/cu ft (Jan–Sep)", () => {
    close(calculateFees({ ...base, storageMonths: 2 }).storageFee, 0.05 * 0.87 * 2);
  });
});

describe("Supported marketplaces never report unsupported components", () => {
  test("Amazon, Shopify, Etsy produce no unsupported flags", () => {
    for (const marketplace of ["amazon", "shopify", "etsy"] as const) {
      expect(calculateFees({ ...base, marketplace }).unsupported).toEqual([]);
    }
  });
});
