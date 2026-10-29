ALTER TABLE public.policy_changes ALTER COLUMN effective_date DROP NOT NULL;
ALTER TABLE public.policy_changes ADD COLUMN effective_date_precision text NOT NULL DEFAULT 'unknown', ADD COLUMN effective_period text, ADD COLUMN evidence_details jsonb;
UPDATE public.policy_changes SET effective_date_precision = 'exact' WHERE effective_date IS NOT NULL;
ALTER TABLE public.policy_changes ADD CONSTRAINT policy_effective_precision CHECK (
 (effective_date_precision = 'exact' AND effective_date IS NOT NULL AND effective_period IS NULL) OR
 (effective_date_precision = 'month' AND effective_date IS NULL AND effective_period ~ '^[0-9]{4}-(0[1-9]|1[0-2])$') OR
 (effective_date_precision = 'year' AND effective_date IS NULL AND effective_period ~ '^[0-9]{4}$') OR
 (effective_date_precision = 'unknown' AND effective_date IS NULL AND effective_period IS NULL)
);
COMMENT ON COLUMN public.policy_changes.evidence_details IS 'Independent first-party policy event evidence, scope, conditions and review date; current guidance alone does not prove history.';