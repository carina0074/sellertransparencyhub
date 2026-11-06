ALTER TABLE public.fee_records ADD COLUMN public_corroborating_source_url text;
COMMENT ON COLUMN public.fee_records.public_corroborating_source_url IS 'Optional public corroborating source; no existing URLs backfilled. Independent of primary current-value evidence. Saving a new URL enqueues a private evidence capture processed by the existing monitor.';
ALTER TABLE public.fee_records ADD CONSTRAINT fee_records_public_corroborating_url CHECK (public_corroborating_source_url IS NULL OR (public_corroborating_source_url ~ '^https://[^/[:space:]]+' AND public_corroborating_source_url !~* '^https://sellercentral\.amazon\.com([/:]|$)'));
CREATE FUNCTION public.enqueue_public_corroborating_capture() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF NEW.public_corroborating_source_url IS NULL THEN RETURN NEW; END IF;
 IF TG_OP = 'UPDATE' THEN
   IF NEW.public_corroborating_source_url IS NOT DISTINCT FROM OLD.public_corroborating_source_url THEN RETURN NEW; END IF;
 END IF;
 INSERT INTO public.evidence_captures(record_type,record_id,url) VALUES ('fee_record',NEW.id,NEW.public_corroborating_source_url);
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.enqueue_public_corroborating_capture() FROM PUBLIC;
CREATE TRIGGER fee_records_public_corroborating_capture AFTER INSERT OR UPDATE OF public_corroborating_source_url ON public.fee_records FOR EACH ROW EXECUTE FUNCTION public.enqueue_public_corroborating_capture();