import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/subscribers")({
  ssr: false,
  component: SubscribersPage,
  head: () => ({ meta: [{ title: "Subscribers — Admin" }, { name: "robots", content: "noindex" }] }),
});

function SubscribersPage() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["email_subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_subscribers")
        .select("id, email, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Email Subscribers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data ? `${data.length} subscriber${data.length === 1 ? "" : "s"}` : "Loading…"}
          </p>
        </div>
        <button onClick={handleSignOut} className="text-sm text-muted-foreground hover:underline">
          Sign out
        </button>
      </div>

      {isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading…</p>}
      {error && (
        <div className="mt-8 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium">Couldn't load subscribers.</p>
          <p className="mt-1 text-muted-foreground">
            You may not have admin access yet. Ask the project owner to grant your account the
            <code className="mx-1 rounded bg-muted px-1">admin</code> role.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Error: {(error as Error).message}</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(s.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">No subscribers yet.</p>
      )}
    </div>
  );
}