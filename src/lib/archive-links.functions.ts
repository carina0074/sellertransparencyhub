import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

/**
 * Public, read-only projection of archived source copies. The underlying
 * monitor tables are admin-only; this returns nothing but the source URL and
 * the URL of its archived copy, so it can be shown next to a record's source
 * link without exposing labels, snapshots, alerts or review notes.
 */
export type ArchiveLinkRow = { url: string; archive_url: string };

// The generated client types are regenerated from the database schema; this
// keeps the call compiling before that regeneration lands.
type RpcClient = {
  rpc: (
    fn: "public_archive_links",
    args?: Record<string, never>,
  ) => Promise<{ data: ArchiveLinkRow[] | null; error: { message: string } | null }>;
};

export const getArchiveLinks = createServerFn({ method: "GET" }).handler(async (): Promise<ArchiveLinkRow[]> => {
  const client = supabase as unknown as RpcClient;
  const { data, error } = await client.rpc("public_archive_links");
  if (error) throw new Error("Unable to load archived copies.");
  return data ?? [];
});
