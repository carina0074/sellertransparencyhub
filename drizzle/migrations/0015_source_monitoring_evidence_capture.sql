CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE TABLE public.monitored_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL UNIQUE,
  marketplace text NOT NULL,
  label text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('monitor_weekly','archive_once','manual')),
  frequency text NOT NULL CHECK (frequency IN ('weekly','once','monthly_manual')),
  active boolean NOT NULL DEFAULT true,
  last_checked_at timestamptz,
  last_manual_check date,
  consecutive_failures integer NOT NULL DEFAULT 0,
  last_hash text,
  archive_url text,
  manual_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.monitored_sources TO authenticated;
GRANT ALL ON public.monitored_sources TO service_role;
ALTER TABLE public.monitored_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read monitored sources" ON public.monitored_sources FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.source_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES public.monitored_sources(id),
  url text NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  http_status integer,
  content_hash text,
  content_text text,
  error text,
  trigger_kind text NOT NULL CHECK (trigger_kind IN ('weekly','archive_once','record_save'))
);
CREATE INDEX source_snapshots_source_idx ON public.source_snapshots (source_id, fetched_at DESC);
GRANT SELECT ON public.source_snapshots TO authenticated;
GRANT ALL ON public.source_snapshots TO service_role;
ALTER TABLE public.source_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read snapshots" ON public.source_snapshots FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.reject_snapshot_mutation() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN RAISE EXCEPTION 'Source snapshots are append-only'; END $$;
CREATE TRIGGER source_snapshots_append_only BEFORE UPDATE OR DELETE ON public.source_snapshots FOR EACH ROW EXECUTE FUNCTION public.reject_snapshot_mutation();

CREATE TABLE public.source_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.monitored_sources(id),
  kind text NOT NULL CHECK (kind IN ('change','fetch_failure')),
  previous_snapshot_id uuid REFERENCES public.source_snapshots(id),
  snapshot_id uuid REFERENCES public.source_snapshots(id),
  diff text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed_no_change','reviewed_updated')),
  email_status text NOT NULL DEFAULT 'not_sent',
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
GRANT SELECT ON public.source_alerts TO authenticated;
GRANT ALL ON public.source_alerts TO service_role;
ALTER TABLE public.source_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read alerts" ON public.source_alerts FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.source_alert_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL REFERENCES public.source_alerts(id),
  reviewer_id uuid NOT NULL,
  reviewer_email text,
  outcome text NOT NULL CHECK (outcome IN ('reviewed_no_change','reviewed_updated')),
  record_type text CHECK (record_type IN ('fee_record','fee_change','policy_event')),
  record_id uuid,
  reviewed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK (outcome <> 'reviewed_updated' OR (record_type IS NOT NULL AND record_id IS NOT NULL))
);
GRANT SELECT ON public.source_alert_reviews TO authenticated;
GRANT ALL ON public.source_alert_reviews TO service_role;
ALTER TABLE public.source_alert_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read alert reviews" ON public.source_alert_reviews FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER source_alert_reviews_append_only BEFORE UPDATE OR DELETE ON public.source_alert_reviews FOR EACH ROW EXECUTE FUNCTION public.reject_snapshot_mutation();

CREATE TABLE public.evidence_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_type text NOT NULL CHECK (record_type IN ('fee_record','fee_change','policy_event')),
  record_id uuid NOT NULL,
  url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','complete','flagged')),
  snapshot_id uuid REFERENCES public.source_snapshots(id),
  wayback_url text,
  snapshot_ok boolean,
  wayback_ok boolean,
  error text,
  requested_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  processed_at timestamptz
);
CREATE INDEX evidence_captures_record_idx ON public.evidence_captures (record_type, record_id);
CREATE INDEX evidence_captures_pending_idx ON public.evidence_captures (status) WHERE status = 'pending';
GRANT SELECT ON public.evidence_captures TO authenticated;
GRANT ALL ON public.evidence_captures TO service_role;
ALTER TABLE public.evidence_captures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read evidence captures" ON public.evidence_captures FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.enqueue_evidence_capture() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  rtype text := TG_ARGV[0];
  urls text[];
  evidence jsonb;
  u text;
BEGIN
  IF TG_TABLE_NAME = 'fee_records' THEN evidence := NEW.pricing_details; ELSE evidence := NEW.evidence_details; END IF;
  urls := ARRAY[NEW.source_url];
  IF evidence IS NOT NULL AND jsonb_typeof(evidence->'references') = 'array' THEN
    urls := urls || ARRAY(SELECT e->>'url' FROM jsonb_array_elements(evidence->'references') e WHERE e->>'url' IS NOT NULL);
  END IF;
  FOREACH u IN ARRAY (SELECT array_agg(DISTINCT x) FROM unnest(urls) x WHERE x ~ '^https?://') LOOP
    INSERT INTO public.evidence_captures (record_type, record_id, url) VALUES (rtype, NEW.id, u);
  END LOOP;
  BEGIN
    PERFORM net.http_post(
      url := 'https://project--57626a55-63a3-4565-b480-7d737f1b59ad.lovable.app/api/public/hooks/source-monitor',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjcHhmZ3h3dWp0enRjZ2hyZXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMjA4MTEsImV4cCI6MjA5Njc5NjgxMX0.wMK_hoBaKMQgew_om6fPnELjGQmHObneKYEVGde9-Eg"}'::jsonb,
      body := '{}'::jsonb);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NEW;
END $$;

CREATE TRIGGER fee_records_evidence_capture AFTER INSERT OR UPDATE OF source_url, value, pricing_details, verification_status, last_verified ON public.fee_records FOR EACH ROW EXECUTE FUNCTION public.enqueue_evidence_capture('fee_record');
CREATE TRIGGER fee_changes_evidence_capture AFTER INSERT OR UPDATE OF source_url, evidence_details, old_value, new_value, effective_date ON public.fee_changes FOR EACH ROW EXECUTE FUNCTION public.enqueue_evidence_capture('fee_change');
CREATE TRIGGER policy_changes_evidence_capture AFTER INSERT OR UPDATE OF source_url, evidence_details, summary, effective_date, last_verified ON public.policy_changes FOR EACH ROW EXECUTE FUNCTION public.enqueue_evidence_capture('policy_event');