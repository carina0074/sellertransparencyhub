import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { readCoverageStatistics, type DatabaseStats } from "./coverage-statistics";
export type { DatabaseStats } from "./coverage-statistics";
export { formatFeeValue } from "./fee-formatting";

/**
 * Public, read-only marketplace fee data. No auth required — RLS allows
 * public SELECT on these tables.
 */

export type FeeRecord = {
  id: string;
  marketplace: string;
  fee_name: string;
  category: string;
  fee_type: string;
  value: number;
  value_type: string;
  effective_date: string | null;
  source_url: string;
  source_title: string;
  last_verified: string;
  notes: string | null;
  pricing_details: Json | null;
  verification_status: "verified_current_value" | "partially_verified" | "verification_pending";
};

export type FeeChange = {
  id: string;
  marketplace: string;
  fee_type: string;
  category: string;
  title: string;
  old_value: number;
  new_value: number;
  value_type: string;
  change_amount: number;
  effective_date: string;
  announcement_date: string | null;
  impact_level: "low" | "medium" | "high";
  source_url: string;
  source_title: string;
  summary: string | null;
};

export type ImpactReport = {
  id: string;
  slug: string;
  marketplace: string;
  title: string;
  publish_date: string;
  affected_categories: string[];
  estimated_seller_impact: string;
  methodology: string;
  sample_size: number | null;
  summary: string;
  body_markdown: string;
};

export type PolicyChange = {
  id: string;
  marketplace: string;
  policy_area: string;
  title: string;
  summary: string;
  body_markdown: string | null;
  effective_date: string;
  announcement_date: string | null;
  impact_level: "low" | "medium" | "high";
  affected_sellers: string | null;
  source_url: string;
  source_title: string;
  last_verified: string;
};

export const getPolicyChanges = createServerFn({ method: "GET" }).handler(
  async (): Promise<PolicyChange[]> => {
    const { data, error } = await supabase
      .from("policy_changes")
      .select("id,marketplace,policy_area,title,summary,body_markdown,effective_date,announcement_date,impact_level,affected_sellers,source_url,source_title,last_verified")
      .order("effective_date", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      ...r,
      impact_level: r.impact_level as "low" | "medium" | "high",
    })) as PolicyChange[];
  },
);

export const getFeeRecords = createServerFn({ method: "GET" }).handler(
  async (): Promise<FeeRecord[]> => {
    const { data, error } = await supabase
      .from("fee_records")
      .select("id,marketplace,fee_name,category,fee_type,value,value_type,effective_date,source_url,source_title,last_verified,notes,pricing_details,verification_status")
      .order("marketplace", { ascending: true })
      .order("fee_type", { ascending: true })
      .order("category", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      ...r,
      value: Number(r.value),
      value_type: r.value_type,
    })) as FeeRecord[];
  },
);

export const getFeeChanges = createServerFn({ method: "GET" }).handler(
  async (): Promise<FeeChange[]> => {
    const { data, error } = await supabase
      .from("fee_changes")
      .select("id,marketplace,fee_type,category,title,old_value,new_value,value_type,change_amount,effective_date,announcement_date,impact_level,source_url,source_title,summary")
      .order("effective_date", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      ...r,
      old_value: Number(r.old_value),
      new_value: Number(r.new_value),
      change_amount: Number(r.change_amount),
      impact_level: r.impact_level as "low" | "medium" | "high",
    })) as FeeChange[];
  },
);

export const getImpactReports = createServerFn({ method: "GET" }).handler(
  async (): Promise<ImpactReport[]> => {
    const { data, error } = await supabase
      .from("impact_reports")
      .select("id,slug,marketplace,title,publish_date,affected_categories,estimated_seller_impact,methodology,sample_size,summary,body_markdown")
      .order("publish_date", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as ImpactReport[];
  },
);

export const getDatabaseStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<DatabaseStats> => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    if (!url || !key) throw new Error("Public coverage data is unavailable");
    const publicClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: Object.assign((input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      }, fetch) },
    });
    const exactCount = async (table: "fee_records" | "fee_changes") => {
      const { count, error } = await publicClient.from(table).select("id", { count: "exact", head: true });
      if (error) throw new Error(error.message);
      if (count === null) throw new Error("Coverage count is unavailable");
      return count;
    };
    return readCoverageStatistics({
      countRecords: () => exactCount("fee_records"),
      countChanges: () => exactCount("fee_changes"),
      fetchRecords: async (offset, limit) => {
        const { data, error } = await publicClient.from("fee_records")
          .select("marketplace,category,last_verified").order("id", { ascending: true })
          .range(offset, offset + limit - 1);
        if (error) throw new Error(error.message);
        return data ?? [];
      },
    });
  },
);
