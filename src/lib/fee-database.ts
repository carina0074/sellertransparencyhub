/**
 * Hand-curated marketplace fee database.
 * Every record is sourced from a public policy page and carries an
 * effective date plus version history so sellers can audit changes.
 *
 * This is a data asset — append to `history` whenever a marketplace
 * publishes a new schedule. Never mutate prior entries.
 */

export type Marketplace = "Amazon" | "Walmart" | "Shopify";
export type FeeType =
  | "Referral"
  | "FBA Fulfillment"
  | "Storage"
  | "Closing"
  | "Payment Processing"
  | "Aged Inventory"
  | "Low Inventory"
  | "Subscription";

export type FeeUnit = "percent" | "usd_per_unit" | "usd_per_cuft" | "usd_per_month";

export type FeeHistoryEntry = {
  /** YYYY-MM-DD when this rate became effective. */
  effective: string;
  value: number;
  /** Optional short note about what changed. */
  note?: string;
};

export type FeeRecord = {
  id: string;
  marketplace: Marketplace;
  category: string;
  feeType: FeeType;
  unit: FeeUnit;
  /** Current (most recent) value. */
  current: number;
  /** Newest-first history. The first entry equals `current`. */
  history: FeeHistoryEntry[];
  /** Public Seller-Central / Walmart / Shopify policy page. */
  sourceUrl: string;
  /** Human-readable source title. */
  sourceTitle: string;
  /** Free-text notes / qualifiers. */
  notes?: string;
};

export const FEE_DATABASE: FeeRecord[] = [
  // ─── Amazon referral percentages ─────────────────────────────────────
  {
    id: "amz-ref-electronics",
    marketplace: "Amazon", category: "Electronics", feeType: "Referral", unit: "percent",
    current: 0.08,
    history: [
      { effective: "2024-01-15", value: 0.08, note: "Reduced from 8% flat" },
      { effective: "2022-01-17", value: 0.08 },
    ],
    sourceUrl: "https://sellercentral.amazon.com/help/hub/reference/external/200336920",
    sourceTitle: "Amazon Seller Central — Referral fees",
    notes: "8% above $100, 15% for portion ≤ $100. Lower-tier rate shown.",
  },
  {
    id: "amz-ref-home",
    marketplace: "Amazon", category: "Home & Kitchen", feeType: "Referral", unit: "percent",
    current: 0.17,
    history: [
      { effective: "2025-01-15", value: 0.17, note: "Increased from 15% to 17%" },
      { effective: "2022-04-01", value: 0.15 },
    ],
    sourceUrl: "https://sellercentral.amazon.com/help/hub/reference/external/200336920",
    sourceTitle: "Amazon Seller Central — Referral fees",
  },
  {
    id: "amz-ref-beauty",
    marketplace: "Amazon", category: "Beauty", feeType: "Referral", unit: "percent",
    current: 0.08,
    history: [{ effective: "2022-01-17", value: 0.08 }],
    sourceUrl: "https://sellercentral.amazon.com/help/hub/reference/external/200336920",
    sourceTitle: "Amazon Seller Central — Referral fees",
    notes: "8% for total sales price ≤ $10, 15% above.",
  },
  {
    id: "amz-ref-apparel",
    marketplace: "Amazon", category: "Apparel", feeType: "Referral", unit: "percent",
    current: 0.17,
    history: [
      { effective: "2023-01-17", value: 0.17, note: "Tier collapse: 17% flat above $15" },
      { effective: "2022-01-17", value: 0.17 },
    ],
    sourceUrl: "https://sellercentral.amazon.com/help/hub/reference/external/200336920",
    sourceTitle: "Amazon Seller Central — Referral fees",
  },
  {
    id: "amz-ref-toys",
    marketplace: "Amazon", category: "Toys & Games", feeType: "Referral", unit: "percent",
    current: 0.15,
    history: [{ effective: "2022-01-17", value: 0.15 }],
    sourceUrl: "https://sellercentral.amazon.com/help/hub/reference/external/200336920",
    sourceTitle: "Amazon Seller Central — Referral fees",
  },
  {
    id: "amz-ref-grocery",
    marketplace: "Amazon", category: "Grocery", feeType: "Referral", unit: "percent",
    current: 0.08,
    history: [{ effective: "2022-01-17", value: 0.08 }],
    sourceUrl: "https://sellercentral.amazon.com/help/hub/reference/external/200336920",
    sourceTitle: "Amazon Seller Central — Referral fees",
    notes: "8% for total sales price ≤ $15, 15% above.",
  },
  {
    id: "amz-ref-books",
    marketplace: "Amazon", category: "Books", feeType: "Referral", unit: "percent",
    current: 0.15,
    history: [{ effective: "2022-01-17", value: 0.15 }],
    sourceUrl: "https://sellercentral.amazon.com/help/hub/reference/external/200336920",
    sourceTitle: "Amazon Seller Central — Referral fees",
    notes: "Plus a $1.80 per-item closing fee for Media items.",
  },
  {
    id: "amz-ref-tools",
    marketplace: "Amazon", category: "Tools & Home Improvement", feeType: "Referral", unit: "percent",
    current: 0.15,
    history: [{ effective: "2022-01-17", value: 0.15 }],
    sourceUrl: "https://sellercentral.amazon.com/help/hub/reference/external/200336920",
    sourceTitle: "Amazon Seller Central — Referral fees",
  },

  // ─── Amazon FBA fulfillment fees ─────────────────────────────────────
  {
    id: "amz-fba-small-std",
    marketplace: "Amazon", category: "Small Standard (≤ 1 lb)", feeType: "FBA Fulfillment", unit: "usd_per_unit",
    current: 3.22,
    history: [
      { effective: "2024-04-15", value: 3.22, note: "Restructured size tiers" },
      { effective: "2023-01-17", value: 3.06 },
      { effective: "2022-01-18", value: 2.92 },
    ],
    sourceUrl: "https://sellercentral.amazon.com/help/hub/reference/external/G201074400",
    sourceTitle: "Amazon Seller Central — FBA fulfillment fees",
  },
  {
    id: "amz-fba-large-std",
    marketplace: "Amazon", category: "Large Standard (≤ 3 lb)", feeType: "FBA Fulfillment", unit: "usd_per_unit",
    current: 5.87,
    history: [
      { effective: "2026-05-12", value: 5.87, note: "+$0.42 — items 12–16 oz reclassified into higher band" },
      { effective: "2024-04-15", value: 5.45 },
      { effective: "2023-01-17", value: 5.20 },
    ],
    sourceUrl: "https://sellercentral.amazon.com/help/hub/reference/external/G201074400",
    sourceTitle: "Amazon Seller Central — FBA fulfillment fees",
  },
  {
    id: "amz-fba-sm-oversize",
    marketplace: "Amazon", category: "Small Oversize", feeType: "FBA Fulfillment", unit: "usd_per_unit",
    current: 9.61,
    history: [
      { effective: "2024-04-15", value: 9.61 },
      { effective: "2023-01-17", value: 9.39 },
    ],
    sourceUrl: "https://sellercentral.amazon.com/help/hub/reference/external/G201074400",
    sourceTitle: "Amazon Seller Central — FBA fulfillment fees",
  },
  {
    id: "amz-fba-med-oversize",
    marketplace: "Amazon", category: "Medium Oversize", feeType: "FBA Fulfillment", unit: "usd_per_unit",
    current: 14.32,
    history: [
      { effective: "2024-04-15", value: 14.32 },
      { effective: "2023-01-17", value: 13.82 },
    ],
    sourceUrl: "https://sellercentral.amazon.com/help/hub/reference/external/G201074400",
    sourceTitle: "Amazon Seller Central — FBA fulfillment fees",
  },

  // ─── Amazon storage / aged / low inventory ──────────────────────────
  {
    id: "amz-storage-std",
    marketplace: "Amazon", category: "Standard size — Jan–Sep", feeType: "Storage", unit: "usd_per_cuft",
    current: 0.87,
    history: [
      { effective: "2024-01-01", value: 0.87 },
      { effective: "2023-01-01", value: 0.83 },
    ],
    sourceUrl: "https://sellercentral.amazon.com/help/hub/reference/external/201112790",
    sourceTitle: "Amazon Seller Central — Monthly storage fees",
  },
  {
    id: "amz-storage-std-oct-dec",
    marketplace: "Amazon", category: "Standard size — Oct–Dec", feeType: "Storage", unit: "usd_per_cuft",
    current: 2.40,
    history: [
      { effective: "2024-10-01", value: 2.40 },
      { effective: "2023-10-01", value: 2.40 },
    ],
    sourceUrl: "https://sellercentral.amazon.com/help/hub/reference/external/201112790",
    sourceTitle: "Amazon Seller Central — Monthly storage fees",
    notes: "Q4 peak rate.",
  },
  {
    id: "amz-aged-271-365",
    marketplace: "Amazon", category: "271–365 days", feeType: "Aged Inventory", unit: "usd_per_cuft",
    current: 3.80,
    history: [
      { effective: "2026-03-09", value: 3.80, note: "New tier split out from 365+" },
    ],
    sourceUrl: "https://sellercentral.amazon.com/help/hub/reference/external/GLWNWQA8H5HJX2SD",
    sourceTitle: "Amazon Seller Central — Aged inventory surcharge",
  },
  {
    id: "amz-low-inventory",
    marketplace: "Amazon", category: "All standard-size SKUs", feeType: "Low Inventory", unit: "usd_per_unit",
    current: 0.32,
    history: [
      { effective: "2026-04-28", value: 0.32, note: "Threshold raised to 28 days of supply" },
      { effective: "2024-04-01", value: 0.30 },
    ],
    sourceUrl: "https://sellercentral.amazon.com/help/hub/reference/external/GVZP9KVUJ9XTWGRP",
    sourceTitle: "Amazon Seller Central — Low-inventory-level fee",
  },
  {
    id: "amz-pro-subscription",
    marketplace: "Amazon", category: "Professional seller plan", feeType: "Subscription", unit: "usd_per_month",
    current: 39.99,
    history: [{ effective: "2017-01-01", value: 39.99 }],
    sourceUrl: "https://sellercentral.amazon.com/help/hub/reference/external/G64491",
    sourceTitle: "Amazon Seller Central — Selling plan pricing",
  },

  // ─── Walmart ─────────────────────────────────────────────────────────
  {
    id: "wmt-ref-electronics",
    marketplace: "Walmart", category: "Electronics", feeType: "Referral", unit: "percent",
    current: 0.08,
    history: [{ effective: "2022-02-01", value: 0.08 }],
    sourceUrl: "https://sellerhelp.walmart.com/seller/s/guide?article=000007569",
    sourceTitle: "Walmart Seller Center — Referral fees",
  },
  {
    id: "wmt-ref-home",
    marketplace: "Walmart", category: "Home & Garden", feeType: "Referral", unit: "percent",
    current: 0.15,
    history: [{ effective: "2022-02-01", value: 0.15 }],
    sourceUrl: "https://sellerhelp.walmart.com/seller/s/guide?article=000007569",
    sourceTitle: "Walmart Seller Center — Referral fees",
  },
  {
    id: "wmt-ref-sporting",
    marketplace: "Walmart", category: "Sporting Goods", feeType: "Referral", unit: "percent",
    current: 0.13,
    history: [
      { effective: "2026-04-05", value: 0.13, note: "Reduced from 15% to 13% for items under $100" },
      { effective: "2022-02-01", value: 0.15 },
    ],
    sourceUrl: "https://sellerhelp.walmart.com/seller/s/guide?article=000007569",
    sourceTitle: "Walmart Seller Center — Referral fees",
  },
  {
    id: "wmt-ref-apparel",
    marketplace: "Walmart", category: "Apparel", feeType: "Referral", unit: "percent",
    current: 0.15,
    history: [{ effective: "2022-02-01", value: 0.15 }],
    sourceUrl: "https://sellerhelp.walmart.com/seller/s/guide?article=000007569",
    sourceTitle: "Walmart Seller Center — Referral fees",
  },
  {
    id: "wmt-wfs-small",
    marketplace: "Walmart", category: "WFS — Small (≤ 1 lb)", feeType: "FBA Fulfillment", unit: "usd_per_unit",
    current: 3.45,
    history: [
      { effective: "2026-02-14", value: 3.45, note: "New small-electronics tier (+$0.15)" },
      { effective: "2024-01-01", value: 3.30 },
    ],
    sourceUrl: "https://sellerhelp.walmart.com/seller/s/guide?article=000010103",
    sourceTitle: "Walmart Fulfillment Services — Fee schedule",
  },
  {
    id: "wmt-wfs-storage",
    marketplace: "Walmart", category: "WFS storage — Standard", feeType: "Storage", unit: "usd_per_cuft",
    current: 0.75,
    history: [{ effective: "2024-01-01", value: 0.75 }],
    sourceUrl: "https://sellerhelp.walmart.com/seller/s/guide?article=000010103",
    sourceTitle: "Walmart Fulfillment Services — Storage fees",
  },

  // ─── Shopify ─────────────────────────────────────────────────────────
  {
    id: "shop-basic-online",
    marketplace: "Shopify", category: "Basic — Online card rate", feeType: "Payment Processing", unit: "percent",
    current: 0.030,
    history: [
      { effective: "2026-03-22", value: 0.030, note: "Online rate increased from 2.9% to 3.0% (+ 30¢)" },
      { effective: "2013-01-01", value: 0.029 },
    ],
    sourceUrl: "https://www.shopify.com/pricing",
    sourceTitle: "Shopify — Plans & pricing",
    notes: "Plus $0.30 per transaction.",
  },
  {
    id: "shop-shopify-online",
    marketplace: "Shopify", category: "Shopify plan — Online card rate", feeType: "Payment Processing", unit: "percent",
    current: 0.027,
    history: [{ effective: "2013-01-01", value: 0.027 }],
    sourceUrl: "https://www.shopify.com/pricing",
    sourceTitle: "Shopify — Plans & pricing",
    notes: "Plus $0.30 per transaction.",
  },
  {
    id: "shop-advanced-online",
    marketplace: "Shopify", category: "Advanced — Online card rate", feeType: "Payment Processing", unit: "percent",
    current: 0.025,
    history: [{ effective: "2013-01-01", value: 0.025 }],
    sourceUrl: "https://www.shopify.com/pricing",
    sourceTitle: "Shopify — Plans & pricing",
    notes: "Plus $0.30 per transaction.",
  },
  {
    id: "shop-basic-sub",
    marketplace: "Shopify", category: "Basic plan", feeType: "Subscription", unit: "usd_per_month",
    current: 39,
    history: [
      { effective: "2023-04-01", value: 39, note: "Plan price increase from $29 to $39" },
      { effective: "2013-01-01", value: 29 },
    ],
    sourceUrl: "https://www.shopify.com/pricing",
    sourceTitle: "Shopify — Plans & pricing",
  },
];

export const MARKETPLACES_LIST: Marketplace[] = ["Amazon", "Walmart", "Shopify"];
export const FEE_TYPES_LIST: FeeType[] = [
  "Referral", "FBA Fulfillment", "Storage", "Payment Processing",
  "Aged Inventory", "Low Inventory", "Closing", "Subscription",
];

export function formatFeeValue(value: number, unit: FeeUnit): string {
  switch (unit) {
    case "percent": return `${(value * 100).toFixed(1)}%`;
    case "usd_per_unit": return `$${value.toFixed(2)} / unit`;
    case "usd_per_cuft": return `$${value.toFixed(2)} / cu.ft`;
    case "usd_per_month": return `$${value.toFixed(2)} / mo`;
  }
}

export function deltaSummary(rec: FeeRecord): { delta: number; pct: number; direction: "up" | "down" | "flat" } | null {
  if (rec.history.length < 2) return null;
  const [now, prev] = rec.history;
  const delta = now.value - prev.value;
  const pct = prev.value === 0 ? 0 : delta / prev.value;
  return {
    delta,
    pct,
    direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
  };
}

/** Recent fee changes across all marketplaces, newest first. */
export type FeeChangeEvent = {
  recordId: string;
  marketplace: Marketplace;
  category: string;
  feeType: FeeType;
  unit: FeeUnit;
  effective: string;
  oldValue: number;
  newValue: number;
  note?: string;
  sourceUrl: string;
  sourceTitle: string;
};

export function getRecentChanges(limit?: number): FeeChangeEvent[] {
  const events: FeeChangeEvent[] = [];
  for (const rec of FEE_DATABASE) {
    for (let i = 0; i < rec.history.length - 1; i++) {
      const cur = rec.history[i];
      const prev = rec.history[i + 1];
      if (cur.value === prev.value && !cur.note) continue;
      events.push({
        recordId: rec.id,
        marketplace: rec.marketplace,
        category: rec.category,
        feeType: rec.feeType,
        unit: rec.unit,
        effective: cur.effective,
        oldValue: prev.value,
        newValue: cur.value,
        note: cur.note,
        sourceUrl: rec.sourceUrl,
        sourceTitle: rec.sourceTitle,
      });
    }
  }
  events.sort((a, b) => b.effective.localeCompare(a.effective));
  return limit ? events.slice(0, limit) : events;
}