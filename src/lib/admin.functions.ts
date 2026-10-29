import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type EmailSubscriber = {
  id: string;
  email: string;
  created_at: string;
  source: string;
};

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) throw new Error("Unable to verify admin access.");
  if (!data) throw new Error("Admin access required.");
}

export const getEmailSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EmailSubscriber[]> => {
    await assertAdmin(context);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("newsletter_subscriptions")
      .select("id, email, created_at, source")
      .order("created_at", { ascending: false });

    if (error) throw new Error("Unable to load subscribers.");
    return data ?? [];
  });

export type FeedbackSubmission = {
  id: string;
  created_at: string;
  resource_type: string;
  resource_path: string;
  usefulness_response: string;
  marketplaces: string[];
  use_cases: string[];
  free_text_feedback: string | null;
  follow_up_opt_in: boolean;
  follow_up_email: string | null;
};

export const getFeedbackSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FeedbackSubmission[]> => {
    await assertAdmin(context);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("feedback_submissions")
      .select("id, created_at, resource_type, resource_path, usefulness_response, marketplaces, use_cases, free_text_feedback, follow_up_opt_in, follow_up_email")
      .order("created_at", { ascending: false });

    if (error) throw new Error("Unable to load feedback submissions.");
    return (data ?? []) as FeedbackSubmission[];
  });