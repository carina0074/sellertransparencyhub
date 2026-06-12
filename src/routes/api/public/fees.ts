import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/fees")({
  server: {
    handlers: {
      GET: async () => {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase
          .from("fee_records")
          .select("id,marketplace,fee_name,category,fee_type,value,value_type,effective_date,source_url,source_title,last_verified,notes")
          .order("marketplace")
          .order("fee_type");
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