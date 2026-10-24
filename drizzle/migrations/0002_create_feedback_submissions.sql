CREATE TABLE public.feedback_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  resource_type text NOT NULL,
  resource_path text NOT NULL,
  usefulness_response text NOT NULL,
  marketplaces text[] NOT NULL DEFAULT '{}',
  use_cases text[] NOT NULL DEFAULT '{}',
  free_text_feedback text,
  follow_up_opt_in boolean NOT NULL DEFAULT false,
  follow_up_email text
);

GRANT INSERT ON public.feedback_submissions TO anon, authenticated;
GRANT SELECT, DELETE ON public.feedback_submissions TO authenticated;
GRANT ALL ON public.feedback_submissions TO service_role;

ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
ON public.feedback_submissions FOR INSERT TO anon, authenticated
WITH CHECK (
  usefulness_response IN ('yes', 'somewhat', 'not_really')
  AND length(resource_type) BETWEEN 1 AND 50
  AND length(resource_path) BETWEEN 1 AND 500
  AND (free_text_feedback IS NULL OR length(free_text_feedback) <= 2000)
  AND (follow_up_email IS NULL OR public.is_valid_email(follow_up_email))
  AND (follow_up_email IS NULL OR follow_up_opt_in)
);

CREATE POLICY "Admins can view feedback"
ON public.feedback_submissions FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete feedback"
ON public.feedback_submissions FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role));