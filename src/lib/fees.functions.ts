import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

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
  effective_date: string;
  source_url: string;
  source_title: string;
  last_verified: string;
  notes: string | null;
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

export const getFeeRecords = createServerFn({ method: "GET" }).handler(
  async (): Promise<FeeRecord[]> => {
    const { data, error } = await supabase
      .from("fee_records")
      .select("id,marketplace,fee_name,category,fee_type,value,value_type,effective_date,source_url,source_title,last_verified,notes")
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

export function formatFeeValue(value: number, valueType: string): string {
  switch (valueType) {
    case "percent":
      return `${(value * 100).toFixed(1)}%`;
    case "usd_per_unit":
      return `$${value.toFixed(2)} / unit`;
    case "usd_per_cuft":
      return `$${value.toFixed(2)} / cu.ft`;
    case "usd_per_month":
      return `$${value.toFixed(2)} / mo`;
    default:
      return value.toString();
  }
}