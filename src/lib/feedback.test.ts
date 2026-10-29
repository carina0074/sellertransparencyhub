import { describe, expect, test } from "bun:test";
import { feedbackSchema } from "./feedback.functions";

const valid = {
  resourceType: "fee_database",
  resourcePath: "/rate-card",
  usefulness: "yes" as const,
  marketplaces: ["Amazon" as const, "Etsy" as const],
  useCases: ["Understand marketplace fees" as const],
  followUpOptIn: false,
};

describe("feedbackSchema", () => {
  test("accepts a minimal valid submission", () => {
    const r = feedbackSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  test("accepts negative and critical feedback equally", () => {
    for (const usefulness of ["yes", "somewhat", "not_really"] as const) {
      expect(feedbackSchema.safeParse({ ...valid, usefulness }).success).toBe(true);
    }
  });

  test("rejects an unknown usefulness response", () => {
    expect(feedbackSchema.safeParse({ ...valid, usefulness: "amazing" }).success).toBe(false);
  });

  test("rejects a follow-up email without the follow-up opt-in", () => {
    const r = feedbackSchema.safeParse({ ...valid, followUpEmail: "seller@example.com" });
    expect(r.success).toBe(false);
  });

  test("accepts a valid follow-up email only with opt-in", () => {
    const r = feedbackSchema.safeParse({
      ...valid,
      followUpOptIn: true,
      followUpEmail: "seller@example.com",
    });
    expect(r.success).toBe(true);
  });

  test("rejects an invalid email address", () => {
    const r = feedbackSchema.safeParse({
      ...valid,
      followUpOptIn: true,
      followUpEmail: "not-an-email",
    });
    expect(r.success).toBe(false);
  });

  test("rejects free text over 2000 characters", () => {
    const r = feedbackSchema.safeParse({ ...valid, freeText: "x".repeat(2001) });
    expect(r.success).toBe(false);
  });

  test("rejects unknown marketplace or use-case options", () => {
    expect(feedbackSchema.safeParse({ ...valid, marketplaces: ["AliExpress"] }).success).toBe(false);
    expect(feedbackSchema.safeParse({ ...valid, useCases: ["Something else"] }).success).toBe(false);
  });

  test("rejects oversized resource identifiers", () => {
    expect(feedbackSchema.safeParse({ ...valid, resourceType: "x".repeat(51) }).success).toBe(false);
    expect(feedbackSchema.safeParse({ ...valid, resourcePath: "" }).success).toBe(false);
  });
});

describe("feedbackSchema research fields", () => {
  test("new optional fields may be omitted", () => {
    const r = feedbackSchema.safeParse(valid);
    expect(r.success && r.data.userType).toBeUndefined();
  });
  test("accepts the four user types and three info-access answers", () => {
    for (const userType of ["marketplace_seller", "service_provider", "researcher", "other"] as const)
      expect(feedbackSchema.safeParse({ ...valid, userType }).success).toBe(true);
    for (const informationAccess of ["yes", "somewhat", "no"] as const)
      expect(feedbackSchema.safeParse({ ...valid, informationAccess }).success).toBe(true);
  });
  test("rejects unknown user type or info-access answer", () => {
    expect(feedbackSchema.safeParse({ ...valid, userType: "investor" }).success).toBe(false);
    expect(feedbackSchema.safeParse({ ...valid, informationAccess: "not_really" }).success).toBe(false);
  });
});
