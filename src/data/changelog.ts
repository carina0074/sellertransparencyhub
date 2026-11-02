export interface ChangelogEntry {
  slug: string;
  date: string;
  title: string;
  summary: string;
  /** Date this public entry was last written or revised (not the milestone date). */
  updatedAt: string;
  records: { name: string; detail: string }[];
  sources: { title: string; url: string }[];
  /** Optional detailed sections; when present they replace the milestone-note cards. */
  sections?: ChangelogSection[];
}

export interface ChangelogGroup { label: string; items: string[] }
export interface ChangelogSection {
  heading: string;
  intro?: string;
  groups?: ChangelogGroup[];
  collapsible?: { summary: string; groups: ChangelogGroup[] };
  outro?: string;
}

// Newest first. Only milestones supported by project records (repository history,
// published-site analytics, dated report files) belong here.
export const changelog: ChangelogEntry[] = [
  {
    slug: "october-2026",
    date: "October 2026",
    title: "Research Integrity & Source Verification Update",
    summary:
      "Reviewed published fee records, fee-change events, policy events and reports against marketplace-published documentation. Corrected, qualified or retired claims the evidence did not support; coverage remains curated and non-exhaustive.",
    updatedAt: "2026-11-01",
    records: [
      { name: "Current fee records", detail: "Reviewed against current marketplace-published documentation. Tiered and conditional fees are shown as structured pricing instead of single flat rates, and review dates are kept separate from effective dates." },
      { name: "Historical fee changes and policy events", detail: "Each event was checked for dated evidence. Unsupported events were retired from public view, and dates are shown only to the precision the evidence supports." },
      { name: "Q2 2026 report review", detail: "The June 2026 report is kept as a historical publication. Source citations and labeled review notes were added separately." },
      { name: "Q3 2026 report", detail: "Research and claim-level sourcing completed. Released publicly in October 2026." },
      { name: "Methodology", detail: "Rewritten to describe manual, source-reviewed research with no automated monitoring, along with its limitations." },
    ],
    sections: [
      {
        heading: "Current fee records",
        intro: "Retired 4 unsupported universal Amazon FBA fulfillment rows (not the underlying fee schedules) and restructured or qualified 38 current records to match marketplace-published documentation.",
        collapsible: { summary: "Full list of corrected records", groups: [
          { label: "Retired", items: ["Amazon: Small Standard (≤ 1 lb).", "Amazon: Large Standard (≤ 3 lb).", "Amazon: Small Oversize.", "Amazon: Medium Oversize."] },
          { label: "Restructured or qualified", items: ["Amazon — 271–365 days: Aged inventory surcharge: $5.45–$5.90 USD/cu ft/month by age band, additional to monthly storage.", "Amazon — Eligible standard-size and Small/Large Bulky products: Conditional $0.32–$2.09 per unit shipped; size, shipping weight and historical supply determine the charge. Both 30-day and 90-day supply metrics must be below 28 days.", "Amazon — Electronics Accessories: 15% on the portion through $100; 8% on the portion above $100. $0.30 minimum per item. Separate from Consumer Electronics.", "Amazon — Consumer Electronics: Consumer Electronics only: 8%; $0.30 minimum. Electronics Accessories has a separate marginal schedule. Certain cell phones require approval.", "Amazon — Beauty, Health and Personal Care: 8% at total sales price ≤$10; 15% above $10. $0.30 minimum per item.", "Amazon — Clothing and Accessories: Whole-price tiers: 5% at ≤$15; 10% at >$15–$20; 17% above $20. $0.30 minimum per item.", "Amazon — Home & Kitchen: Official Home and Kitchen category: 15%; $0.30 minimum per item.", "Amazon — Grocery and Gourmet: 8% at total sales price ≤$15; 15% above $15. Official minimum column: none.", "Amazon — Books: 15% referral fee. Separate $1.80 closing fee per item sold; not part of the percentage. Official minimum column: none.", "Amazon — Tools and Home Improvement: 15%; $0.30 minimum per item. Excludes the separate Base Equipment Power Tools category (12%).", "Amazon — Toys and Games: 15%; $0.30 minimum per item.", "Amazon — Standard size — Jan–Sep: Base monthly storage only: standard-size, non-dangerous goods, January–September. Utilization surcharges and special-program adjustments are additional.", "Amazon — Standard size — Oct–Dec: Base monthly storage only: standard-size, non-dangerous goods, October–December. Utilization surcharges and special-program adjustments are additional.", "Amazon — US Professional selling plan: U.S. Professional selling plan only; Individual sellers do not pay this monthly subscription. Other selling fees are additional.", "eBay — Home & Garden: 13.6% through $7,500 per item; 2.35% on excess; plus applicable per-order fee. Most-category U.S. standard schedule.", "eBay — Toys & Hobbies: Default: 13.6% through $7,500 per item, 2.35% on excess + per-order fee. Collectible Card Games and CCG NFTs have exceptions; expand details.", "eBay — Health & Beauty: 13.6% through $7,500 per item; 2.35% on excess; plus applicable per-order fee. Most-category U.S. standard schedule.", "eBay — Electronics — most-category schedule: Most-category U.S. standard schedule, not a Store-specific Electronics rate. 13.6% through $7,500 per item; 2.35% on excess; plus applicable per-order fee.", "eBay — Books & Magazines: 15.3% through $7,500 per item; 2.35% on excess; plus applicable per-order fee. U.S. standard schedule.", "eBay — Clothing, Shoes & Accessories: Default: 13.6% through $7,500 per item, 2.35% on excess + per-order fee. Women’s Bags & Handbags and qualifying Athletic Shoes use different rates; expand details.", "eBay — Qualifying U.S. non-Store listings: First 250 qualifying listings/month free; then $0.35 per additional listing/category. Store allowances and category exclusions differ.", "eBay — Applicable U.S.-registered sellers: 1.65% of total sale when delivery address OR buyer registered address is outside U.S.; qualifying eBay International Shipping exempt. Canada is not universally exempt.", "eBay — U.S. standard selling schedule: Orders ≤$10: $0.30 per order; orders >$10: $0.40 per order. Not per unit. Athletic Shoes with total sale ≥$150 are exempt.", "eBay — U.S. Basic Store subscription: Optional Basic Store: $21.95/month with yearly renewal or $27.95/month with monthly renewal. Both charged monthly; not all sellers.", "Etsy — Advertising — attributed orders: 15% below qualifying $10,000 sales; 12% once at least $10,000 qualifies; maximum $100 USD per attributed order. Enrollment and timing rules apply.", "Etsy — Listing: $0.20 USD per ordinary Etsy listing, whether it sells or not; renewals and multi-quantity rules apply.", "Etsy — U.S. bank-account pricing: U.S. bank-account country / Etsy Payments: 3% + $0.25 USD per order/transaction, including shipping and applicable sales tax.", "Etsy — Selling — U.S. fee basis: 6.5% of listing prices plus shipping and gift wrapping, including paid personalization. U.S. sellers’ sales tax excluded.", "Shopify — Basic plan — U.S. standard online cards: U.S. Shopify Payments Basic: standard online cards 2.9% + $0.30/transaction; premium 3.5% + $0.30; international +1%.", "Shopify — Advanced plan — U.S. standard online cards: U.S. Shopify Payments Advanced: standard online cards 2.5% + $0.30; premium 3.1% + $0.30; international +1%.", "Shopify — Grow plan — U.S. standard online cards: Current Grow plan (not the legacy Shopify plan label): U.S. standard online cards 2.7% + $0.30; premium 3.3% + $0.30; international +1%.", "Shopify — Basic plan — U.S. billing options: $39 USD/month billed monthly; $29 USD/month equivalent billed annually, full year upfront. Promotional offers excluded.", "Walmart — Apparel & Accessories: Whole-price tiers: 5% at ≤$15; 10% at >$15–$20; 15% above $20.", "Walmart — Outdoors Products and Sports: 15% except 8% for Hunting Trail Monitors, Binoculars, Telescopes, Spotting Scopes and Night Vision Goggles.", "Walmart — Home, Kitchen, Decor & Garden: 15% for official Home, Kitchen, Decor & Garden category. Furniture uses a separate schedule.", "Walmart — Consumer Electronics: 8% for official Consumer Electronics category. Electronics Accessories has a separate schedule, not this flat rate.", "Walmart — Standard base; calculated shipping weight ≤1 lb: $3.45 base per unit only for calculated WFS shipping weight ≤1 lb; apparel, hazmat, low-price and oversize charges can be additional.", "Walmart — WFS seasonal and inventory-age storage: $0.75–$7.50 USD/cu ft/month depending on season and inventory age; October–December long-storage uplift applies."] },
        ] },
      },
      {
        heading: "Historical fee changes",
        groups: [
          { label: "Retired these unsupported transition claims, not claims that the underlying fees ceased to exist:", items: ["Amazon — FBA Restructure — 2024 Size Tier Reset.", "Amazon — Home & Kitchen Referral Fee Increase.", "Amazon — Aged Inventory Surcharge — New 271–365d Tier.", "Amazon — Low-Inventory-Level Fee Expansion.", "Amazon — Large Standard FBA Fee Increase.", "eBay — Basic Store annual subscription increase.", "Shopify — Basic Online Card Rate Increase.", "Walmart — WFS Small Electronics Pick & Pack Tier.", "Walmart — Sporting Goods Referral Fee Cut."] },
          { label: "Retained and corrected:", items: ["eBay — Per-order fee tier adjustment: retained the supported old/new amounts; corrected the effective date to March 15, 2024.", "eBay — Clothing & Shoes final value fee increase: corrected the new rate to 13.6% and effective date to February 14, 2025.", "Shopify — Shopify Basic Plan Price Increase: retained the supported old/new amounts; corrected the effective date to April 23, 2023."] },
        ],
      },
      {
        heading: "Policy Archive",
        groups: [{ label: "Retired the following unsupported dated policy claims:", items: ["Amazon — Mandatory GTIN exemption re-verification.", "eBay — Authenticity Guarantee expanded to streetwear.", "Shopify — Shopify Payments reserve rule update.", "Shopify — New Built for Shopify requirements.", "Amazon — Returnless Refund threshold lowered.", "Walmart — Quarterly seller identity re-verification.", "Amazon — Account Health Rating threshold raised to 200.", "Walmart — On-Time Delivery threshold raised to 99%.", "Walmart — Stricter UPC validation on new listings.", "eBay — Updated seller performance standards."] }],
        outro: "Retained eBay UK Simple Delivery, narrowed to eligible UK private sellers and qualified the announced rollout timing rather than presenting it as universally verified enforcement.",
      },
      {
        heading: "Suspension case library",
        intro: "The library described its examples as anonymized real seller cases. They were illustrative composites that could not be verified, so the library was taken offline on October 29, 2026. Its source was retained, not deleted.",
      },
      {
        heading: "Reports and methodology",
        intro: "Preserved the original June Q2 PDF unchanged; added separately labeled review notes and sources on the report page. Completed Q3 claim-level sourcing; released publicly in October 2026. Revised Methodology to describe manual research, limitations and separate current-value/effective-date evidence.",
      },
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
