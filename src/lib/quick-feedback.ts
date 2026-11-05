/** Pure helpers for the one-tap feedback prompt (shown at most once per page per session). */

export const QUICK_FEEDBACK_KEY_PREFIX = "quick-feedback-shown:";

/** Survey link shown under the thank-you message. Empty = hidden until a URL is provided.
 * Public response link (the /edit address only opens for the form's owner). */
export const RESEARCH_SURVEY_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScHJxNsNNNlnDV2zfMQh2B8t9PZixMWS-0W9F6A26ckeOrMAw/viewform";

type SessionStore = Pick<Storage, "getItem" | "setItem">;

export function quickFeedbackKey(path: string): string {
  return QUICK_FEEDBACK_KEY_PREFIX + path;
}

export function wasShownThisSession(store: SessionStore | null, path: string): boolean {
  try {
    return store?.getItem(quickFeedbackKey(path)) === "1";
  } catch {
    return false;
  }
}

export function markShownThisSession(store: SessionStore | null, path: string): void {
  try {
    store?.setItem(quickFeedbackKey(path), "1");
  } catch {
    /* storage unavailable — prompt simply may show again */
  }
}

/** GA4 option value for a follow-up. Free text is never sent; only a fixed marker. */
export function followUpAnalyticsOption(answer: "yes" | "no", option: string): string {
  return answer === "yes" ? option : "missing_text_provided";
}

/** Clicks that count as a "moment of value" on database pages: expanding a record or opening a source. */
export function isValueMomentClick(target: EventTarget | null): boolean {
  const el = target as Element | null;
  if (!el || typeof el.closest !== "function") return false;
  return Boolean(el.closest("summary") || el.closest('a[target="_blank"]'));
}

export const RECORD_TYPES = ["fee_record", "fee_change", "policy_change"] as const;
export type RecordType = (typeof RECORD_TYPES)[number];
export type ValueRecord = { id: string; type: RecordType };

/** The record (if any) a value-moment click happened inside, from data-record-id/type attributes. */
export function recordFromClick(target: EventTarget | null): ValueRecord | null {
  const el = target as Element | null;
  if (!el || typeof el.closest !== "function") return null;
  const host = el.closest("[data-record-id]");
  const id = host?.getAttribute("data-record-id");
  const type = host?.getAttribute("data-record-type") as RecordType | null;
  return id && type && (RECORD_TYPES as readonly string[]).includes(type) ? { id, type } : null;
}
