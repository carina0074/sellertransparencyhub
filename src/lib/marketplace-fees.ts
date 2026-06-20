export type Marketplace = "amazon" | "walmart" | "shopify" | "etsy";
export type SizeTier = "small_standard" | "large_standard" | "small_oversize" | "medium_oversize";

export const MARKETPLACES: { id: Marketplace; label: string }[] = [
  { id: "amazon", label: "Amazon FBA" },
  { id: "walmart", label: "Walmart Marketplace" },
  { id: "shopify", label: "Shopify" },
  { id: "etsy", label: "Etsy" },
];

export const CATEGORIES = [
  { id: "electronics", label: "Electronics" },
  { id: "home", label: "Home & Kitchen" },
  { id: "beauty", label: "Beauty & Personal Care" },
  { id: "apparel", label: "Apparel" },
  { id: "toys", label: "Toys & Games" },
  { id: "grocery", label: "Grocery" },
  { id: "books", label: "Books" },
  { id: "tools", label: "Tools & Home Improvement" },
] as const;

export const SIZE_TIERS: { id: SizeTier; label: string }[] = [
  { id: "small_standard", label: "Small standard (≤ 1 lb)" },
  { id: "large_standard", label: "Large standard (≤ 3 lb)" },
  { id: "small_oversize", label: "Small oversize" },
  { id: "medium_oversize", label: "Medium oversize" },
];

/**
 * Hand-maintained rate card from Amazon Seller Central public fee schedule.
 * Source: https://sellercentral.amazon.com/help/hub/reference/external/200336920
 * Last reviewed: 2025-01. Update this object when Amazon publishes a new schedule.
 */
export const AMAZON_REFERRAL_RATES: Record<string, number> = {
  electronics: 0.08,
  home: 0.15,
  beauty: 0.08,            // ≤ $10 = 8%, > $10 = 15% — using lower-tier default
  apparel: 0.17,
  toys: 0.15,
  grocery: 0.08,
  books: 0.15,
  tools: 0.15,
};

/**
 * Amazon FBA fulfillment fee — base per-unit (USD) by size tier.
 * Source: https://sellercentral.amazon.com/help/hub/reference/external/G201074400
 * Last reviewed: 2025-01.
 */
export const AMAZON_FULFILLMENT_FEES: Record<SizeTier, number> = {
  small_standard: 3.22,
  large_standard: 5.87,
  small_oversize: 9.61,
  medium_oversize: 14.32,
};

/** Amazon FBA monthly storage fee per cubic foot (Jan–Sep, standard size). */
export const AMAZON_STORAGE_PER_CUFT = 0.87;

const MARKETPLACE_REFERRAL_MULT: Record<Marketplace, number> = {
  amazon: 1, walmart: 0.95, shopify: 0, etsy: 0,
};

const SHOPIFY_TXN_RATE = 0.029;
const SHOPIFY_TXN_FLAT = 0.3;

const ETSY_TXN_RATE = 0.065;
const ETSY_PAYMENT_RATE = 0.03;
const ETSY_PAYMENT_FLAT = 0.25;
const ETSY_LISTING_FEE = 0.20;

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
  returnCost: number; totalFees: number; netProfit: number;
  margin: number; recommendation: "healthy" | "moderate" | "warning";
};

export function calculateFees(i: FeeInputs): FeeBreakdown {
  const referralBase = (AMAZON_REFERRAL_RATES[i.category] ?? 0.15) * i.price;
  let referralFee = referralBase * MARKETPLACE_REFERRAL_MULT[i.marketplace];
  if (i.marketplace === "shopify") {
    referralFee = i.price * SHOPIFY_TXN_RATE + SHOPIFY_TXN_FLAT;
  }
  if (i.marketplace === "etsy") {
    referralFee = i.price * ETSY_TXN_RATE + i.price * ETSY_PAYMENT_RATE + ETSY_PAYMENT_FLAT + ETSY_LISTING_FEE;
  }
  const fulfillmentBase = AMAZON_FULFILLMENT_FEES[i.sizeTier];
  const weightSurcharge = Math.max(0, i.weightLb - 1) * 0.38;
  const fulfillmentFee = i.marketplace === "shopify" || i.marketplace === "etsy"
    ? i.shipping
    : fulfillmentBase + weightSurcharge;
  const cuftEstimate = ({
    small_standard: 0.05, large_standard: 0.12,
    small_oversize: 0.6, medium_oversize: 1.4,
  } as Record<SizeTier, number>)[i.sizeTier];
  const storageFee = i.marketplace === "shopify" || i.marketplace === "etsy"
    ? 0
    : cuftEstimate * AMAZON_STORAGE_PER_CUFT * i.storageMonths;
  const rRate = RETURN_RATE[i.category] ?? 0.08;
  const returnCost = rRate * (i.price * 0.25 + 2.5);
  const shippingCost = i.marketplace === "shopify" || i.marketplace === "etsy" ? 0 : i.shipping;
  const totalFees = referralFee + fulfillmentFee + storageFee + returnCost;
  const netProfit = i.price - i.cost - shippingCost - totalFees;
  const margin = i.price > 0 ? netProfit / i.price : 0;
  let recommendation: FeeBreakdown["recommendation"] = "healthy";
  if (margin < 0.1) recommendation = "warning";
  else if (margin < 0.2) recommendation = "moderate";
  return { referralFee, fulfillmentFee, storageFee, returnCost, totalFees, netProfit, margin, recommendation };
}

export const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
export const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;