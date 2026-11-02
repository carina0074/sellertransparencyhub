import { describe, expect, it } from "vitest";
import { followUpAnalyticsOption, markShownThisSession, wasShownThisSession, RESEARCH_SURVEY_URL } from "./quick-feedback";
import { quickFollowUpSchema, quickAnswerSchema, QUICK_TO_USEFULNESS } from "./feedback.functions";

const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };
const id = "6f1c1d1e-1111-4222-8333-444455556666";

describe("quick feedback", () => {
  it("shows at most once per page per session", () => {
    const s = mem();
    expect(wasShownThisSession(s, "/fees")).toBe(false);
    markShownThisSession(s, "/fees");
    expect(wasShownThisSession(s, "/fees")).toBe(true);
    expect(wasShownThisSession(s, "/calculator")).toBe(false);
  });
  it("never sends No free text to analytics", () => {
    expect(followUpAnalyticsOption("no", "my secret text")).toBe("missing_text_provided");
    expect(followUpAnalyticsOption("yes", "Setting prices")).toBe("Setting prices");
  });
  it("limits missing text to 300 characters", () => {
    expect(quickFollowUpSchema.safeParse({ id, answer: "no", followUp: "a".repeat(300) }).success).toBe(true);
    expect(quickFollowUpSchema.safeParse({ id, answer: "no", followUp: "a".repeat(301) }).success).toBe(false);
  });
  it("accepts only the listed use options after Yes", () => {
    expect(quickFollowUpSchema.safeParse({ id, answer: "yes", followUp: "Estimating profit" }).success).toBe(true);
    expect(quickFollowUpSchema.safeParse({ id, answer: "yes", followUp: "Anything" }).success).toBe(false);
  });
  it("needs no email and accepts only yes/no answers", () => {
    expect(quickAnswerSchema.safeParse({ id, resourceType: "calculator", resourcePath: "/calculator", answer: "no" }).success).toBe(true);
    expect(quickAnswerSchema.safeParse({ id, resourceType: "calculator", resourcePath: "/calculator", answer: "maybe" }).success).toBe(false);
    expect(QUICK_TO_USEFULNESS.no).toBe("not_really");
  });
  it("keeps the survey link hidden until a URL is provided", () => {
    expect(RESEARCH_SURVEY_URL).toBe("");
  });
});
