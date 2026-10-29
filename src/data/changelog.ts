export interface ChangelogEntry {
  slug: string;
  date: string;
  title: string;
  summary: string;
  /** Date this public entry was last written or revised (not the milestone date). */
  updatedAt: string;
  records: { name: string; detail: string }[];
  sources: { title: string; url: string }[];
}

// Newest first. Only milestones supported by project records (repository history,
// published-site analytics, dated report files) belong here.
export const changelog: ChangelogEntry[] = [
  {
    slug: "october-2026",
    date: "October 2026",
    title: "Research Integrity & Source Verification Update",
    summary:
      "Reviewed published records and reports against marketplace-published documentation, then corrected, qualified, or retired claims the evidence didn't support. Coverage is described as curated and non-exhaustive.",
    updatedAt: "2026-10-29",
    records: [
      { name: "Current fee records", detail: "Reviewed against current marketplace-published documentation. Tiered and conditional fees are shown as structured pricing instead of single flat rates, and review dates are kept separate from effective dates." },
      { name: "Historical fee changes and policy events", detail: "Each event was checked for dated evidence. Unsupported events were retired from public view, and dates are shown only to the precision the evidence supports." },
      { name: "Q2 2026 report review", detail: "The June 2026 report is kept as a historical publication. Source citations and labeled review notes were added separately." },
      { name: "Q3 2026 report", detail: "Research and claim-level sourcing completed. Not yet publicly released at the time of this entry." },
      { name: "Methodology", detail: "Rewritten to describe manual, source-reviewed research with no automated monitoring, along with its limitations." },
    ],
    sources: [],
  },
  {
    slug: "q2-2026-report",
    date: "June 2026",
    title: "Q2 2026 Marketplace Fee Transparency Report",
    summary:
      "First quarterly research publication: a qualitative review of fee categories and transparency across Amazon, Walmart Marketplace, eBay, and Etsy for April–June 2026.",
    updatedAt: "2026-10-29",
    records: [
      { name: "Original publication", detail: "Published as a PDF and web page in June 2026. The original PDF remains available unchanged." },
      { name: "Later review", detail: "Source citations were added in October 2026 and are labeled separately from the original text." },
    ],
    sources: [],
  },
  {
    slug: "june-2026",
    date: "June 2026",
    title: "Public Launch",
    summary:
      "Seller Transparency Hub became publicly accessible, with an initial marketplace fee database, fee-change and policy pages, a fee calculator, and a methodology page.",
    updatedAt: "2026-10-29",
    records: [
      { name: "Initial platform", detail: "Built and deployed in June 2026, with a database for fee records, fee-change events, and policy records." },
      { name: "Source-linked records", detail: "Fee and policy records included fields for source documentation links." },
      { name: "Public research pages", detail: "Fee Database, Fee Change Feed, Policy Archive, Calculator, and Methodology." },
    ],
    sources: [],
  },
];

export const getChangelogEntry = (slug: string) =>
  changelog.find((e) => e.slug === slug);
