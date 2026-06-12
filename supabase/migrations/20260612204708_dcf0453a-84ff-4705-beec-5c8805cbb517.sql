
REVOKE EXECUTE ON FUNCTION public.get_invite_preview(text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.accept_invite(text) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invite_preview(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.accept_invite(text) TO service_role;
