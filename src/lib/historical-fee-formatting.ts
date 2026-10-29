import { z } from "zod";
import { relativeFeeChange } from "./fee-formatting";

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

export function historicalChangeLabel(oldValue: number, newValue: number): string {
  const relative = relativeFeeChange(oldValue, newValue);
  return relative === null ? "New fee" : `${relative >= 0 ? "+" : ""}${(relative * 100).toFixed(1)}%`;
}