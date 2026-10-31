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
 * - feedback_prompt_answered       — usefulness button clicked (params: resource_type, response)
 * - feedback_started               — first interaction with the expanded feedback form (param: resource_type)
 * - feedback_submitted             — feedback successfully stored (params: resource_type, usefulness)
 */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") gtag("event", name, params);
}
