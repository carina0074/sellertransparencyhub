CREATE TABLE public.newsletter_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.newsletter_subscriptions TO anon;
GRANT ALL ON public.newsletter_subscriptions TO service_role;

ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to subscribe" ON public.newsletter_subscriptions FOR INSERT TO anon WITH CHECK (true);