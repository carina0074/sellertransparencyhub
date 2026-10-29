ALTER TABLE public.fee_records ALTER COLUMN effective_date DROP NOT NULL;
ALTER TABLE public.fee_records ADD COLUMN verification_status text NOT NULL DEFAULT 'verification_pending';
ALTER TABLE public.fee_records ADD CONSTRAINT fee_records_verification_status_valid CHECK (verification_status IN ('verified_current_value', 'partially_verified', 'verification_pending'));
COMMENT ON COLUMN public.fee_records.effective_date IS 'Independently established effective date; NULL when current evidence does not establish an exact date.';
COMMENT ON COLUMN public.fee_records.last_verified IS 'Date of the last successful first-party current-value review; never refreshed when authoritative evidence is inaccessible.';
COMMENT ON COLUMN public.fee_records.verification_status IS 'Current-value and applicability verification, separate from effective-date evidence.';