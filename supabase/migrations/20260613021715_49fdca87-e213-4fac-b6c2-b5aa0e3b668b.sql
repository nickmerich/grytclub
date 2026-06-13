REVOKE ALL ON FUNCTION public.has_event_host(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_event_host(uuid, uuid) TO service_role;
