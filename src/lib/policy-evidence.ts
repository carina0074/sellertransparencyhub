import { z } from "zod";
import { historicalDateSchema, historicalEffectiveDate } from "./historical-fee-formatting";

export const policyDateSchema = historicalDateSchema;
export const policyEffectiveDate = historicalEffectiveDate;

export const policyEvidenceSchema = z.object({
  status: z.enum(["verified_policy_event", "effective_date_not_proven"]),
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