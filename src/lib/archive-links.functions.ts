import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

/**
 * Public, read-only projection of archived source copies. The underlying
 * monitor tables are admin-only; this returns nothing but the source URL and
 * the URL of its archived copy, so it can be shown next to a record's source
 * link without exposing labels, snapshots, alerts or review notes.
 */
export type ArchiveLinkRow = { url: string; archive_url: string };

export const getArchiveLinks = createServerFn({ method: "GET" }).handler(
  async (): Promise<ArchiveLinkRow[]> => {
    const { data, error } = await supabase.rpc("public_archive_links");
    if (error) throw new Error("Unable to load archived copies.");
    return data ?? [];
  },
);
