import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getEvidenceDashboard, reviewAlert, setManualCheck } from "@/lib/evidence.functions";
import { isDueForManualCheck } from "@/lib/source-monitor";

export const Route = createFileRoute("/_authenticated/admin/evidence")({
  ssr: false,
  component: EvidencePage,
  head: () => ({ meta: [{ title: "Evidence & alerts — Admin" }, { name: "robots", content: "noindex" }] }),
});

const TYPE_LABEL: Record<string, string> = { monitor_weekly: "Monitor weekly", archive_once: "Archive once", manual: "Manual" };
const fmt = (d: string | null) => (d ? new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "—");

function EvidencePage() {
  const qc = useQueryClient();
  const fetchDash = useServerFn(getEvidenceDashboard);
  const { data, isLoading, error } = useQuery({ queryKey: ["evidence-dashboard"], queryFn: () => fetchDash() });
  const refresh = () => qc.invalidateQueries({ queryKey: ["evidence-dashboard"] });

  if (isLoading) return <Shell><p className="text-sm text-muted-foreground">Loading…</p></Shell>;
  if (error || !data) return <Shell><p className="text-sm text-destructive">This page is only available to admin accounts.</p></Shell>;

  const sourceById = new Map(data.sources.map((s: any) => [s.id, s]));
  const open = data.alerts.filter((a: any) => a.status === "open");
  const today = new Date();
  const manual = data.sources.filter((s: any) => s.source_type === "manual");
  const due = manual.filter((s: any) => isDueForManualCheck(s.last_manual_check, today));

  return (
    <Shell>
      <Section title={`Open alerts (${open.length})`}>
        {open.length === 0 && <p className="text-sm text-muted-foreground">No open alerts.</p>}
        {open.map((a: any) => <AlertCard key={a.id} alert={a} source={sourceById.get(a.source_id)} onDone={refresh} />)}
      </Section>

      <Section title={`Due for manual check (${due.length})`}>
        {due.length === 0 && <p className="text-sm text-muted-foreground">All manual sources were checked within 30 days.</p>}
        <SourceTable sources={due} manual onDone={refresh} />
      </Section>

      <Section title={`All monitored sources (${data.sources.length})`}>
        <SourceTable sources={data.sources} manual={false} onDone={refresh} />
      </Section>

      <Section title="Evidence captures on record saves">
        {data.captures.length === 0 ? <p className="text-sm text-muted-foreground">None yet.</p> : (
          <Table head={["Requested", "Record", "Source", "Status", "Archive", "Issue"]}>
            {data.captures.map((c: any) => (
              <tr key={c.id} className="border-t border-border align-top">
                <td className="px-3 py-2 whitespace-nowrap">{fmt(c.requested_at)}</td>
                <td className="px-3 py-2 text-xs">{c.record_type}<br /><span className="text-muted-foreground">{c.record_id}</span></td>
                <td className="px-3 py-2 break-all text-xs"><a className="text-primary hover:underline" href={c.url} target="_blank" rel="noreferrer">{c.url}</a></td>
                <td className="px-3 py-2">{c.status === "flagged" ? <span className="font-medium text-destructive">Flagged</span> : c.status}</td>
                <td className="px-3 py-2 text-xs">{c.wayback_url ? <a className="text-primary hover:underline" href={c.wayback_url} target="_blank" rel="noreferrer">Wayback</a> : "—"}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{c.error ?? ""}</td>
              </tr>
            ))}
          </Table>
        )}
      </Section>

      <Section title="Review log">
        {data.reviews.length === 0 ? <p className="text-sm text-muted-foreground">No reviews yet.</p> : (
          <Table head={["When", "Who", "Outcome", "Source", "Record"]}>
            {data.reviews.map((r: any) => {
              const a = data.alerts.find((x: any) => x.id === r.alert_id);
              return (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-3 py-2 whitespace-nowrap">{fmt(r.reviewed_at)}</td>
                  <td className="px-3 py-2">{r.reviewer_email ?? "—"}</td>
                  <td className="px-3 py-2">{r.outcome === "reviewed_updated" ? "Record updated" : "No record change"}</td>
                  <td className="px-3 py-2">{a ? (sourceById.get(a.source_id) as any)?.label : "—"}</td>
                  <td className="px-3 py-2 text-xs">{r.record_id ? `${r.record_type} · ${r.record_id}` : "—"}</td>
                </tr>
              );
            })}
          </Table>
        )}
      </Section>
    </Shell>
  );
}

function AlertCard({ alert, source, onDone }: { alert: any; source: any; onDone: () => void }) {
  const review = useServerFn(reviewAlert);
  const [recordType, setRecordType] = useState("fee_record");
  const [recordId, setRecordId] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(outcome: "reviewed_no_change" | "reviewed_updated") {
    setBusy(true); setErr(null);
    try { await review({ data: { alertId: alert.id, outcome, recordType, recordId: recordId.trim() } }); onDone(); }
    catch (e) { setErr(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  }
  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium">{alert.kind === "change" ? "Page changed" : "Fetch failed twice in a row"} · {source?.label}</p>
        <p className="text-xs text-muted-foreground">{fmt(alert.created_at)} · email: {alert.email_status === "pending_email_domain" ? "waiting for email domain" : alert.email_status}</p>
      </div>
      {source && <a href={source.url} target="_blank" rel="noreferrer" className="break-all text-xs text-primary hover:underline">{source.url}</a>}
      <pre className="mt-3 max-h-80 overflow-auto rounded bg-muted p-3 text-xs leading-relaxed">
        {(alert.diff ?? "").split("\n").map((l: string, i: number) => (
          <span key={i} className={l.startsWith("+ ") ? "text-primary" : l.startsWith("- ") ? "text-destructive" : ""}>{l}{"\n"}</span>
        ))}
      </pre>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <button disabled={busy} onClick={() => submit("reviewed_no_change")} className="rounded-md border border-border px-3 py-1.5 hover:bg-muted">Reviewed — no record change</button>
        <select value={recordType} onChange={(e) => setRecordType(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1.5">
          <option value="fee_record">Fee record</option>
          <option value="fee_change">Fee change</option>
          <option value="policy_event">Policy event</option>
        </select>
        <input value={recordId} onChange={(e) => setRecordId(e.target.value)} placeholder="Updated record ID" className="w-72 rounded-md border border-border bg-background px-2 py-1.5" />
        <button disabled={busy} onClick={() => submit("reviewed_updated")} className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground">Reviewed — record updated</button>
      </div>
      {err && <p className="mt-2 text-sm text-destructive">{err}</p>}
    </div>
  );
}

function SourceTable({ sources, manual, onDone }: { sources: any[]; manual: boolean; onDone: () => void }) {
  if (sources.length === 0) return null;
  return (
    <Table head={["Marketplace", "Source", "Type", "Last checked", manual ? "Set last manual check" : "Status"]}>
      {sources.map((s) => <SourceRow key={s.id} s={s} manual={manual} onDone={onDone} />)}
    </Table>
  );
}

function SourceRow({ s, manual, onDone }: { s: any; manual: boolean; onDone: () => void }) {
  const save = useServerFn(setManualCheck);
  const [date, setDate] = useState(s.last_manual_check ?? "");
  const isManual = s.source_type === "manual";
  const due = isManual && isDueForManualCheck(s.last_manual_check, new Date());
  return (
    <tr className="border-t border-border align-top">
      <td className="px-3 py-2">{s.marketplace}</td>
      <td className="px-3 py-2"><a href={s.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{s.label}</a>
        {s.manual_reason && <p className="text-xs text-muted-foreground">{s.manual_reason}</p>}</td>
      <td className="px-3 py-2 whitespace-nowrap">{TYPE_LABEL[s.source_type]}{!s.active && " (inactive)"}</td>
      <td className="px-3 py-2 whitespace-nowrap text-xs">{isManual ? (s.last_manual_check ?? "Never") : fmt(s.last_checked_at)}</td>
      <td className="px-3 py-2 text-xs">
        {manual ? (
          <span className="flex gap-2">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded border border-border bg-background px-1 py-0.5" />
            <button onClick={async () => { if (date) { await save({ data: { sourceId: s.id, date } }); onDone(); } }} className="rounded border border-border px-2 hover:bg-muted">Save</button>
          </span>
        ) : due ? <span className="font-medium text-destructive">Due for manual check</span>
          : s.source_type === "archive_once" ? (s.archive_url ? <a href={s.archive_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">Wayback copy</a> : s.last_checked_at ? "Archive capture failed" : "Not yet archived")
          : s.consecutive_failures > 0 ? `${s.consecutive_failures} failed check(s)` : isManual ? "Checked" : "OK"}
      </td>
    </tr>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Evidence &amp; alerts</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Private. Nothing here changes public records. ·{" "}
        <Link to="/admin/feedback" className="text-primary hover:underline">Feedback</Link> ·{" "}
        <Link to="/admin/subscribers" className="text-primary hover:underline">Subscribers</Link>
      </p>
      <div className="mt-8 space-y-10">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-3"><h2 className="text-lg font-semibold">{title}</h2>{children}</section>;
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
          <tr>{head.map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
