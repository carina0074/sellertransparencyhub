// Shared wording for the public Technical reference and private export dictionary.
const common: Record<string, string> = {
  id: "Record identifier, used for current-record relationships and prospective edit history.",
  marketplace: "Recorded values: Amazon, eBay, Walmart, Etsy and Shopify. Walmart Marketplace is the display name.",
  region: "Explicit geographic scope. US and UK identify countries; UNSPECIFIED means the evidence does not establish a country. Currency alone is not geography.",
  category: "Recorded category, schedule, price band or applicability grouping; not a unified taxonomy.",
  fee_type: "Recorded fee type; a free-text label, not a unified taxonomy.",
  source_url: "Recorded primary source link.",
  source_title: "Recorded primary source title.",
  notes: "Plain-language conditions and exceptions.",
  title: "The record’s title.",
  summary: "Plain-language summary of the documented change.",
  announcement_date: "When the marketplace published the change; distinct from when it took effect.",
  effective_date_precision: "How precisely the effective timing is established: exact day, month, year or unknown.",
  effective_period: "Effective month (YYYY-MM) or year (YYYY) when no exact day is established; empty for exact or unknown timing.",
  impact_level: "Recorded impact classification; not an official marketplace rating. Empty means not assessed.",
  created_at: "Internal creation timestamp, never proof of marketplace timing.",
  updated_at: "Internal edit timestamp, never proof of marketplace timing.",
  effective_date: "Established effective day; empty when an exact day is not established.",
  value_type: "Unit of the stored fee values; historical conventions are preserved independently.",
};
const byCollection: Record<string, Record<string, string>> = {
  fee_records: {
    fee_name: "The record’s fee label.",
    fee_type: "Observed current values: Advertising, Aged Inventory, Card processing, Final value, Insertion, International, Listing, Low Inventory, Payment processing, Per-order, Referral, Storage, Subscription, Transaction, WFS fulfillment, WFS storage.",
    value: "Headline value. Current percentages are decimal fractions; monetary headlines use the unit stated by value_type. Read conditional values with pricing_details.",
    value_type: "Headline unit. Current percentages are decimal fractions; monetary headlines use the stated dollar-based unit.",
    pricing_details: "Structured pricing, conditions and supporting references; see Normalization rules.",
    effective_date: "Nullable effective day, only where established. Current records have no separate effective-date-precision field.",
    first_effective_date: "Original fee introduction day supported by first_effective_event_id; distinct from current rates effective_date.",
    first_effective_event_id: "Historical fee-change event establishing the original introduction day; its quotes do not verify current rates.",
    last_verified: "Last successful first-party current-value review, not an effective date or a failed access attempt.",
    verification_status: "verified_current_value: reviewed current value and recorded applicability, not proof of its start date. partially_verified: headline value confirmed in a first-party source; at least one stated condition, tier or scope element is unconfirmed and identified in notes. verification_pending: pending; the public formatter suppresses the numeric headline and directs readers to the source.",
    updated_at: "Prospective current-fee edit timestamp. Earlier edits have not been backfilled.",
  },
  fee_changes: {
    record_id: "Nullable link to the same current fee concept, only where supported by evidence.",
    old_value: "Prior scalar in value_type units; empty for new fees or structured-only transitions, not an assumed zero rate.",
    new_value: "New scalar in value_type units; empty for structured transitions, announced averages or introductions with no stated amount.",
    change_amount: "Scalar difference when applicable; empty without a scalar pair. Relative change is calculated separately; legacy zero baselines display New fee.",
    change_details: "Historical tiered_rate_change stores exact announced band labels and paired decimal rates. new_fee optionally stores announced_average amounts as integer USD minor units, never universal rates.",
    evidence_details: "Historical change evidence, supporting references, review date, scope, conditions and current-record linkage reason.",
  },
  policy_changes: {
    policy_area: "Recorded policy or governance area.",
    body_markdown: "Additional explanatory text about the policy event.",
    affected_sellers: "Seller groups affected within the event’s recorded scope.",
    last_verified: "Last recorded policy evidence review, not marketplace change timing.",
    evidence_details: "Policy event evidence, supporting references, review date, scope, conditions and seller impact.",
  },
};
export function fieldMeaning(collection: string, field: string): string {
  return byCollection[collection]?.[field] ?? common[field] ?? "TODO: field meaning not yet documented.";
}