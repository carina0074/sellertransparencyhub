import { effectiveDateLabel, pricingDetailsSchema } from "./fee-formatting";
import { historicalSortDate } from "./historical-fee-formatting";

export function sortFeeEvents<T extends { id: string; effective_date: string | null; effective_date_precision?: string; effective_period?: string | null }>(events: T[]): T[] {
  return [...events].sort((a,b) => (historicalSortDate(b) ?? "").localeCompare(historicalSortDate(a) ?? "") || a.id.localeCompare(b.id));
}
export function announcementDateLabel(date: string | null): string {
  return date ? effectiveDateLabel(date) : "Not recorded";
}
export function currentFeeTiming(record: { effective_date: string | null; pricing_details?: unknown }, originalEvent?: { effective_date: string | null; effective_date_precision?: string } | null): string[] {
  if (originalEvent?.effective_date && originalEvent.effective_date_precision === "exact") return [`First effective ${effectiveDateLabel(originalEvent.effective_date)}`, `Current rates effective ${effectiveDateLabel(record.effective_date)}`];
  const parsed = pricingDetailsSchema.safeParse(record.pricing_details);
  if (!record.effective_date && parsed.success && parsed.data.kind === "tiered") {
    const dated = parsed.data.tiers.filter(t => t.effective_date);
    const dates = [...new Set(dated.map(t => t.effective_date))];
    if (dated.length > 0 && dated.length < parsed.data.tiers.length && dates.length === 1 && dates[0]) return [`Partial: ${dated.length} aged subtiers effective ${effectiveDateLabel(dates[0])}`];
  }
  return [effectiveDateLabel(record.effective_date)];
}