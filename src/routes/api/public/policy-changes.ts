import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/policy-changes")({
  server: {
    handlers: {
      GET: async () => {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase
          .from("policy_changes")
          .select("id,marketplace,policy_area,title,summary,effective_date,announcement_date,impact_level,affected_sellers,source_url,source_title,last_verified")
          .order("effective_date", { ascending: false });
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
        return new Response(
          JSON.stringify({ count: data?.length ?? 0, data: data ?? [] }, null, 2),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
              "cache-control": "public, max-age=300",
              "access-control-allow-origin": "*",
            },
          },
        );
      },
    },
  },
});