
-- fee_records: current published marketplace fees
CREATE TABLE public.fee_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  marketplace text NOT NULL,
  fee_name text NOT NULL,
  category text NOT NULL,
  fee_type text NOT NULL,
  value numeric NOT NULL,
  value_type text NOT NULL,
  effective_date date NOT NULL,
  source_url text NOT NULL,
  source_title text NOT NULL,
  last_verified date NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fee_records TO anon, authenticated;
GRANT ALL ON public.fee_records TO service_role;
ALTER TABLE public.fee_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read fee_records" ON public.fee_records FOR SELECT USING (true);

CREATE INDEX fee_records_marketplace_idx ON public.fee_records(marketplace);
CREATE INDEX fee_records_fee_type_idx ON public.fee_records(fee_type);

-- fee_changes: historical change events
CREATE TABLE public.fee_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid REFERENCES public.fee_records(id) ON DELETE SET NULL,
  marketplace text NOT NULL,
  fee_type text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  old_value numeric NOT NULL,
  new_value numeric NOT NULL,
  value_type text NOT NULL,
  change_amount numeric NOT NULL,
  effective_date date NOT NULL,
  announcement_date date,
  impact_level text NOT NULL CHECK (impact_level IN ('low','medium','high')),
  source_url text NOT NULL,
  source_title text NOT NULL,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fee_changes TO anon, authenticated;
GRANT ALL ON public.fee_changes TO service_role;
ALTER TABLE public.fee_changes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read fee_changes" ON public.fee_changes FOR SELECT USING (true);

CREATE INDEX fee_changes_effective_date_idx ON public.fee_changes(effective_date DESC);
CREATE INDEX fee_changes_marketplace_idx ON public.fee_changes(marketplace);

-- impact_reports: original Seller Transparency Hub analyses
CREATE TABLE public.impact_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  marketplace text NOT NULL,
  title text NOT NULL,
  publish_date date NOT NULL,
  affected_categories text[] NOT NULL DEFAULT '{}',
  estimated_seller_impact text NOT NULL,
  methodology text NOT NULL,
  sample_size integer,
  summary text NOT NULL,
  body_markdown text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.impact_reports TO anon, authenticated;
GRANT ALL ON public.impact_reports TO service_role;
ALTER TABLE public.impact_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read impact_reports" ON public.impact_reports FOR SELECT USING (true);

CREATE INDEX impact_reports_publish_date_idx ON public.impact_reports(publish_date DESC);
