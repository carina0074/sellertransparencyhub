// Pure helpers for the private source monitor. No I/O here so the rules are testable.

export const MONITOR_USER_AGENT =
  "SellerTransparencyHub-SourceMonitor/1.0 (+https://sellertransparency.com; research@sellertransparency.com)";
export const MONITOR_UA_TOKEN = "SellerTransparencyHub-SourceMonitor";

/** Days after which a manual source is "Due for manual check". */
export const MANUAL_CHECK_MAX_AGE_DAYS = 30;
/** Consecutive fetch failures before a failure alert is raised. */
export const FAILURE_ALERT_THRESHOLD = 2;
/** Minimum days between automatic checks of the same weekly source. */
export const WEEKLY_MIN_INTERVAL_DAYS = 6;

export function stripFragment(url: string): string {
  const i = url.indexOf("#");
  return i === -1 ? url : url.slice(0, i);
}

/** Minimal robots.txt evaluation: picks the group for our token (else "*"), longest-match Allow/Disallow. */
export function robotsAllows(robotsTxt: string, url: string, uaToken = MONITOR_UA_TOKEN): boolean {
  const u = new URL(url);
  const path = u.pathname + u.search;
  type Group = { agents: string[]; rules: { allow: boolean; path: string }[] };
  const groups: Group[] = [];
  let current: Group | null = null;
  let lastWasAgent = false;
  for (const raw of robotsTxt.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (key === "user-agent") {
      if (!current || !lastWasAgent) { current = { agents: [], rules: [] }; groups.push(current); }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if (key === "allow" || key === "disallow") {
      lastWasAgent = false;
      if (current && (key === "allow" || value !== "")) current.rules.push({ allow: key === "allow", path: value });
    } else {
      lastWasAgent = false;
    }
  }
  const token = uaToken.toLowerCase();
  const group =
    groups.find((g) => g.agents.some((a) => a !== "*" && token.includes(a))) ??
    groups.find((g) => g.agents.includes("*"));
  if (!group) return true;
  let best: { allow: boolean; len: number } | null = null;
  for (const r of group.rules) {
    if (!r.path) continue;
    const pattern = "^" + r.path.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$");
    if (new RegExp(pattern).test(path)) {
      if (!best || r.path.length > best.len || (r.path.length === best.len && r.allow)) best = { allow: r.allow, len: r.path.length };
    }
  }
  return best ? best.allow : true;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Extract readable main text from HTML and normalize whitespace (one line per block). */
export function extractMainText(html: string): string {
  let h = html.replace(/<!--[\s\S]*?-->/g, " ");
  h = h.replace(/<(script|style|noscript|svg|template|iframe)[^>]*>[\s\S]*?<\/\1>/gi, " ");
  const main = h.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? h.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? h;
  let body = main.replace(/\s+/g, " ").replace(/<(nav|header|footer)[^>]*>[\s\S]*?<\/\1>/gi, " ");
  body = body.replace(/<\/?(p|div|li|h[1-6]|tr|br|section|article|table|ul|ol|dt|dd)[^>]*>/gi, "\n");
  body = body.replace(/<[^>]+>/g, " ");
  body = body.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
  return normalizeText(body);
}

export function normalizeText(text: string): string {
  return text
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Line diff (LCS). Output lines prefixed "- " (removed) or "+ " (added); unchanged lines omitted. */
export function lineDiff(before: string, after: string, maxLines = 4000): string {
  const a = before.split("\n").slice(0, maxLines);
  const b = after.split("\n").slice(0, maxLines);
  const n = a.length, m = b.length;
  const dp: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: string[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) out.push("- " + a[i++]);
    else out.push("+ " + b[j++]);
  }
  while (i < n) out.push("- " + a[i++]);
  while (j < m) out.push("+ " + b[j++]);
  return out.join("\n");
}

/** A failure alert is raised exactly when the consecutive count reaches the threshold. */
export function shouldRaiseFailureAlert(consecutiveFailures: number): boolean {
  return consecutiveFailures === FAILURE_ALERT_THRESHOLD;
}

export function isDueForManualCheck(lastManualCheck: string | null, today: Date): boolean {
  if (!lastManualCheck) return true;
  const last = new Date(lastManualCheck + "T00:00:00Z").getTime();
  const days = (Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) - last) / 86400000;
  return days > MANUAL_CHECK_MAX_AGE_DAYS;
}

export function isWeeklyCheckDue(lastCheckedAt: string | null, now: Date): boolean {
  if (!lastCheckedAt) return true;
  return now.getTime() - new Date(lastCheckedAt).getTime() >= WEEKLY_MIN_INTERVAL_DAYS * 86400000;
}
