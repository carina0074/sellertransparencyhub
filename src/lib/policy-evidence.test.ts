import { describe, expect, it } from "bun:test";
import { policyDateSchema, policyEvidenceSchema } from "./policy-evidence";

describe("policy historical evidence integrity", () => {
  it("does not permit an invented day for month-level evidence", () => {
    expect(policyDateSchema.safeParse({ effective_date: "2025-04-15", effective_date_precision: "month", effective_period: "2025-04" }).success).toBe(false);
    expect(policyDateSchema.safeParse({ effective_date: null, effective_date_precision: "month", effective_period: "2025-04" }).success).toBe(true);
  });
  it("keeps unknown effective timing independent from evidence review", () => {
    expect(policyDateSchema.safeParse({ effective_date: null, effective_date_precision: "unknown", effective_period: null }).success).toBe(true);
    expect(policyDateSchema.safeParse({ effective_date: "2026-10-29", effective_date_precision: "unknown", effective_period: null }).success).toBe(false);
  });
  it("requires actual reference evidence rather than an official source label", () => {
    expect(policyEvidenceSchema.safeParse({ status: "verified_policy_event", reviewed_on: "2026-10-29", scope: "UK private sellers", conditions: [], impact: "Managed shipping requirement", references: [] }).success).toBe(false);
  });
});
import { policyDateLabel as label } from "./policy-evidence";
describe("policy badge date label", () => {
  const exact = { effective_date: "2025-04-15", effective_date_precision: "exact", effective_period: null };
  it("says Announced start when evidence marks an unconfirmed announced start", () => {
    expect(label(exact, "announced_start")).toBe("Announced start Apr 15, 2025");
  });
  it("says Effective when the basis is confirmed or absent", () => {
    expect(label(exact, "confirmed")).toBe("Effective Apr 15, 2025");
    expect(label(exact)).toBe("Effective Apr 15, 2025");
  });
});
