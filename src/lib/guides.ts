import { queryOptions } from "@tanstack/react-query";
import { getFeeRecords, type FeeRecord } from "./fees.functions";
import { formatFeeValue, pricingDetailsSchema } from "./fee-formatting";

export const internationalFeeRecordId = "b0a96d65-9ab9-4655-a678-ba1364a97804";
export const guideSlug = "ebay-international-fee-us-address";
export const guideTitle = "Why did eBay charge me an international fee when I shipped to a US address?";
export const guideSeoTitle = "eBay 1.65% International Fee on US Orders — When It Applies";
export const guideDescription = "eBay charges US sellers a 1.65% international fee if the buyer's registered address is outside the US, even when the item ships to a US address. Here is eBay's exact wording.";

export const guideRecordsQuery = queryOptions({
  queryKey: ["fee-records"],
  queryFn: () => getFeeRecords(),
});

export function internationalFeeEvidence(records: FeeRecord[]) {
  const record = records.find(r => r.id === internationalFeeRecordId);
  if (!record) return null;
  const parsed = pricingDetailsSchema.safeParse(record.pricing_details);
  const details = parsed.success ? parsed.data : null;
  const reference = details?.references.find(r => r.heading === "International fee" && r.quote);
  return { record, details, reference, rate: formatFeeValue(record.value, record.value_type) };
}

export function guideShortAnswer(rate: string) {
  return `eBay charges US-registered sellers a ${rate} international fee in two situations: when the delivery address is outside the US, or when the buyer's eBay account is registered outside the US. The second case applies even if you ship to a US address. That is why sellers who have turned off international shipping can still see this fee.`;
}

/** Illustrative arithmetic only; not a marketplace fee calculator or quotation. */
export function illustrativeInternationalFeeMinor(totalMinor: number, rate: number): number {
  return Math.round(totalMinor * rate);
}