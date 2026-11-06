import type { FeeChange, PolicyChange } from "./fees.functions";
import { historicalSortDate } from "./historical-fee-formatting";
import { policyEvidenceSchema } from "./policy-evidence";

export type RecentChange =
  | { kind: "fee"; record: FeeChange; href: "/fees" }
  | { kind: "policy"; record: PolicyChange; href: "/policy-changes" };

/** Fee-rule policies participate in fee-related recent lists without becoming numeric fee events. */
export function recentChanges(fees: FeeChange[], policies: PolicyChange[]): RecentChange[] {
  const items: RecentChange[] = [
    ...fees.map(record => ({ kind: "fee" as const, record, href: "/fees" as const })),
    ...policies.filter(record => {
      const evidence = policyEvidenceSchema.safeParse(record.evidence_details);
      return evidence.success && evidence.data.change_type === "fee_rule_change";
    }).map(record => ({ kind: "policy" as const, record, href: "/policy-changes" as const })),
  ];
  return items.filter(item => historicalSortDate(item.record) !== null).sort((a, b) =>
    (historicalSortDate(b.record) ?? "").localeCompare(historicalSortDate(a.record) ?? "") || a.record.id.localeCompare(b.record.id));
}