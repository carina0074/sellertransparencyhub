ALTER TABLE public.newsletter_subscriptions ADD COLUMN source text NOT NULL DEFAULT 'shared_footer';
CREATE UNIQUE INDEX newsletter_subscriptions_email_lower_key ON public.newsletter_subscriptions (lower(trim(email)));
INSERT INTO public.newsletter_subscriptions (email, created_at, source)
SELECT e.email, e.created_at, 'legacy_homepage' FROM public.email_subscribers e
WHERE NOT EXISTS (SELECT 1 FROM public.newsletter_subscriptions n WHERE lower(trim(n.email)) = lower(trim(e.email)));
COMMENT ON TABLE public.email_subscribers IS 'DEPRECATED: backup only; canonical list is newsletter_subscriptions';