import { queryOptions } from "@tanstack/react-query";
import { getPolicyChanges, type FeeRecord, type PolicyChange } from "./fees.functions";
import { pricingDetailsSchema, evaluateFlatListingTiers, type PricingDetails } from "./fee-formatting";
import { policyEvidenceSchema } from "./policy-evidence";
import { formatVerificationDate } from "./coverage-statistics";

export const subtitleRecordId = "dbf965f5-b3f4-49dc-a9cb-60f923f5ddf2";
export const promotedPolicyId = "c4f4c72c-35cc-487b-8fd1-efa763f4fcb3";
export const subtitleGuide = {
  slug: "ebay-subtitle-fee",
  title: "How much does the eBay subtitle cost, and is it charged every month?",
  seoTitle: "eBay Subtitle Fee 2026 — Auction vs Fixed Price, Monthly Renewals",
  description: "eBay's subtitle upgrade costs $1.50–$6.00 per listing depending on format and price, and Good 'Til Cancelled listings are charged again every month. eBay's exact wording.",
};
export const promotedGuide = {
  slug: "ebay-promoted-listings-general-ad-fee",
  title: "Why am I charged an eBay Promoted Listings fee when the buyer didn't click my ad?",
  seoTitle: 'eBay Promoted Listings General Ad Fee — "Any Buyer Clicked" Rule (2026)',
  description: "Since January 13, 2026, eBay charges a general-campaign ad fee if any buyer clicked the ad in the last 30 days, not only the buyer who purchased. eBay's exact wording.",
};
export const guidePoliciesQuery = queryOptions({ queryKey: ["policy-changes"], queryFn: () => getPolicyChanges() });

export function subtitleEvidence(records: FeeRecord[]) {
  const record = records.find(r => r.id === subtitleRecordId);
  if (!record) return null;
  const parsed = pricingDetailsSchema.safeParse(record.pricing_details);
  if (!parsed.success || parsed.data.kind !== "tiered" || parsed.data.mode !== "threshold") return null;
  return { record, details: parsed.data };
}
export function promotedEvidence(records: PolicyChange[]) {
  const record = records.find(r => r.id === promotedPolicyId);
  if (!record) return null;
  const parsed = policyEvidenceSchema.safeParse(record.evidence_details);
  return parsed.success ? { record, details: parsed.data } : null;
}
export const subtitleShortAnswer = "On eBay.com (standard, non-Store sellers), the subtitle upgrade is a flat fee per listing that depends on the listing format and item price. For fixed-price Good 'Til Cancelled listings, it is charged again every time the listing renews each calendar month, whether or not the item sells.";

export function promotedShortAnswer(record: PolicyChange) {
  const date = record.effective_date_precision === "exact" && record.effective_date ? formatVerificationDate(record.effective_date) : null;
  return `${date ? `Since ${date}, ` : ""}for items promoted with a general campaign strategy, eBay charges the ad fee when the item sells and any buyer clicked its general ad in the most recent 30 days, even if the person who bought it never clicked the ad. The item must be promoted at both the time of the click and the time of the sale.`;
}
/** Illustration uses the live fixed-price standard tier, never a copied fee amount. */
export function subtitleIllustration(details: Extract<PricingDetails, { kind: "tiered" }>, priceMinor: number, months: number) {
  if (!Number.isInteger(months) || months < 1) return null;
  const monthlyMinor = evaluateFlatListingTiers(details, priceMinor, "fixed_price", "standard");
  return monthlyMinor === null ? null : { monthlyMinor, totalMinor: monthlyMinor * months };
}
export function guideHead(guide: typeof subtitleGuide, answer: string | null) {
  const url = `https://sellertransparency.com/guides/${guide.slug}`;
  return {
    meta: [
      { title: guide.seoTitle },
      { name: "description", content: guide.description },
      { property: "og:title", content: guide.seoTitle },
      { property: "og:description", content: guide.description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: url },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: answer ? [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: [{ "@type": "Question", name: guide.title, acceptedAnswer: { "@type": "Answer", text: answer } }],
    }) }] : [],
  };
}