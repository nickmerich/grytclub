
DROP FUNCTION IF EXISTS public.accept_invite(text);

CREATE OR REPLACE FUNCTION public.accept_invite(_token text, _user_id uuid)
RETURNS TABLE (challenge_slug text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invite record;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'user required';
  END IF;

  SELECT ci.id, ci.challenge_id, ci.inviter_id, c.slug
  INTO _invite
  FROM public.challenge_invites ci
  JOIN public.challenges c ON c.id = ci.challenge_id AND c.published = true
  WHERE ci.token = _token;

  IF _invite IS NULL THEN
    RAISE EXCEPTION 'invite not found';
  END IF;

  INSERT INTO public.challenge_participants (challenge_id, user_id)
  VALUES (_invite.challenge_id, _user_id)
  ON CONFLICT DO NOTHING;

  IF _user_id <> _invite.inviter_id THEN
    INSERT INTO public.challenge_invite_acceptances (invite_id, invitee_id)
    VALUES (_invite.id, _user_id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN QUERY SELECT _invite.slug;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.accept_invite(text, uuid) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_invite(text, uuid) TO service_role;
