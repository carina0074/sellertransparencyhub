import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFeedbackSubmissions, type FeedbackSubmission } from "@/lib/admin.functions";
import { USEFULNESS_LABELS, USER_TYPE_LABELS, INFO_ACCESS_LABELS, type Usefulness, type UserType, type InfoAccess } from "@/lib/feedback.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/feedback")({
  ssr: false,
  component: FeedbackAdminPage,
  head: () => ({ meta: [{ title: "Feedback — Admin" }, { name: "robots", content: "noindex" }] }),
});

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function toCsv(rows: FeedbackSubmission[]): string {
  const header = [
    "submitted_at", "resource_type", "resource_path", "usefulness", "user_type", "info_access",
    "marketplaces", "use_cases", "feedback_text", "follow_up_opt_in", "follow_up_email",
  ];
  const lines = rows.map((r) =>
    [
      r.created_at, r.resource_type, r.resource_path, r.usefulness_response,
      r.user_type ?? "", r.information_access_response ?? "",
      r.marketplaces.join("; "), r.use_cases.join("; "), r.free_text_feedback ?? "",
      r.follow_up_opt_in ? "yes" : "no", r.follow_up_email ?? "",
    ].map(csvEscape).join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

function FeedbackAdminPage() {
  const navigate = useNavigate();
  const fetchFeedback = useServerFn(getFeedbackSubmissions);

  const { data, isLoading, error } = useQuery({
    queryKey: ["feedback_submissions"],
    queryFn: () => fetchFeedback(),
  });

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  function downloadCsv() {
    if (!data) return;
    const blob = new Blob([toCsv(data)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Research Feedback</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data ? `${data.length} submission${data.length === 1 ? "" : "s"}` : "Loading…"}
            {" · "}
            <Link to="/admin/subscribers" className="text-primary hover:underline">Subscribers</Link>
          </p>
        </div>
        <div className="flex items-center gap-4">
          {data && data.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={downloadCsv}>
              Export CSV
            </Button>
          )}
          <button onClick={handleSignOut} className="text-sm text-muted-foreground hover:underline">
            Sign out
          </button>
        </div>
      </div>

      {isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading…</p>}
      {error && (
        <div className="mt-8 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium">Couldn't load feedback.</p>
          <p className="mt-1 text-muted-foreground">
            This page is only available to admin accounts. Please sign out and sign back in if
            access was just granted.
          </p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Resource</th>
                <th className="px-4 py-3">Useful?</th>
                <th className="px-4 py-3">User type</th>
                <th className="px-4 py-3">Info access</th>
                <th className="px-4 py-3">Marketplaces</th>
                <th className="px-4 py-3">Use cases</th>
                <th className="px-4 py-3">Feedback</th>
                <th className="px-4 py-3">Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.id} className="border-t border-border align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {new Date(s.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium">{s.resource_path}</td>
                  <td className="px-4 py-3">
                    {USEFULNESS_LABELS[s.usefulness_response as Usefulness] ?? s.usefulness_response}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.user_type ? USER_TYPE_LABELS[s.user_type as UserType] ?? s.user_type : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.information_access_response ? INFO_ACCESS_LABELS[s.information_access_response as InfoAccess] ?? s.information_access_response : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.marketplaces.join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.use_cases.join(", ") || "—"}</td>
                  <td className="max-w-72 px-4 py-3 text-muted-foreground">{s.free_text_feedback || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.follow_up_opt_in ? s.follow_up_email || "yes (no email)" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">No feedback submissions yet.</p>
      )}
    </div>
  );
}
