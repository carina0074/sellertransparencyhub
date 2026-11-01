CREATE OR REPLACE FUNCTION public.validate_current_fee_evidence() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE ref jsonb; element jsonb; relevant boolean;
BEGIN
  IF TG_OP = 'INSERT' THEN relevant := true;
  ELSE relevant := NEW.pricing_details IS DISTINCT FROM OLD.pricing_details OR NEW.verification_status IS DISTINCT FROM OLD.verification_status OR NEW.value IS DISTINCT FROM OLD.value OR NEW.value_type IS DISTINCT FROM OLD.value_type OR NEW.source_url IS DISTINCT FROM OLD.source_url OR NEW.source_title IS DISTINCT FROM OLD.source_title;
  END IF;
  IF relevant THEN
    IF jsonb_typeof(NEW.pricing_details->'references') IS DISTINCT FROM 'array' OR jsonb_array_length(NEW.pricing_details->'references') = 0 THEN
      RAISE EXCEPTION 'Current-fee evidence requires at least one reference' USING ERRCODE = '23514';
    END IF;
    FOR ref IN SELECT value FROM jsonb_array_elements(NEW.pricing_details->'references') LOOP
      IF jsonb_typeof(ref->'quote') IS DISTINCT FROM 'string' OR NULLIF(btrim(ref->>'quote'),'') IS NULL OR jsonb_typeof(ref->'heading') IS DISTINCT FROM 'string' OR NULLIF(btrim(ref->>'heading'),'') IS NULL THEN
        RAISE EXCEPTION 'Each current-fee reference requires a supporting quote and source section heading' USING ERRCODE = '23514';
      END IF;
    END LOOP;
  END IF;
  IF NEW.verification_status = 'partially_verified' AND (relevant OR TG_OP = 'INSERT' OR NEW.notes IS DISTINCT FROM OLD.notes) THEN
    IF (NEW.pricing_details->'verification'->'headline_value_confirmed') IS DISTINCT FROM 'true'::jsonb OR jsonb_typeof(NEW.pricing_details->'verification'->'unconfirmed_elements') IS DISTINCT FROM 'array' THEN
      RAISE EXCEPTION 'partially_verified requires confirmed headline evidence and explicit unconfirmed elements' USING ERRCODE = '23514';
    END IF;
    IF jsonb_array_length(NEW.pricing_details->'verification'->'unconfirmed_elements') = 0 THEN
      RAISE EXCEPTION 'partially_verified requires at least one unconfirmed condition, tier or scope element' USING ERRCODE = '23514';
    END IF;
    FOR element IN SELECT value FROM jsonb_array_elements(NEW.pricing_details->'verification'->'unconfirmed_elements') LOOP
      IF jsonb_typeof(element) IS DISTINCT FROM 'string' OR NULLIF(btrim(element #>> '{}'),'') IS NULL OR position(lower(element #>> '{}') in lower(COALESCE(NEW.notes,''))) = 0 THEN
        RAISE EXCEPTION 'Notes must identify each unconfirmed condition, tier or scope element' USING ERRCODE = '23514';
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.validate_current_fee_evidence() FROM PUBLIC;
CREATE TRIGGER fee_records_validate_evidence BEFORE INSERT OR UPDATE ON public.fee_records FOR EACH ROW EXECUTE FUNCTION public.validate_current_fee_evidence();
COMMENT ON FUNCTION public.validate_current_fee_evidence() IS 'Prospective reference quote/heading validation; partial verification requires reviewer headline confirmation and unconfirmed elements repeated in notes. Existing rows are not backfilled; unchanged evidence survives unrelated edits. First-party truth remains a human review responsibility.';