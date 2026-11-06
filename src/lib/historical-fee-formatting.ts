import { z } from "zod";
import { relativeFeeChange, formatFeeValue } from "./fee-formatting";

export const historicalChangeDetailsSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("tiered_rate_change"), tiers: z.array(z.object({ label: z.string(), old_rate: z.number().min(0).max(1), new_rate: z.number().min(0).max(1) })).min(1) }),
  z.object({ kind: z.literal("new_fee"), amounts: z.array(z.object({ label: z.string(), amount_minor: z.number().int().nonnegative(), currency: z.literal("USD"), basis: z.literal("announced_average") })).optional() }),
  z.object({ kind: z.literal("announced_average_change"), direction: z.enum(["increase", "decrease"]), amount_minor: z.number().int().positive(), currency: z.literal("USD"), basis: z.literal("announced_average") }),
]);

export function historicalPresentation(change: { old_value: number | null; new_value: number | null; value_type: string; change_details?: unknown }) {
  const parsed = historicalChangeDetailsSchema.safeParse(change.change_details);
  if (parsed.success && parsed.data.kind === "announced_average_change") return { label: "Announced average " + parsed.data.direction, lines: [`${parsed.data.direction === "increase" ? "+" : "−"}$${(parsed.data.amount_minor / 100).toFixed(2)} / unit (announced average, not a rate)`] };
  if (parsed.success && parsed.data.kind === "tiered_rate_change") return { label: "Tiered rate reduction", lines: parsed.data.tiers.map(t => `${t.label}: ${formatFeeValue(t.old_rate, "percent")} → ${formatFeeValue(t.new_rate, "percent")}`) };
  if (parsed.success && parsed.data.kind === "new_fee") return { label: "New fee", lines: parsed.data.amounts?.map(a => `${a.label}: about $${(a.amount_minor / 100).toFixed(2)} / unit (announced average, not a rate)`) ?? ["New fee — amount not stated in this announcement"] };
  return { label: historicalChangeLabel(change.old_value, change.new_value), lines: [`${change.old_value == null || change.old_value === 0 ? "—" : formatFeeValue(change.old_value, change.value_type)} → ${change.new_value == null ? "Amount not established" : formatFeeValue(change.new_value, change.value_type)}`] };
}

export const historicalDateSchema = z.object({
  effective_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  effective_date_precision: z.enum(["exact", "month", "year", "unknown"]),
  effective_period: z.string().nullable(),
}).superRefine((value, ctx) => {
  if (value.effective_date_precision === "exact") {
    if (!value.effective_date || value.effective_period !== null) ctx.addIssue({ code: "custom", message: "Exact precision requires an exact day only" });
  } else {
    if (value.effective_date !== null) ctx.addIssue({ code: "custom", message: "Coarse precision must not invent an exact day" });
    const valid = value.effective_date_precision === "month" ? /^\d{4}-(0[1-9]|1[0-2])$/.test(value.effective_period ?? "")
      : value.effective_date_precision === "year" ? /^\d{4}$/.test(value.effective_period ?? "")
        : value.effective_period === null;
    if (!valid) ctx.addIssue({ code: "custom", message: "Period must match date precision" });
  }
});

export const historicalEvidenceSchema = z.object({
  status: z.enum(["verified_historical_event", "effective_date_not_proven"]),
  reviewed_on: z.string(),
  reviewer: z.string().optional(),
  scope: z.string(),
  conditions: z.array(z.string()),
  linkage_reason: z.string(),
  references: z.array(z.object({ title: z.string(), url: z.string().url().startsWith("https://"), quote: z.string(), evidence_type: z.string() })).min(1),
});

export function historicalEffectiveDate(value: { effective_date: string | null; effective_date_precision?: string; effective_period?: string | null }): string {
  if (value.effective_date_precision === "unknown") return "Effective date not established";
  if (value.effective_date_precision === "year" && value.effective_period) return `${value.effective_period} (year-level evidence)`;
  if (value.effective_date_precision === "month" && value.effective_period) {
    const [year, month] = value.effective_period.split("-").map(Number);
    if (!year || !month || month > 12) return "Effective date not established";
    return `${new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)))} (month-level evidence)`;
  }
  if (!value.effective_date) return "Effective date not established";
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value.effective_date}T00:00:00Z`));
}

export function historicalChangeLabel(oldValue: number | null, newValue: number | null): string {
  if (oldValue === null) return "New fee";
  if (newValue === null) return "Change not quantified";
  const relative = relativeFeeChange(oldValue, newValue);
  return relative === null ? "New fee" : `${relative >= 0 ? "+" : ""}${(relative * 100).toFixed(1)}%`;
}
/** Earliest possible date implied by a historical change's evidence; null when the date is not established. */
export function historicalSortDate(value: { effective_date: string | null; effective_date_precision?: string; effective_period?: string | null }): string | null {
  if (value.effective_date_precision === "unknown") return null;
  if (value.effective_date_precision === "year" && value.effective_period) return `${value.effective_period}-01-01`;
  if (value.effective_date_precision === "month" && value.effective_period) return `${value.effective_period}-01`;
  return value.effective_date ?? null;
}

/** Most recent documented change by effective timing; changes without an established date are skipped. */
export function latestDocumentedChange<T extends { effective_date: string | null; effective_date_precision?: string; effective_period?: string | null }>(changes: T[]): T | null {
  let best: T | null = null;
  let bestKey = "";
  for (const c of changes) {
    const key = historicalSortDate(c);
    if (key && key > bestKey) { best = c; bestKey = key; }
  }
  return best;
}
