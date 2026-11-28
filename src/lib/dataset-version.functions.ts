import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

/** Latest recorded data change across the three public collections (ISO timestamp or null). */
export const getLatestDataChange = createServerFn({ method: "GET" }).handler(async () => {
  const reads = [
    supabase.from("fee_records").select("updated_at").order("updated_at", { ascending: false }).limit(1),
    supabase.from("fee_records").select("created_at").order("created_at", { ascending: false }).limit(1),
    supabase.from("fee_changes").select("created_at").order("created_at", { ascending: false }).limit(1),
    supabase.from("policy_changes").select("updated_at").order("updated_at", { ascending: false }).limit(1),
    supabase.from("policy_changes").select("created_at").order("created_at", { ascending: false }).limit(1),
  ];
  const results = await Promise.all(reads);
  const dates: string[] = [];
  for (const r of results) {
    if (r.error) throw new Error(r.error.message);
    const row = r.data?.[0] as Record<string, string | null> | undefined;
    const v = row ? Object.values(row)[0] : null;
    if (v) dates.push(v);
  }
  return dates.sort().at(-1) ?? null;
});
