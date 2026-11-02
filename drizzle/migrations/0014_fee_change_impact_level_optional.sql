ALTER TABLE public.fee_changes ALTER COLUMN impact_level DROP NOT NULL;
COMMENT ON COLUMN public.fee_changes.impact_level IS 'Optional. NULL = not assessed. Do not assign until a written impact rule exists.';
CREATE TABLE public.impact_level_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection text NOT NULL,
  record_id uuid NOT NULL,
  old_value text,
  new_value text,
  reason text NOT NULL,
  logged_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
GRANT SELECT ON public.impact_level_change_log TO authenticated;
GRANT ALL ON public.impact_level_change_log TO service_role;
ALTER TABLE public.impact_level_change_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read impact level log" ON public.impact_level_change_log FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
INSERT INTO public.impact_level_change_log (collection, record_id, old_value, new_value, reason)
SELECT 'fee_changes', id, impact_level, NULL, 'Cleared to not assessed: no written impact rule exists (maintainer instruction, Nov 1, 2026 ET).' FROM public.fee_changes WHERE impact_level IS NOT NULL;
INSERT INTO public.impact_level_change_log (collection, record_id, old_value, new_value, reason)
SELECT 'policy_changes', id, impact_level, NULL, 'Cleared to not assessed: no written impact rule exists (maintainer instruction, Nov 1, 2026 ET).' FROM public.policy_changes WHERE impact_level IS NOT NULL;