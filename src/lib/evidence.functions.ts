import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error("Unable to verify admin access.");
  if (!data) throw new Error("Admin access required.");
}

export const getEvidenceDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const db = context.supabase;
    const [sources, alerts, reviews, captures] = await Promise.all([
      db.from("monitored_sources").select("id,url,marketplace,label,source_type,frequency,active,last_checked_at,last_manual_check,consecutive_failures,archive_url,manual_reason").order("marketplace").order("label"),
      db.from("source_alerts").select("id,source_id,kind,diff,status,email_status,created_at").order("created_at", { ascending: false }).limit(200),
      db.from("source_alert_reviews").select("id,alert_id,reviewer_email,outcome,record_type,record_id,reviewed_at").order("reviewed_at", { ascending: false }).limit(200),
      db.from("evidence_captures").select("id,record_type,record_id,url,status,wayback_url,snapshot_ok,wayback_ok,error,requested_at,processed_at").order("requested_at", { ascending: false }).limit(100),
    ]);
    for (const r of [sources, alerts, reviews, captures]) if (r.error) throw new Error("Unable to load evidence data.");
    return { sources: sources.data ?? [], alerts: alerts.data ?? [], reviews: reviews.data ?? [], captures: captures.data ?? [] };
  });

export const reviewAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { alertId: string; outcome: "reviewed_no_change" | "reviewed_updated"; recordType?: string; recordId?: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(d.alertId)) throw new Error("Invalid alert");
    if (d.outcome !== "reviewed_no_change" && d.outcome !== "reviewed_updated") throw new Error("Invalid outcome");
    if (d.outcome === "reviewed_updated") {
      if (!["fee_record", "fee_change", "policy_event"].includes(d.recordType ?? "")) throw new Error("Choose the record type");
      if (!/^[0-9a-f-]{36}$/i.test(d.recordId ?? "")) throw new Error("Enter the updated record's ID");
    }
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const table = { fee_record: "fee_records", fee_change: "fee_changes", policy_event: "policy_changes" }[data.recordType ?? ""] as string | undefined;
    if (data.outcome === "reviewed_updated" && table) {
      const { data: rec } = await supabaseAdmin.from(table as any).select("id").eq("id", data.recordId!).maybeSingle();
      if (!rec) throw new Error("No record with that ID");
    }
    const { error: e1 } = await supabaseAdmin.from("source_alert_reviews").insert({
      alert_id: data.alertId, reviewer_id: context.userId, reviewer_email: (context.claims as any)?.email ?? null,
      outcome: data.outcome, record_type: data.outcome === "reviewed_updated" ? data.recordType : null,
      record_id: data.outcome === "reviewed_updated" ? data.recordId : null,
    });
    if (e1) throw new Error("Unable to save review.");
    const { error: e2 } = await supabaseAdmin.from("source_alerts").update({ status: data.outcome }).eq("id", data.alertId);
    if (e2) throw new Error("Unable to update alert.");
    return { ok: true };
  });

export const setManualCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { sourceId: string; date: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(d.sourceId)) throw new Error("Invalid source");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) throw new Error("Invalid date");
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("monitored_sources").update({ last_manual_check: data.date })
      .eq("id", data.sourceId).eq("source_type", "manual");
    if (error) throw new Error("Unable to save date.");
    return { ok: true };
  });
