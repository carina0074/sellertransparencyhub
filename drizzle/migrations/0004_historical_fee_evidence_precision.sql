ALTER TABLE public.fee_changes ALTER COLUMN effective_date DROP NOT NULL;
ALTER TABLE public.fee_changes ADD COLUMN effective_date_precision text NOT NULL DEFAULT 'exact';
ALTER TABLE public.fee_changes ADD COLUMN effective_period text;
ALTER TABLE public.fee_changes ADD COLUMN evidence_details jsonb;
ALTER TABLE public.fee_changes ADD CONSTRAINT fee_changes_date_precision_valid CHECK (effective_date_precision IN ('exact','month','year','unknown'));
COMMENT ON COLUMN public.fee_changes.effective_date IS 'Exact first-party-supported historical effective day; NULL for month/year/unknown precision. Never infer from current pricing or review date.';
COMMENT ON COLUMN public.fee_changes.effective_period IS 'YYYY-MM or YYYY only for evidence-supported month/year precision; no invented first day.';
COMMENT ON COLUMN public.fee_changes.evidence_details IS 'Saved first-party historical evidence references, quotations, review date, applicability and linkage rationale; verification is about historical transitions, not current values.';