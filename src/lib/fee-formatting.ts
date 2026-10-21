import { z } from "zod";

const fraction = z.number().min(0).max(1);
const minor = z.number().int().nonnegative();
const common = {
  reviewed_on: z.string(),
  legacy_source: z.boolean(),
  conditions: z.array(z.string()).min(1),
  references: z.array(z.object({ title: z.string(), url: z.string().url().startsWith("https://") })),
};
export const pricingDetailsSchema = z.discriminatedUnion("kind", [
  z.object({ ...common, kind: z.literal("simple") }),
  z.object({ ...common, kind: z.literal("listing") }),
  z.object({ ...common, kind: z.literal("processing"), bank_account_country: z.literal("US"), fixed_minor: minor, currency: z.literal("USD") }),
  z.object({ ...common, kind: z.literal("offsite_ads"), below_threshold_rate: fraction, threshold_reached_rate: fraction, threshold_minor: minor.positive(), threshold_currency: z.literal("USD"), window_days: z.number().int().positive(), attribution_days: z.number().int().positive(), cap_minor: minor, currency: z.literal("USD") }),
]);
export type PricingDetails = z.infer<typeof pricingDetailsSchema>;

export function formatFeeValue(value: number, valueType: string): string {
  switch (valueType) {
    case "percent": return `${(value * 100).toFixed(1)}%`;
    case "usd": return `$${value.toFixed(2)} USD`;
    case "usd_per_unit": return `$${value.toFixed(2)} / unit`;
    case "usd_per_cuft": return `$${value.toFixed(2)} / cu.ft`;
    case "usd_per_month": return `$${value.toFixed(2)} / mo`;
    default: return value.toString();
  }
}

export function resolveOffsiteAdsRate(details: Extract<PricingDetails, { kind: "offsite_ads" }>, revenueMinor: number, thresholdPreviouslyReached: boolean) {
  return thresholdPreviouslyReached || revenueMinor >= details.threshold_minor
    ? details.threshold_reached_rate : details.below_threshold_rate;
}

type DisplayRecord = { marketplace: string; fee_name: string; value: number; value_type: string; pricing_details?: unknown };
export function presentFee(record: DisplayRecord): { value: string; details: PricingDetails | null } {
  const plain = formatFeeValue(record.value, record.value_type);
  if (record.marketplace !== "Etsy") return { value: plain, details: null };
  const parsed = pricingDetailsSchema.safeParse(record.pricing_details);
  const expected = ({ "Transaction Fee": "simple", "Payment Processing Fee": "processing", "Offsite Ads Fee": "offsite_ads", "Listing Fee": "listing" } as Record<string, string>)[record.fee_name];
  if (!parsed.success || parsed.data.kind !== expected) {
    return { value: expected ? "Pricing details unavailable" : plain, details: null };
  }
  const details = parsed.data;
  if (details.kind === "processing") {
    return { value: `${plain} + ${formatFeeValue(details.fixed_minor / 100, "usd")} / order (${details.bank_account_country})`, details };
  }
  if (details.kind === "offsite_ads") {
    return { value: `${formatFeeValue(details.threshold_reached_rate, "percent")} or ${formatFeeValue(details.below_threshold_rate, "percent")} — conditional`, details };
  }
  return { value: details.kind === "listing" ? `${plain} / listing` : plain, details };
}