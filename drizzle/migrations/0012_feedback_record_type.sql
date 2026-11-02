ALTER TABLE public.feedback_submissions ADD COLUMN IF NOT EXISTS record_type text;
ALTER TABLE public.feedback_submissions ADD CONSTRAINT feedback_record_type_check
  CHECK (record_type IS NULL OR record_type IN ('fee_record','fee_change','policy_change'));