export type Marketplace = "amazon" | "walmart" | "shopify" | "etsy";
export type SizeTier = "small_standard" | "large_standard" | "small_oversize" | "medium_oversize";

export const MARKETPLACES: { id: Marketplace; label: string }[] = [
  { id: "amazon", label: "Amazon FBA" },
  { id: "walmart", label: "Walmart Marketplace" },
  { id: "shopify", label: "Shopify" },
  { id: "etsy", label: "Etsy" },
];

export const CATEGORIES = [
  { id: "electronics", label: "Consumer Electronics" },
  { id: "electronics_accessories", label: "Electronics Accessories" },
  { id: "home", label: "Home & Kitchen" },
  { id: "beauty", label: "Beauty & Personal Care" },
  { id: "apparel", label: "Apparel" },
  { id: "toys", label: "Toys & Games" },
  { id: "grocery", label: "Grocery" },
  { id: "books", label: "Books" },
  { id: "tools", label: "Tools & Home Improvement (excluding Base Equipment Power Tools)" },
] as const;

export const SIZE_TIERS: { id: SizeTier; label: string }[] = [
  { id: "small_standard", label: "Small standard (≤ 1 lb)" },
  { id: "large_standard", label: "Large standard (≤ 3 lb)" },
  { id: "small_oversize", label: "Small oversize" },
  { id: "medium_oversize", label: "Medium oversize" },
];

/**
 * Amazon referral fees. Tiered categories are computed from the selling price
 * in amazonReferralFee(); this map holds the flat-rate categories only.
 * Source: Amazon Seller Central public fee schedule.
 * Last reviewed: 2026-10 (Home & Kitchen verified 2026-10-24).
 */
export const AMAZON_REFERRAL_RATES: Record<string, number> = {
  toys: 0.15,
  books: 0.15, // $1.80 per-item closing fee for Media items is NOT included
  tools: 0.15,
};

/**
 * Amazon referral fee in USD, tier-aware where the database record documents tiers.
 * Tiers per verified fee records:
 * - Apparel: 5% ≤ $15, 10% > $15–$20, 17% > $20
 * - Beauty: 8% ≤ $10, 15% above
 * - Grocery: 8% ≤ $15, 15% above
 * - Consumer Electronics: 8%; Electronics Accessories: marginal 15%/8%
 */
export function amazonReferralFee(category: string, price: number): number {
  let fee: number;
  switch (category) {
    case "apparel":
      fee = price * (price <= 15 ? 0.05 : price <= 20 ? 0.1 : 0.17); break;
    case "beauty":
      fee = price * (price <= 10 ? 0.08 : 0.15); break;
    case "grocery":
      return price * (price <= 15 ? 0.08 : 0.15);
    case "electronics":
      fee = price * 0.08; break;
    case "electronics_accessories":
      fee = Math.min(price, 100) * 0.15 + Math.max(0, price - 100) * 0.08; break;
    default:
      fee = price * (AMAZON_REFERRAL_RATES[category] ?? 0.15);
  }
  return category === "books" ? fee : Math.max(0.30, fee);
}

/**
 * FBA flat fees retired after current first-party review (2026-10-29).
 * The calculator lacks the dimensions, price/program and season inputs required
 * by https://sellercentral.amazon.com/help/hub/reference/external/GABBX6GZPA8MSZGW.
 */

/**
 * Verified Walmart referral rates (fee_records, verified 2026-06-11 / 2026-10-24).
 * null = no verified Walmart record for this category — never derived from Amazon.
 */
export const WALMART_REFERRAL_RATES: Record<string, number | null> = {
  electronics: 0.08,
  home: 0.15, // Walmart "Home & Garden" record
  apparel: null, // whole-price tiers handled below, not a universal 15%
  beauty: null,
  toys: null,
  grocery: null,
  books: null,
  tools: null,
};

/**
 * WFS official base: $3.45 at calculated shipping weight ≤1 lb.
 * Calculator cannot establish packaged dimensions, hazmat or oversize eligibility.
 */
export const WALMART_WFS_SMALL_MAX_LB = 1;
export const WALMART_WFS_SMALL_FEE = 3.45;
export const WALMART_STORAGE_PER_CUFT = 0.75;

/** Shopify Basic plan online card rate (verified 2026-10-24). Other plans differ. */
const SHOPIFY_TXN_RATE = 0.029;
const SHOPIFY_TXN_FLAT = 0.3;

/** Etsy verified values: 6.5% transaction; US payment processing 3% + $0.25; $0.20 listing. */
const ETSY_TXN_RATE = 0.065;
const ETSY_PAYMENT_RATE = 0.03; // US rate — varies by country
const ETSY_PAYMENT_FLAT = 0.25;
const ETSY_LISTING_FEE = 0.2;

/**
 * Modeling assumptions — NOT verified marketplace fee data.
 * Rough return-rate estimates by category, used only to illustrate return cost.
 */
const RETURN_RATE: Record<string, number> = {
  electronics: 0.12, home: 0.08, beauty: 0.05, apparel: 0.25,
  toys: 0.07, grocery: 0.02, books: 0.05, tools: 0.09,
};

export type FeeInputs = {
  price: number; cost: number; shipping: number;
  marketplace: Marketplace; category: string;
  weightLb: number; sizeTier: SizeTier; storageMonths: number;
};

export type FeeBreakdown = {
  referralFee: number; fulfillmentFee: number; storageFee: number;
  closingFee: number;
  returnCost: number; totalFees: number; netProfit: number;
  margin: number; recommendation: "healthy" | "moderate" | "warning";
  /** Fee components that could not be estimated from verified data. */
  unsupported: string[];
};

export function calculateFees(i: FeeInputs): FeeBreakdown {
  const unsupported: string[] = [];

  let referralFee: number;
  if (i.marketplace === "amazon") {
    referralFee = amazonReferralFee(i.category, i.price);
  } else if (i.marketplace === "walmart") {
    const rate = WALMART_REFERRAL_RATES[i.category];
    if (i.category === "apparel") {
      referralFee = i.price * (i.price <= 15 ? 0.05 : i.price <= 20 ? 0.10 : 0.15);
    } else if (rate == null) {
      referralFee = 0;
      unsupported.push("Walmart referral fee for this category (no verified rate)");
    } else {
      referralFee = i.price * rate;
    }
  } else if (i.marketplace === "shopify") {
    referralFee = i.price * SHOPIFY_TXN_RATE + SHOPIFY_TXN_FLAT;
    unsupported.push("Shopify subscription allocation and other applicable card/provider charges (assumes U.S. Basic standard online Shopify Payments)");
  } else {
    referralFee = i.price * ETSY_TXN_RATE + i.price * ETSY_PAYMENT_RATE + ETSY_PAYMENT_FLAT + ETSY_LISTING_FEE;
    unsupported.push("Etsy Offsite Ads and other applicable fees (assumes U.S. Etsy Payments and one ordinary listing charge per modeled sale)");
  }

  let fulfillmentFee: number;
  if (i.marketplace === "shopify" || i.marketplace === "etsy") {
    fulfillmentFee = i.shipping; // self-fulfillment assumption
  } else if (i.marketplace === "walmart") {
    fulfillmentFee = 0;
    unsupported.push("WFS fulfillment: packaged dimensions, calculated shipping weight and surcharge eligibility are required");
  } else {
    fulfillmentFee = 0;
    unsupported.push("Amazon FBA fulfillment: current size/weight/price/season and program schedule cannot be modeled from these inputs");
  }

  // Cubic-foot estimates are modeling assumptions, not verified data.
  const storageFee = 0;
  if (i.storageMonths > 0 && (i.marketplace === "amazon" || i.marketplace === "walmart")) {
    unsupported.push(`${i.marketplace === "amazon" ? "Amazon" : "WFS"} storage: actual packaged volume, season, inventory age and applicable surcharges are required`);
  }

  const rRate = RETURN_RATE[i.category] ?? 0.08;
  const returnCost = rRate * (i.price * 0.25 + 2.5);
  const shippingCost = i.marketplace === "shopify" || i.marketplace === "etsy" ? 0 : i.shipping;
  const closingFee = i.marketplace === "amazon" && i.category === "books" ? 1.80 : 0;
  const totalFees = referralFee + closingFee + fulfillmentFee + storageFee + returnCost;
  const netProfit = i.price - i.cost - shippingCost - totalFees;
  const margin = i.price > 0 ? netProfit / i.price : 0;
  let recommendation: FeeBreakdown["recommendation"] = "healthy";
  if (margin < 0.1) recommendation = "warning";
  else if (margin < 0.2) recommendation = "moderate";
  return { referralFee, closingFee, fulfillmentFee, storageFee, returnCost, totalFees, netProfit, margin, recommendation, unsupported };
}

export const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
export const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;
