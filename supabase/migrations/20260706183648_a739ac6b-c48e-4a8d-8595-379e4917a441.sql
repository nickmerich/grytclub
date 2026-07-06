
-- 1. Tighten event_checkins SELECT policy
DROP POLICY IF EXISTS "Auth users can read checkins for published events" ON public.event_checkins;
CREATE POLICY "Hosts and self can read event checkins"
  ON public.event_checkins
  FOR SELECT
  TO authenticated
  USING (
    public.has_event_host(auth.uid(), event_id)
    OR checked_in_by = auth.uid()
    OR user_id = auth.uid()
  );

-- 2. Tighten welcome_signups INSERT policy with real input validation
DROP POLICY IF EXISTS "Anyone can submit a welcome signup" ON public.welcome_signups;
CREATE POLICY "Anyone can submit a welcome signup"
  ON public.welcome_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(name)) BETWEEN 1 AND 100
    AND length(trim(email)) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (inviter_freeform IS NULL OR length(inviter_freeform) <= 120)
  );

-- 3. Revoke EXECUTE from anon/authenticated on SECURITY DEFINER functions
--    that are only meant to be invoked from server code (service_role).
--    has_event_host is intentionally left executable to authenticated
--    because it is referenced in RLS policy expressions.
REVOKE EXECUTE ON FUNCTION public.get_invite_preview(text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.accept_invite(text, uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_recent_activity(integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.emails_opted_out_of_reminders(text[]) FROM anon, authenticated, PUBLIC;
