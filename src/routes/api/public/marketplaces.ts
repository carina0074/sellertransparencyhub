import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/marketplaces")({
  server: {
    handlers: {
      GET: async () => {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase
          .from("fee_records")
          .select("marketplace,category,fee_type,last_verified");
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
        const rows = data ?? [];
        const byMarket = new Map<string, { marketplace: string; record_count: number; categories: Set<string>; fee_types: Set<string>; last_verified: string }>();
        for (const r of rows) {
          const e = byMarket.get(r.marketplace) ?? {
            marketplace: r.marketplace,
            record_count: 0,
            categories: new Set<string>(),
            fee_types: new Set<string>(),
            last_verified: "0000-00-00",
          };
          e.record_count += 1;
          e.categories.add(r.category);
          e.fee_types.add(r.fee_type);
          if (r.last_verified > e.last_verified) e.last_verified = r.last_verified;
          byMarket.set(r.marketplace, e);
        }
        const payload = Array.from(byMarket.values()).map((e) => ({
          marketplace: e.marketplace,
          record_count: e.record_count,
          category_count: e.categories.size,
          fee_type_count: e.fee_types.size,
          categories: Array.from(e.categories).sort(),
          fee_types: Array.from(e.fee_types).sort(),
          last_verified: e.last_verified,
        }));
        return new Response(JSON.stringify({ count: payload.length, data: payload }, null, 2), {
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