/** Pure helpers for the one-tap feedback prompt (shown at most once per page per session). */

export const QUICK_FEEDBACK_KEY_PREFIX = "quick-feedback-shown:";

/** Survey link shown under the thank-you message. Empty = hidden until a URL is provided. */
export const RESEARCH_SURVEY_URL = "";

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
