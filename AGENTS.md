# Architecture rules

- Share image metadata is explicit on public leaf routes, never root or hidden routes; the approved image is served from the site's public images directory.
- Field meanings are shared between Methodology's Technical reference and the export dictionary so both use the same interpretation.
- Account health scoring lives in a pure tested module; preserve the heuristic formula independently of marketplace-published targets and recommendation triggers.

- Region is explicit in all research collections, with UNSPECIFIED where first-party historical country scope is absent; do not infer countries from currency or current-record linkage.
- Research export runs only as an operator CLI script using one read-only database statement for records and schema; files remain outside public app paths and share one version and timestamp to avoid mixed snapshots.
- Enforce current-fee evidence prospectively with a database trigger on new records and evidence/headline/status changes; retain unchanged legacy evidence on unrelated edits so omissions can be reviewed without invented backfills. Partial verification stores a reviewer confirmation and explicit unconfirmed elements repeated in notes; database validation cannot establish source truth.
- Keep legacy-compatible pricing readers separate from write validation so older reference omissions do not suppress supported fee displays.
- Keep methodology field-level tables in the bottom collapsible Technical reference; the seller-facing narrative describes research rather than implementation.
- Current IDs are not enforced immutable; fee_type is free text and policy supported_fields is not a column enum. Public projections omit some internal timestamps; retain these implementation facts here rather than public prose.
- Store unreleased sample snapshots under research-exports, never public app paths; preserve the original version and timestamp for review.
- Methodology’s release/license/citation TODOs remain in unrendered source until approved; describe current evidence variants rather than implying a universal schema or released dataset.

- Fee edits are timestamped and logged per changed business field by database triggers; history is admin-readable and mutation-protected, without cascading record deletion, so all write paths share durable append-only provenance.
- Test database trigger behavior against the applied SQL in isolated PGlite PostgreSQL; never validate audit logging by changing production research records.

- Store current percentage fees as decimal fractions; preserve historical data conventions independently to avoid rewriting past events.
- Store optional fee applicability and composite pricing in `fee_records.pricing_details`; monetary components use integer minor units and explicit currency, and pure formatting lives in `src/lib/fee-formatting.ts` so UI and tests share one interpretation.
- Model current whole-price thresholds, marginal portions, schedule conditions and billing options as distinct structured pricing kinds; this prevents a base value from masquerading as a universal fee.
- Keep current-value verification status separate from nullable effective dates; review dates record successful first-party evidence checks, never source-domain membership.
- Retire misleading unmodelled current flat fee rows rather than retaining hidden numeric placeholders; public data and database-derived coverage must describe the same current dataset.
- Keep relative fee-change calculation in the shared formatting module and return null for a zero baseline, because an undefined percentage must not be rendered as a numeric increase.
- Historical events keep independent evidence details and exact/month/year/unknown effective precision; only exact precision uses effective_date, so historical transitions cannot inherit precision from current fees.
- Policy events reuse historical date validation but maintain independent policy evidence, scoped applicability, conditions and impact; review/announcement dates never substitute for effective timing.
- Preserve full historical before-state snapshots in remediation deliverables before retiring unsupported public events; current relationships require explicit same-fee-concept evidence and do not modify current values.
- Current coverage uses the shared statistics reader: exact database counts for records/events, ordered full-table metadata pagination for distinct marketplace/category labels and latest verification; keep historical report figures independent to avoid confusing snapshots with live coverage.- All GA4 events go through `trackEvent` in `src/lib/analytics.ts`; never send PII, emails, free text, prices, or revenue — only the documented non-personal parameters.
- Research feedback lives in `feedback_submissions` (public validated INSERT, admin-only read via `private.has_role`); it is never mixed with newsletter subscribers and never published as testimonials.
- Keep calculator result-event deduplication and identifier-only model-coverage classification in `src/lib/calculator-analytics.ts`; sharing the Walmart referral availability map avoids treating intentional cost exclusions as failed combinations without altering fee formulas.
- On-site feedback uses the one-tap QuickFeedback prompt (answer inserted on tap with a client UUID; the single follow-up is added via the add_feedback_follow_up security-definer function since anon has no UPDATE). The long FeedbackPrompt survey is kept but not rendered.
- Source monitoring is admin-only: one idempotent public hook (`/api/public/hooks/source-monitor`, daily cron + record-save triggers) processes queued evidence captures, due weekly checks and pending archive-once captures; snapshots and reviews are append-only, sources that need a login or block plain fetching are manual-only, and nothing writes to public records. Save-time captures live in `evidence_captures` rather than record evidence JSON so current-fee evidence triggers and edit history are untouched. Public 'Archived copy' links use only the `public_archive_links` security-definer projection.
