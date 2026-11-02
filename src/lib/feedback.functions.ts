import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const USEFULNESS_OPTIONS = ["yes", "somewhat", "not_really"] as const;
export type Usefulness = (typeof USEFULNESS_OPTIONS)[number];

export const USEFULNESS_LABELS: Record<Usefulness, string> = {
  yes: "Yes",
  somewhat: "Somewhat",
  not_really: "Not really",
};

export const MARKETPLACE_OPTIONS = [
  "Amazon",
  "eBay",
  "Walmart",
  "Etsy",
  "Shopify",
  "Multiple marketplaces",
  "Other",
] as const;

export const USER_TYPE_OPTIONS = ["marketplace_seller", "service_provider", "researcher", "other"] as const;
export type UserType = (typeof USER_TYPE_OPTIONS)[number];
export const USER_TYPE_LABELS: Record<UserType, string> = {
  marketplace_seller: "Marketplace seller",
  service_provider: "Seller service provider",
  researcher: "Researcher",
  other: "Other",
};

export const INFO_ACCESS_OPTIONS = ["yes", "somewhat", "no"] as const;
export type InfoAccess = (typeof INFO_ACCESS_OPTIONS)[number];
export const INFO_ACCESS_LABELS: Record<InfoAccess, string> = {
  yes: "Yes",
  somewhat: "Somewhat",
  no: "No",
};

export const USE_CASE_OPTIONS = [
  "Understand marketplace fees",
  "Compare marketplaces",
  "Estimate selling costs",
  "Verify a marketplace fee",
  "Research a fee or policy change",
  "General research",
  "Other",
] as const;

export const feedbackSchema = z
  .object({
    resourceType: z.string().trim().min(1).max(50),
    resourcePath: z.string().trim().min(1).max(500),
    usefulness: z.enum(USEFULNESS_OPTIONS),
    userType: z.enum(USER_TYPE_OPTIONS).optional(),
    informationAccess: z.enum(INFO_ACCESS_OPTIONS).optional(),
    marketplaces: z.array(z.enum(MARKETPLACE_OPTIONS)).max(MARKETPLACE_OPTIONS.length).default([]),
    useCases: z.array(z.enum(USE_CASE_OPTIONS)).max(USE_CASE_OPTIONS.length).default([]),
    freeText: z.string().trim().max(2000).optional(),
    followUpOptIn: z.boolean().default(false),
    followUpEmail: z.string().trim().email().max(254).optional(),
  })
  .refine((d) => !d.followUpEmail || d.followUpOptIn, {
    message: "A follow-up email requires the follow-up opt-in",
    path: ["followUpEmail"],
  });

export type FeedbackInput = z.infer<typeof feedbackSchema>;

/**
 * Public feedback submission. Inserts via the publishable client — the
 * anon INSERT policy on feedback_submissions enforces the same limits.
 * Never touches newsletter subscriptions.
 */
export const submitFeedback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => feedbackSchema.parse(input))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) throw new Error("Feedback submission is unavailable");
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: Object.assign((input: RequestInfo | URL, init?: RequestInit) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`)
            headers.delete("Authorization");
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        }, fetch),
      },
    });
    const { error } = await client.from("feedback_submissions").insert({
      resource_type: data.resourceType,
      resource_path: data.resourcePath,
      usefulness_response: data.usefulness,
      user_type: data.userType ?? null,
      information_access_response: data.informationAccess ?? null,
      marketplaces: data.marketplaces,
      use_cases: data.useCases,
      free_text_feedback: data.freeText || null,
      follow_up_opt_in: data.followUpOptIn,
      follow_up_email: data.followUpOptIn ? data.followUpEmail || null : null,
    });
    if (error) throw new Error("Unable to submit feedback. Please try again.");
    return { ok: true as const };
  });

// ---------------------------------------------------------------------------
// One-tap "Did this answer your question?" prompt
// ---------------------------------------------------------------------------

export const QUICK_RESOURCE_TYPES = [
  "calculator",
  "fee_database",
  "fee_change_feed",
  "policy_archive",
  "transparency_report",
] as const;
export type QuickResourceType = (typeof QUICK_RESOURCE_TYPES)[number];

export const QUICK_ANSWERS = ["yes", "no"] as const;
export type QuickAnswer = (typeof QUICK_ANSWERS)[number];

export const QUICK_USE_OPTIONS = [
  "Setting prices",
  "Choosing a marketplace",
  "Estimating profit",
  "Comparing fulfillment options",
  "Research or reporting",
  "Other",
] as const;

export const QUICK_MISSING_MAX = 300;

/** Legacy usefulness column is required; quick answers map onto it. */
export const QUICK_TO_USEFULNESS: Record<QuickAnswer, Usefulness> = { yes: "yes", no: "not_really" };

function publicClient() {
  return import("@supabase/supabase-js").then(({ createClient }) => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) throw new Error("Feedback submission is unavailable");
    return createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: Object.assign((input: RequestInfo | URL, init?: RequestInit) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`)
            headers.delete("Authorization");
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        }, fetch),
      },
    });
  });
}

export const quickAnswerSchema = z.object({
  id: z.string().uuid(),
  resourceType: z.enum(QUICK_RESOURCE_TYPES),
  resourcePath: z.string().trim().min(1).max(500),
  recordId: z.string().trim().min(1).max(200).optional(),
  recordType: z.enum(["fee_record", "fee_change", "policy_change"]).optional(),
  answer: z.enum(QUICK_ANSWERS),
});

export const submitQuickAnswer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => quickAnswerSchema.parse(input))
  .handler(async ({ data }) => {
    const client = await publicClient();
    const { error } = await client.from("feedback_submissions").insert({
      id: data.id,
      resource_type: data.resourceType,
      resource_path: data.resourcePath,
      record_id: data.recordId ?? null,
      record_type: data.recordId ? data.recordType ?? null : null,
      answer: data.answer,
      usefulness_response: QUICK_TO_USEFULNESS[data.answer],
    });
    if (error) throw new Error("Unable to save your answer.");
    return { ok: true as const };
  });

export const quickFollowUpSchema = z.discriminatedUnion("answer", [
  z.object({ id: z.string().uuid(), answer: z.literal("yes"), followUp: z.enum(QUICK_USE_OPTIONS) }),
  z.object({ id: z.string().uuid(), answer: z.literal("no"), followUp: z.string().trim().min(1).max(QUICK_MISSING_MAX) }),
]);

export const submitQuickFollowUp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => quickFollowUpSchema.parse(input))
  .handler(async ({ data }) => {
    const client = await publicClient();
    const { error } = await client.rpc("add_feedback_follow_up", { _id: data.id, _follow_up: data.followUp });
    if (error) throw new Error("Unable to save your answer.");
    return { ok: true as const };
  });
