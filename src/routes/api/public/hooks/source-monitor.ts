import { createFileRoute } from "@tanstack/react-router";

// Called by the daily database schedule and after record saves. Takes no input and is idempotent:
// it only processes queued evidence captures and sources that are due, so a replay does no extra work.
export const Route = createFileRoute("/api/public/hooks/source-monitor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace("Bearer ", "");
        if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
        const { runSourceMonitor } = await import("@/lib/source-monitor.server");
        try {
          const summary = await runSourceMonitor();
          return new Response(JSON.stringify({ ok: true, ...summary }), { headers: { "content-type": "application/json" } });
        } catch (e) {
          console.error("source-monitor failed", e);
          return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { "content-type": "application/json" } });
        }
      },
    },
  },
});
