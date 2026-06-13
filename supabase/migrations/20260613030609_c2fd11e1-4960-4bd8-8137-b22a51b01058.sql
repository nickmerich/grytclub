CREATE OR REPLACE FUNCTION public.emails_opted_out_of_reminders(_emails text[])
RETURNS TABLE(email text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(u.email)
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
  WHERE p.email_reminders_enabled = false
    AND lower(u.email) = ANY (SELECT lower(unnest(_emails)));
$$;

REVOKE ALL ON FUNCTION public.emails_opted_out_of_reminders(text[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emails_opted_out_of_reminders(text[]) TO service_role;