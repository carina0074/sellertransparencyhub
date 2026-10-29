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
    summary: "Initial public release of the independent marketplace transparency platform, including searchable marketplace datasets and source-linked records.",
    updatedAt: "2026-06-12",
    records: [
      { name: "Marketplace Fee Database", detail: "200+ baseline fee records across Amazon, Walmart, and Shopify — referral, fulfillment, storage, and advertising fees." },
      { name: "Fee Change Tracker", detail: "127 recorded fee-change events with impact levels, affected categories, and source links." },
      { name: "Policy Archive", detail: "150+ policy records with effective dates, summaries, and source links." },
      { name: "Seller Suspension Appeal Library", detail: "Searchable composite case examples and corrective-action guidance for suspension categories; outcomes are illustrative, not verified reinstatement results." },
      { name: "Source references", detail: "Fee and policy records include source URL and title fields." },
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
    title: "Data Foundation & Source References",
    summary: "Established the initial marketplace data structures and documented source links for fee and policy records.",
    updatedAt: "2026-05-20",
    records: [
      { name: "Source references", detail: "Included example links to marketplace fee and policy documentation." },
      { name: "Data schema v1", detail: "Defined separate fee, fee-change, policy, and composite-appeal structures; fee and policy records include source fields and selected timestamps." },
      { name: "Record retrieval", detail: "Implemented database-backed retrieval of stored fee and policy records." },
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