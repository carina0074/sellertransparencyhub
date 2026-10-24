# Architecture rules

- Store current percentage fees as decimal fractions; preserve historical data conventions independently to avoid rewriting past events.
- Store optional fee applicability and composite pricing in `fee_records.pricing_details`; monetary components use integer minor units and explicit currency, and pure formatting lives in `src/lib/fee-formatting.ts` so UI and tests share one interpretation.
- Current coverage uses the shared statistics reader: exact database counts for records/events, ordered full-table metadata pagination for distinct marketplace/category labels and latest verification; keep historical report figures independent to avoid confusing snapshots with live coverage.- All GA4 events go through `trackEvent` in `src/lib/analytics.ts`; never send PII, emails, free text, prices, or revenue — only the documented non-personal parameters.
- Research feedback lives in `feedback_submissions` (public validated INSERT, admin-only read via `private.has_role`); it is never mixed with newsletter subscribers and never published as testimonials.
