CREATE OR REPLACE FUNCTION public.is_valid_email(email text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
$$;

DROP POLICY IF EXISTS "Allow anyone to subscribe" ON public.newsletter_subscriptions;

CREATE POLICY "Allow anyone to subscribe with valid email" ON public.newsletter_subscriptions FOR INSERT TO anon WITH CHECK (public.is_valid_email(email));