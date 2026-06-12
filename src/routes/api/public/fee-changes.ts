import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/fee-changes")({
  server: {
    handlers: {
      GET: async () => {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase
          .from("fee_changes")
          .select("id,marketplace,fee_type,category,title,old_value,new_value,value_type,change_amount,effective_date,announcement_date,impact_level,source_url,source_title,summary")
          .order("effective_date", { ascending: false });
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ count: data?.length ?? 0, data: data ?? [] }, null, 2), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "cache-control": "public, max-age=300",
            "access-control-allow-origin": "*",
          },
        });
      },
    },
  },
});