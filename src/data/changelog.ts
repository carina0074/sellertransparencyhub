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
    title: "Marketplace Transparency Hub v1.0 — Public Launch",
    summary: "Initial public release of the independent marketplace transparency platform. Four searchable datasets, continuous monitoring, and verified source citations.",
    updatedAt: "2026-06-12",
    records: [
      { name: "Marketplace Fee Database", detail: "200+ baseline fee records across Amazon, Walmart, and Shopify — referral, fulfillment, storage, and advertising fees." },
      { name: "Fee Change Tracker", detail: "127 historical and upcoming fee changes with impact levels, affected categories, and official announcement links." },
      { name: "Policy Archive", detail: "150+ policy records with effective dates, diffs, and primary source citations." },
      { name: "Seller Suspension Appeal Database", detail: "Templates, policy references, and successful reinstatement strategies for common suspension types." },
      { name: "Live Monitoring", detail: "25 official sources actively monitored for fee, policy, and compliance updates." },
    ],
    sources: [
      { title: "Amazon Seller Central — Selling Fees", url: "https://sellercentral.amazon.com/help/hub/reference/G200336920" },
      { title: "Walmart Seller Center — Referral Fees", url: "https://sellerhelp.walmart.com/seller/s/guide?article=000007072" },
      { title: "Shopify Pricing", url: "https://www.shopify.com/pricing" },
    ],
  },
  {
    slug: "may-2026",
    date: "May 2026",
    title: "Data Foundation & Source Verification",
    summary: "Built the baseline dataset, verified all primary sources, and established the continuous monitoring pipeline before public launch.",
    updatedAt: "2026-05-20",
    records: [
      { name: "Source catalog", detail: "Mapped and verified 25 official policy and fee documentation URLs across Amazon, Walmart, eBay, and Shopify." },
      { name: "Data schema v1", detail: "Standardized record format for fees, policies, and appeals with audit fields and source citations." },
      { name: "Monitoring pipeline", detail: "Automated checks for changes to tracked documentation pages, with change-detection alerts." },
    ],
    sources: [
      { title: "Amazon Seller Central", url: "https://sellercentral.amazon.com/" },
      { title: "Walmart Seller Center", url: "https://sellerhelp.walmart.com/" },
      { title: "Shopify Help Center", url: "https://help.shopify.com/" },
    ],
  },
];

export const getChangelogEntry = (slug: string) =>
  changelog.find((e) => e.slug === slug);