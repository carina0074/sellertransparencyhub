/**
 * GA4 event helper. The gtag snippet is loaded once in src/routes/__root.tsx.
 *
 * Privacy rules (Phase 2F):
 * - Never send email addresses, free-text feedback, seller revenue, prices,
 *   or any user-entered text to GA4.
 * - Only send the non-personal parameters documented per event below.
 *
 * Events and triggers:
 * - fee_database_view              — Fee Database page mounted
 * - marketplace_filter_used        — marketplace filter changed (param: marketplace)
 * - fee_source_clicked             — official source link clicked (params: marketplace, fee_type)
 * - calculator_started             — first calculator input change
 * - calculator_result_viewed        — first post-interaction result for each marketplace/category per mounted page
 *   (params: marketplace, category, support_status: modeled_with_exclusions | partially_supported | unsupported)
 *   Historical calculator_completed and calculator_unsupported_combination events are no longer emitted.
 * - transparency_report_viewed     — report page mounted (param: report)
 * - feedback_prompt_shown        — one-tap prompt displayed (param: resource_type)
 * - feedback_answered            — Yes/No tapped (params: answer: yes|no, resource_type)
 * - feedback_followup            — follow-up chosen (param: option — a fixed use option, or
 *   "missing_text_provided"; the free text itself is never sent)
 * - source_clicked               — official source/reference link clicked on Fee Database, Fee Change Feed or
 *   Policy Archive (params: dataset: fee_database|fee_change_feed|policy_archive, marketplace)
 * - archived_copy_clicked        — "Archived copy" link opened (param: dataset)
 * - newsletter_subscribed        — new email added (already-subscribed doesn't fire; no params)
 * - dataset_page_viewed          — Fee Change Feed / Policy Archive page opened (param: dataset)
 * Legacy long-survey events (no longer rendered):
 * - feedback_prompt_answered       — usefulness button clicked (params: resource_type, response)
 * - feedback_started               — first interaction with the expanded feedback form (param: resource_type)
 * - feedback_submitted             — feedback successfully stored (params: resource_type, usefulness)
 */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  if (!analyticsAllowed()) return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") gtag("event", name, params);
}

const GA_ID = "G-Z45Q4LF9HX";
export const PRODUCTION_HOSTS = ["sellertransparency.com", "www.sellertransparency.com"];

export function isProductionHost(hostname: string): boolean {
  return PRODUCTION_HOSTS.includes(hostname.toLowerCase());
}

/** False on non-production hosts, automated browsers, or once a session signs in. */
export function analyticsAllowed(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as Record<string, unknown>;
  if (w[`ga-disable-${GA_ID}`]) return false;
  if (!isProductionHost(window.location.hostname)) return false;
  if (navigator.webdriver) return false;
  return true;
}

/** Called when an auth session appears: stops GA4 for the rest of the page life. */
export function disableAnalytics(): void {
  if (typeof window === "undefined") return;
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = true;
}
