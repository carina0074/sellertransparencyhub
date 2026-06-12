CREATE TABLE public.policy_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  marketplace TEXT NOT NULL,
  policy_area TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body_markdown TEXT,
  effective_date DATE NOT NULL,
  announcement_date DATE,
  impact_level TEXT NOT NULL CHECK (impact_level IN ('low','medium','high')),
  affected_sellers TEXT,
  source_url TEXT NOT NULL,
  source_title TEXT NOT NULL,
  last_verified DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.policy_changes TO anon, authenticated;
GRANT ALL ON public.policy_changes TO service_role;

ALTER TABLE public.policy_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read policy_changes" ON public.policy_changes FOR SELECT USING (true);

CREATE INDEX policy_changes_effective_date_idx ON public.policy_changes (effective_date DESC);
CREATE INDEX policy_changes_marketplace_idx ON public.policy_changes (marketplace);