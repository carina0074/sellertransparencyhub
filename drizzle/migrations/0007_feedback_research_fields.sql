ALTER TABLE public.feedback_submissions
  ADD COLUMN user_type text NULL CHECK (user_type IS NULL OR user_type IN ('marketplace_seller','service_provider','researcher','other')),
  ADD COLUMN information_access_response text NULL CHECK (information_access_response IS NULL OR information_access_response IN ('yes','somewhat','no'));

DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback_submissions;
CREATE POLICY "Anyone can submit feedback" ON public.feedback_submissions
FOR INSERT TO anon, authenticated
WITH CHECK (
  (usefulness_response = ANY (ARRAY['yes','somewhat','not_really']))
  AND length(resource_type) BETWEEN 1 AND 50
  AND length(resource_path) BETWEEN 1 AND 500
  AND (free_text_feedback IS NULL OR length(free_text_feedback) <= 2000)
  AND (follow_up_email IS NULL OR public.is_valid_email(follow_up_email))
  AND (follow_up_email IS NULL OR follow_up_opt_in)
  AND (user_type IS NULL OR user_type IN ('marketplace_seller','service_provider','researcher','other'))
  AND (information_access_response IS NULL OR information_access_response IN ('yes','somewhat','no'))
);