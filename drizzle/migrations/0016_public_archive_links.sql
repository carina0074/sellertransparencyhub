-- Public projection of archived source copies held in the private monitor tables.
-- Returns only the source URL and its archived copy URL; no labels, notes,
-- snapshots, alerts or review data are exposed.
CREATE OR REPLACE FUNCTION public.public_archive_links()
RETURNS TABLE(url text, archive_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT s.url, s.archive_url
  FROM public.monitored_sources AS s
  WHERE s.archive_url IS NOT NULL
  UNION
  SELECT c.url, c.wayback_url
  FROM public.evidence_captures AS c
  WHERE c.wayback_url IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.public_archive_links() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.public_archive_links() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_archive_links() TO anon, authenticated;

COMMENT ON FUNCTION public.public_archive_links() IS 'Public read-only map of source URL to archived copy URL; private monitor tables are otherwise admin-only.';