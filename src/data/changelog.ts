export interface ChangelogEntry {
  slug: string;
  date: string;
  title: string;
  summary: string;
  updatedAt: string;
  records: { name: string; detail: string }[];
  sources: { title: string; url: string }[];
}

export const changelog: ChangelogEntry[] = [
  {
    slug: "june-2026",
    date: "June 2026",
    title: "Added Walmart fee schedules",
    summary: "Imported the latest Walmart Marketplace referral and fulfillment fee schedules across all categories, plus launched filtering on the fee change tracker.",
    updatedAt: "2026-06-10",
    records: [
      { name: "Walmart referral fees", detail: "34 category records archived from official Seller Center documentation." },
      { name: "Walmart WFS fulfillment fees", detail: "Standard and oversize tiers added, effective 2026-06-01." },
      { name: "Fee change tracker filters", detail: "Filter by marketplace, category, and impact level." },
    ],
    sources: [
      { title: "Walmart Seller Center — Referral Fees", url: "https://sellerhelp.walmart.com/seller/s/guide?article=000007072" },
      { title: "Walmart Fulfillment Services Pricing", url: "https://sellerhelp.walmart.com/seller/s/guide?article=000009576" },
    ],
  },
  {
    slug: "may-2026",
    date: "May 2026",
    title: "Added Amazon storage surcharge changes",
    summary: "Tracked Amazon's 2026 monthly inventory storage and aged inventory surcharge updates and expanded the suspension appeal template library.",
    updatedAt: "2026-05-15",
    records: [
      { name: "Amazon monthly storage fees", detail: "Q1–Q4 2026 standard and oversize rates archived." },
      { name: "Aged inventory surcharge", detail: "Updated thresholds for 181–270 day and 271–365 day buckets." },
      { name: "Suspension appeal templates", detail: "6 new templates for Section 3, inauthentic, and used-sold-as-new." },
    ],
    sources: [
      { title: "Amazon — Monthly Inventory Storage Fees", url: "https://sellercentral.amazon.com/help/hub/reference/G201112710" },
      { title: "Amazon — Aged Inventory Surcharge", url: "https://sellercentral.amazon.com/help/hub/reference/GHHFE5UPSC8ZW3HD" },
    ],
  },
  {
    slug: "april-2026",
    date: "April 2026",
    title: "Archived Q1 policy updates",
    summary: "Captured all marketplace policy updates from January through March 2026 and added the Shopify referral fee dataset.",
    updatedAt: "2026-04-22",
    records: [
      { name: "Q1 2026 policy archive", detail: "42 policy change records across Amazon, Walmart, eBay, and Shopify." },
      { name: "Shopify transaction fees", detail: "Plan-by-plan rates archived with effective dates." },
    ],
    sources: [
      { title: "Amazon Seller News", url: "https://sellercentral.amazon.com/seller-news" },
      { title: "Shopify Pricing", url: "https://www.shopify.com/pricing" },
    ],
  },
  {
    slug: "march-2026",
    date: "March 2026",
    title: "Launched Marketplace Fee Database v1",
    summary: "Initial public release of the searchable fee database and policy archive across Amazon, Walmart, and Shopify.",
    updatedAt: "2026-03-18",
    records: [
      { name: "Marketplace Fee Database v1", detail: "200+ baseline fee records across three marketplaces." },
      { name: "Policy archive", detail: "150+ historical policy records with source citations." },
    ],
    sources: [
      { title: "Amazon Seller Central — Selling Fees", url: "https://sellercentral.amazon.com/help/hub/reference/G200336920" },
      { title: "Walmart Seller Center", url: "https://sellerhelp.walmart.com/" },
    ],
  },
];

export const getChangelogEntry = (slug: string) =>
  changelog.find((e) => e.slug === slug);