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
  "Other",
  "Prefer not to say",
] as const;

export const USE_CASE_OPTIONS = [
  "Understand marketplace fees",
  "Estimate selling costs",
  "Compare marketplace costs",
  "Research a fee or policy change",
  "Decide where or what to sell",
  "General research",
  "Other",
] as const;

export const feedbackSchema = z
  .object({
    resourceType: z.string().trim().min(1).max(50),
    resourcePath: z.string().trim().min(1).max(500),
    usefulness: z.enum(USEFULNESS_OPTIONS),
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
      marketplaces: data.marketplaces,
      use_cases: data.useCases,
      free_text_feedback: data.freeText || null,
      follow_up_opt_in: data.followUpOptIn,
      follow_up_email: data.followUpOptIn ? data.followUpEmail || null : null,
    });
    if (error) throw new Error("Unable to submit feedback. Please try again.");
    return { ok: true as const };
  });
