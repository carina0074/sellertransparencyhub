-- created_at already exists with its original now() default; preserve it verbatim.
ALTER TABLE public.fee_records ADD COLUMN updated_at timestamptz;
COMMENT ON COLUMN public.fee_records.updated_at IS 'Prospective edit timestamp only. NULL on pre-existing rows until edited; never backfill from verification or creation dates.';

CREATE TABLE public.fee_record_edit_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid NOT NULL,
  field_changed text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  changed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  source_url text
);
GRANT SELECT ON public.fee_record_edit_history TO authenticated;
GRANT SELECT, INSERT ON public.fee_record_edit_history TO service_role;
ALTER TABLE public.fee_record_edit_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read fee edit history" ON public.fee_record_edit_history
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX fee_record_edit_history_record_time_idx ON public.fee_record_edit_history (record_id, changed_at, id);
COMMENT ON TABLE public.fee_record_edit_history IS 'Append-only, field-level history of future fee record edits. No historical backfill; record IDs survive retirement of the source record.';

CREATE FUNCTION public.stamp_fee_record_edit() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at := clock_timestamp();
  RETURN NEW;
END;
$$;
CREATE FUNCTION public.log_fee_record_edit() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  old_record jsonb := to_jsonb(OLD);
  new_record jsonb := to_jsonb(NEW);
  field_name text;
BEGIN
  FOR field_name IN SELECT jsonb_object_keys(new_record) LOOP
    IF field_name <> 'updated_at' AND old_record -> field_name IS DISTINCT FROM new_record -> field_name THEN
      INSERT INTO public.fee_record_edit_history (record_id, field_changed, old_value, new_value, changed_at, source_url)
      VALUES (NEW.id, field_name, old_record -> field_name, new_record -> field_name, NEW.updated_at,
              COALESCE(NULLIF(NEW.source_url, ''), NULLIF(OLD.source_url, '')));
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;
CREATE FUNCTION public.reject_fee_history_mutation() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  RAISE EXCEPTION 'Fee edit history is append-only' USING ERRCODE = '42501';
END;
$$;
REVOKE ALL ON FUNCTION public.stamp_fee_record_edit() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_fee_record_edit() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reject_fee_history_mutation() FROM PUBLIC;
CREATE TRIGGER fee_records_stamp_edit BEFORE UPDATE ON public.fee_records
  FOR EACH ROW EXECUTE FUNCTION public.stamp_fee_record_edit();
CREATE TRIGGER fee_records_log_edit AFTER UPDATE ON public.fee_records
  FOR EACH ROW EXECUTE FUNCTION public.log_fee_record_edit();
CREATE TRIGGER fee_history_reject_update_delete BEFORE UPDATE OR DELETE ON public.fee_record_edit_history
  FOR EACH ROW EXECUTE FUNCTION public.reject_fee_history_mutation();
CREATE TRIGGER fee_history_reject_truncate BEFORE TRUNCATE ON public.fee_record_edit_history
  FOR EACH STATEMENT EXECUTE FUNCTION public.reject_fee_history_mutation();