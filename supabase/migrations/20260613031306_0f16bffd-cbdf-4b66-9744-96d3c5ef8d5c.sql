CREATE OR REPLACE FUNCTION public.is_valid_email(email text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
$$;

REVOKE ALL ON FUNCTION public.is_valid_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_valid_email(text) TO anon;
GRANT EXECUTE ON FUNCTION public.is_valid_email(text) TO authenticated;