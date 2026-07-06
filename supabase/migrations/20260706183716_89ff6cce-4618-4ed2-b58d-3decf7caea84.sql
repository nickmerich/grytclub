
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_event_host(uuid, uuid) TO authenticated;
