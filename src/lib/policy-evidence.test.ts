import { describe, expect, it } from "vitest";
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