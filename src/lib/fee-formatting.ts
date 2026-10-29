import { z } from "zod";

const fraction = z.number().min(0).max(1);
const minor = z.number().int().nonnegative();
const common = {
  reviewed_on: z.string(),
  legacy_source: z.boolean(),
  conditions: z.array(z.string()).min(1),
  references: z.array(z.object({ title: z.string(), url: z.string().url().startsWith("https://"), quote: z.string().optional() })),
  scope: z.string().optional(),
  basis: z.string().optional(),
  minimum_minor: minor.nullable().optional(),
  separate_closing_minor: minor.optional(),
};
const tier = z.object({
  label: z.string(), rate: fraction.optional(), amount_minor: minor.optional(),
  upper_minor: minor.nullable().optional(), effective_date: z.string().optional(),
});
export const pricingDetailsSchema = z.discriminatedUnion("kind", [
  z.object({ ...common, kind: z.literal("simple") }),
  z.object({ ...common, kind: z.literal("listing") }),
  z.object({ ...common, kind: z.literal("processing"), bank_account_country: z.literal("US"), fixed_minor: minor, currency: z.literal("USD"), unit: z.enum(["order", "transaction"]).optional() }),
  z.object({ ...common, kind: z.literal("offsite_ads"), below_threshold_rate: fraction, threshold_reached_rate: fraction, threshold_minor: minor.positive(), threshold_currency: z.literal("USD"), window_days: z.number().int().positive(), attribution_days: z.number().int().positive(), cap_minor: minor, currency: z.literal("USD") }),
  z.object({ ...common, kind: z.literal("tiered"), mode: z.enum(["threshold", "marginal", "schedule"]), currency: z.literal("USD"), unit: z.string(), tiers: z.array(tier).min(1), per_order_fee: z.boolean().optional() }),
  z.object({ ...common, kind: z.literal("order_fee"), threshold_minor: minor, below_or_equal_minor: minor, above_minor: minor, currency: z.literal("USD") }),
  z.object({ ...common, kind: z.literal("allowance"), free_listings: minor, additional_minor: minor, currency: z.literal("USD") }),
  z.object({ ...common, kind: z.literal("subscription"), currency: z.literal("USD"), options: z.array(z.object({ label: z.string(), monthly_minor: minor })).min(1) }),
]);
export type PricingDetails = z.infer<typeof pricingDetailsSchema>;

// A zero baseline has no defined relative percentage change.
export function relativeFeeChange(oldValue: number, newValue: number): number | null {
  return oldValue === 0 ? null : (newValue - oldValue) / oldValue;
}

export function formatFeeValue(value: number, valueType: string): string {
  switch (valueType) {
    case "percent": {
      // Exact precision: keep at least one decimal, never round away significant digits.
      const pct = Math.round(value * 10000) / 100;
      return `${pct.toFixed(2).replace(/0$/, "")}%`;
    }
    case "usd": return `$${value.toFixed(2)} USD`;
    case "usd_per_unit": return `$${value.toFixed(2)} / unit`;
    case "usd_per_cuft": return `$${value.toFixed(2)} / cu.ft`;
    case "usd_per_month": return `$${value.toFixed(2)} / mo`;
    case "usd_per_order": return `$${value.toFixed(2)} USD / order`;
    case "usd_per_listing": return `$${value.toFixed(2)} USD / listing`;
    default: return value.toString();
  }
}

export function resolveOffsiteAdsRate(details: Extract<PricingDetails, { kind: "offsite_ads" }>, revenueMinor: number, thresholdPreviouslyReached: boolean) {
  return thresholdPreviouslyReached || revenueMinor >= details.threshold_minor
    ? details.threshold_reached_rate : details.below_threshold_rate;
}

export type VerificationStatus = "verified_current_value" | "partially_verified" | "verification_pending";
export function verificationLabel(status?: string): string {
  return status === "verified_current_value" ? "Verified current value" : status === "partially_verified" ? "Partially verified" : "Verification pending";
}
export function effectiveDateLabel(date: string | null): string {
  return date ?? "Not independently established";
}

// Whole-price thresholds and marginal portions are intentionally different operations.
export function evaluatePercentageTiers(details: Extract<PricingDetails, { kind: "tiered" }>, salesMinor: number): number | null {
  if (details.mode === "schedule" || salesMinor < 0) return null;
  let feeMinor = 0;
  let previousUpper = 0;
  for (const t of details.tiers) {
    if (t.rate === undefined) return null;
    const upper = t.upper_minor ?? Infinity;
    if (upper <= previousUpper) return null;
    if (details.mode === "threshold") {
      if (salesMinor <= upper) return Math.max(salesMinor * t.rate, details.minimum_minor ?? 0);
    } else {
      feeMinor += Math.max(0, Math.min(salesMinor, upper) - previousUpper) * t.rate;
      if (salesMinor <= upper) return Math.max(feeMinor, details.minimum_minor ?? 0);
    }
    previousUpper = upper;
  }
  return null;
}

export function tierAmount(t: z.infer<typeof tier>, unit: string): string {
  return t.rate !== undefined ? formatFeeValue(t.rate, "percent") : t.amount_minor !== undefined ? `${formatFeeValue(t.amount_minor / 100, "usd")} ${unit}` : "Not established";
}
type DisplayRecord = { marketplace: string; fee_name: string; value: number; value_type: string; pricing_details?: unknown; verification_status?: string };
export function presentFee(record: DisplayRecord): { value: string; details: PricingDetails | null } {
  const plain = formatFeeValue(record.value, record.value_type);
  const parsed = pricingDetailsSchema.safeParse(record.pricing_details);
  const expected = record.marketplace === "Etsy" ? ({ "Transaction Fee": "simple", "Payment Processing Fee": "processing", "Offsite Ads Fee": "offsite_ads", "Listing Fee": "listing" } as Record<string, string>)[record.fee_name] : undefined;
  if (record.verification_status === "verification_pending") return { value: "Verification pending — see source", details: parsed.success ? parsed.data : null };
  if (record.marketplace !== "Etsy" && parsed.success && (parsed.data.kind === "offsite_ads" || parsed.data.kind === "listing")) return { value: plain, details: null };
  if (!parsed.success || parsed.data.kind !== expected) {
    if (!parsed.success || expected) return { value: expected || record.verification_status ? "Pricing details unavailable" : plain, details: null };
  }
  if (!parsed.success) return { value: "Pricing details unavailable", details: null };
  const details = parsed.data;
  if (details.kind === "processing") {
    return { value: `${plain} + ${formatFeeValue(details.fixed_minor / 100, "usd")} / ${details.unit ?? "order"} (${details.bank_account_country})`, details };
  }
  if (details.kind === "offsite_ads") {
    return { value: `${formatFeeValue(details.threshold_reached_rate, "percent")} or ${formatFeeValue(details.below_threshold_rate, "percent")} — conditional`, details };
  }
  if (details.kind === "tiered") {
    const rates = details.tiers.flatMap((t) => t.rate === undefined ? [] : [t.rate]);
    const amounts = details.tiers.flatMap((t) => t.amount_minor === undefined ? [] : [t.amount_minor]);
    const range = rates.length === details.tiers.length
      ? `${formatFeeValue(Math.min(...rates), "percent")}–${formatFeeValue(Math.max(...rates), "percent")}`
      : amounts.length === details.tiers.length
        ? `${formatFeeValue(Math.min(...amounts) / 100, "usd")}–${formatFeeValue(Math.max(...amounts) / 100, "usd")} ${details.unit}`
        : "Variable — see fee details";
    return { value: `${range}${details.mode === "marginal" ? " — marginal tiers" : " — conditional"}${details.per_order_fee ? " + per-order fee" : ""}`, details };
  }
  if (details.kind === "order_fee") return { value: `${formatFeeValue(details.below_or_equal_minor / 100, "usd")} or ${formatFeeValue(details.above_minor / 100, "usd")} / order`, details };
  if (details.kind === "allowance") return { value: `${details.free_listings} qualifying listings free; then ${formatFeeValue(details.additional_minor / 100, "usd")} / listing`, details };
  if (details.kind === "subscription") return { value: details.options.map((o) => `${formatFeeValue(o.monthly_minor / 100, "usd")} / mo (${o.label})`).join(" or "), details };
  return { value: details.kind === "listing" ? `${plain} / listing` : plain, details };
}