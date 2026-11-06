import { z } from "zod";
import { historicalDateSchema, historicalEffectiveDate } from "./historical-fee-formatting";

export const policyDateSchema = historicalDateSchema;
export const policyEffectiveDate = historicalEffectiveDate;

export const policyEvidenceSchema = z.object({
  status: z.enum(["verified_policy_event", "effective_date_not_proven"]),
  /** "announced_start" = the date is an announced start the evidence does not confirm as enforced. */
  effective_date_basis: z.enum(["announced_start", "confirmed"]).optional(),
  change_type: z.literal("fee_rule_change").optional(),
  reviewer: z.string().optional(),
  reviewed_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scope: z.string().min(1),
  conditions: z.array(z.string()),
  impact: z.string().min(1),
  references: z.array(z.object({
    title: z.string().min(1),
    url: z.string().url().startsWith("https://"),
    quote: z.string().min(1),
    heading: z.string().min(1),
    evidence_type: z.string().min(1),
    supported_fields: z.array(z.string()).min(1),
  })).min(1),
});
/** Badge label: "Announced start <date>" when evidence marks the date as an unconfirmed announced start. */
export function policyDateLabel(
  value: { effective_date: string | null; effective_date_precision?: string; effective_period?: string | null },
  basis?: "announced_start" | "confirmed",
): string {
  const date = historicalEffectiveDate(value);
  if (value.effective_date_precision === "unknown" || date === "Effective date not established") return date;
  return `${basis === "announced_start" ? "Announced start" : "Effective"} ${date}`;
}
