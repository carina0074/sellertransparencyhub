import {
  MONITOR_USER_AGENT, extractMainText, isWeeklyCheckDue, lineDiff, robotsAllows,
  sha256Hex, shouldRaiseFailureAlert, stripFragment,
} from "./source-monitor";

type Admin = any;
type FetchResult = { status: number | null; text: string | null; hash: string | null; error: string | null };

const MAX_CAPTURES_PER_RUN = 6;
const robotsCache = new Map<string, string>();

async function timedFetch(url: string, ms: number, init: RequestInit = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, headers: { "User-Agent": MONITOR_USER_AGENT, ...(init.headers ?? {}) } });
  } finally {
    clearTimeout(t);
  }
}

async function allowedByRobots(url: string): Promise<boolean> {
  const origin = new URL(url).origin;
  if (!robotsCache.has(origin)) {
    try {
      const r = await timedFetch(`${origin}/robots.txt`, 15000);
      robotsCache.set(origin, r.ok ? await r.text() : "");
    } catch {
      robotsCache.set(origin, "");
    }
  }
  return robotsAllows(robotsCache.get(origin) ?? "", url);
}

/** One polite request per URL. */
async function fetchPage(url: string): Promise<FetchResult> {
  const target = stripFragment(url);
  if (!(await allowedByRobots(target))) return { status: null, text: null, hash: null, error: "Disallowed by robots.txt" };
  try {
    const r = await timedFetch(target, 30000, { redirect: "follow" });
    const html = await r.text();
    if (!r.ok) return { status: r.status, text: null, hash: null, error: `HTTP ${r.status}` };
    const text = extractMainText(html);
    if (text.length < 200) return { status: r.status, text, hash: null, error: "Page returned too little readable text (possible bot check)" };
    return { status: r.status, text, hash: await sha256Hex(text), error: null };
  } catch (e) {
    return { status: null, text: null, hash: null, error: e instanceof Error ? e.message : "Fetch failed" };
  }
}

async function requestWayback(url: string): Promise<{ url: string | null; error: string | null }> {
  try {
    const r = await timedFetch(`https://web.archive.org/save/${stripFragment(url)}`, 60000, { redirect: "manual" });
    const loc = r.headers.get("location") ?? r.headers.get("content-location");
    if (loc && loc.includes("/web/")) return { url: loc.startsWith("http") ? loc : `https://web.archive.org${loc}`, error: null };
    if (r.ok && r.url.includes("/web/")) return { url: r.url, error: null };
    return { url: null, error: `Save Page Now returned HTTP ${r.status}` };
  } catch (e) {
    return { url: null, error: e instanceof Error ? e.message : "Save Page Now failed" };
  }
}

async function insertSnapshot(admin: Admin, sourceId: string | null, url: string, f: FetchResult, kind: string) {
  const { data, error } = await admin.from("source_snapshots").insert({
    source_id: sourceId, url, http_status: f.status, content_hash: f.hash, content_text: f.text, error: f.error, trigger_kind: kind,
  }).select("id").single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

async function checkWeekly(admin: Admin, s: any, summary: any) {
  const prev = s.last_hash
    ? (await admin.from("source_snapshots").select("id, content_text").eq("source_id", s.id).eq("content_hash", s.last_hash)
        .order("fetched_at", { ascending: false }).limit(1).maybeSingle()).data
    : null;
  const f = await fetchPage(s.url);
  const snapId = await insertSnapshot(admin, s.id, s.url, f, "weekly");
  const now = new Date().toISOString();
  if (f.error || !f.hash) {
    const failures = (s.consecutive_failures ?? 0) + 1;
    await admin.from("monitored_sources").update({ consecutive_failures: failures, last_checked_at: now }).eq("id", s.id);
    if (shouldRaiseFailureAlert(failures)) {
      await admin.from("source_alerts").insert({ source_id: s.id, kind: "fetch_failure", snapshot_id: snapId, diff: f.error, email_status: "pending_email_domain" });
      summary.alerts++;
    }
    summary.failures++;
    return;
  }
  if (s.last_hash && s.last_hash !== f.hash) {
    await admin.from("source_alerts").insert({
      source_id: s.id, kind: "change", previous_snapshot_id: prev?.id ?? null, snapshot_id: snapId,
      diff: lineDiff(prev?.content_text ?? "", f.text ?? ""), email_status: "pending_email_domain",
    });
    summary.alerts++;
  }
  await admin.from("monitored_sources").update({ last_hash: f.hash, consecutive_failures: 0, last_checked_at: now }).eq("id", s.id);
  summary.checked++;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Snapshot once; Wayback is retried on later runs until a capture succeeds (spaced to respect its rate limit). */
async function archiveOnce(admin: Admin, s: any, summary: any) {
  const update: Record<string, unknown> = { last_checked_at: new Date().toISOString() };
  if (!s.last_checked_at) {
    const f = await fetchPage(s.url);
    await insertSnapshot(admin, s.id, s.url, f, "archive_once");
    update.last_hash = f.hash;
  }
  const wb = await requestWayback(s.url);
  if (wb.url) update.archive_url = wb.url;
  await admin.from("monitored_sources").update(update).eq("id", s.id);
  await sleep(10000);
  summary.archived++;
}

async function processCapture(admin: Admin, c: any, sources: any[]) {
  const src = sources.find((s) => stripFragment(s.url) === stripFragment(c.url));
  const manual = src?.source_type === "manual" || c.url.includes("sellercentral.amazon.com");
  if (manual) {
    await admin.from("evidence_captures").update({
      status: "flagged", snapshot_ok: false, wayback_ok: false, processed_at: new Date().toISOString(),
      error: "Manual source (login required or blocks automated access); not captured automatically",
    }).eq("id", c.id);
    return;
  }
  const f = await fetchPage(c.url);
  const snapId = await insertSnapshot(admin, src?.id ?? null, c.url, f, "record_save");
  const wb = await requestWayback(c.url);
  await sleep(10000);
  const snapshotOk = !f.error;
  const errors = [f.error && `Snapshot: ${f.error}`, wb.error && `Wayback: ${wb.error}`].filter(Boolean).join("; ");
  await admin.from("evidence_captures").update({
    status: snapshotOk && wb.url ? "complete" : "flagged", snapshot_id: snapId, snapshot_ok: snapshotOk,
    wayback_ok: !!wb.url, wayback_url: wb.url, error: errors || null, processed_at: new Date().toISOString(),
  }).eq("id", c.id);
}

/** Idempotent run: pending evidence captures, due weekly checks, and not-yet-archived archive-once sources. */
export async function runSourceMonitor() {
  const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
  const summary = { captures: 0, checked: 0, failures: 0, alerts: 0, archived: 0 };
  const { data: sources } = await admin.from("monitored_sources").select("*").eq("active", true);
  const all = sources ?? [];

  const { data: pending } = await admin.from("evidence_captures").select("*").eq("status", "pending")
    .order("requested_at").limit(MAX_CAPTURES_PER_RUN);
  for (const c of pending ?? []) { await processCapture(admin, c, all); summary.captures++; }

  const now = new Date();
  for (const s of all.filter((x: any) => x.source_type === "monitor_weekly" && isWeeklyCheckDue(x.last_checked_at, now))) {
    await checkWeekly(admin, s, summary);
  }
  for (const s of all.filter((x: any) => x.source_type === "archive_once" && !x.archive_url)) {
    await archiveOnce(admin, s, summary);
  }
  return summary;
}
