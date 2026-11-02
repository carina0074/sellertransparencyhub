ALTER TABLE public.feedback_submissions
  ADD COLUMN IF NOT EXISTS answer text,
  ADD COLUMN IF NOT EXISTS record_id text,
  ADD COLUMN IF NOT EXISTS follow_up text;

ALTER TABLE public.feedback_submissions
  ADD CONSTRAINT feedback_answer_check CHECK (answer IS NULL OR answer IN ('yes','no')),
  ADD CONSTRAINT feedback_record_id_len CHECK (record_id IS NULL OR length(record_id) <= 200),
  ADD CONSTRAINT feedback_follow_up_len CHECK (follow_up IS NULL OR length(follow_up) <= 300);

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
  AND (user_type IS NULL OR user_type = ANY (ARRAY['marketplace_seller','service_provider','researcher','other']))
  AND (information_access_response IS NULL OR information_access_response = ANY (ARRAY['yes','somewhat','no']))
  AND follow_up IS NULL
);

-- Adds the single optional follow-up to a quick-prompt answer, once, shortly after the tap.
CREATE OR REPLACE FUNCTION public.add_feedback_follow_up(_id uuid, _follow_up text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r public.feedback_submissions%ROWTYPE;
BEGIN
  _follow_up := btrim(coalesce(_follow_up, ''));
  IF length(_follow_up) < 1 OR length(_follow_up) > 300 THEN RETURN false; END IF;
  SELECT * INTO r FROM public.feedback_submissions WHERE id = _id;
  IF NOT FOUND OR r.answer IS NULL OR r.follow_up IS NOT NULL
     OR r.created_at < now() - interval '2 hours' THEN RETURN false; END IF;
  IF r.answer = 'yes' AND _follow_up NOT IN ('Setting prices','Choosing a marketplace','Estimating profit','Comparing fulfillment options','Research or reporting','Other') THEN
    RETURN false;
  END IF;
  UPDATE public.feedback_submissions SET follow_up = _follow_up WHERE id = _id;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.add_feedback_follow_up(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_feedback_follow_up(uuid, text) TO anon, authenticated;