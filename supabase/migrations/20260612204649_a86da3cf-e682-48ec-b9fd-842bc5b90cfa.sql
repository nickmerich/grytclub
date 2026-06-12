
-- challenge_invites
CREATE TABLE public.challenge_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  inviter_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.challenge_invites TO authenticated;
GRANT ALL ON public.challenge_invites TO service_role;
ALTER TABLE public.challenge_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inviters read own invites" ON public.challenge_invites
  FOR SELECT TO authenticated USING (auth.uid() = inviter_id);
CREATE POLICY "Auth users create own invites" ON public.challenge_invites
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = inviter_id);

-- challenge_invite_acceptances
CREATE TABLE public.challenge_invite_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id uuid NOT NULL REFERENCES public.challenge_invites(id) ON DELETE CASCADE,
  invitee_id uuid NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (invite_id, invitee_id)
);
GRANT SELECT ON public.challenge_invite_acceptances TO authenticated;
GRANT ALL ON public.challenge_invite_acceptances TO service_role;
ALTER TABLE public.challenge_invite_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invitee reads own acceptances" ON public.challenge_invite_acceptances
  FOR SELECT TO authenticated USING (auth.uid() = invitee_id);
CREATE POLICY "Inviter reads acceptances of own invites" ON public.challenge_invite_acceptances
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.challenge_invites ci
      WHERE ci.id = invite_id AND ci.inviter_id = auth.uid()
    )
  );

-- Public preview RPC: returns minimal challenge + inviter display info
CREATE OR REPLACE FUNCTION public.get_invite_preview(_token text)
RETURNS TABLE (
  invite_id uuid,
  challenge_id uuid,
  challenge_slug text,
  challenge_title text,
  challenge_tagline text,
  challenge_theme text,
  challenge_accent text,
  step_count bigint,
  participant_count bigint,
  inviter_display_name text,
  inviter_avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ci.id,
    c.id,
    c.slug,
    c.title,
    c.tagline,
    c.theme,
    c.accent_color,
    (SELECT count(*) FROM public.challenge_steps s WHERE s.challenge_id = c.id),
    (SELECT count(*) FROM public.challenge_participants p WHERE p.challenge_id = c.id),
    p.display_name,
    p.avatar_url
  FROM public.challenge_invites ci
  JOIN public.challenges c ON c.id = ci.challenge_id AND c.published = true
  LEFT JOIN public.profiles p ON p.id = ci.inviter_id
  WHERE ci.token = _token
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_invite_preview(text) TO anon, authenticated;

-- Accept RPC: joins challenge + records acceptance. Auth required.
CREATE OR REPLACE FUNCTION public.accept_invite(_token text)
RETURNS TABLE (challenge_slug text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _invite record;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'auth required';
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
  VALUES (_invite.challenge_id, _uid)
  ON CONFLICT DO NOTHING;

  IF _uid <> _invite.inviter_id THEN
    INSERT INTO public.challenge_invite_acceptances (invite_id, invitee_id)
    VALUES (_invite.id, _uid)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN QUERY SELECT _invite.slug;
END;
$$;
GRANT EXECUTE ON FUNCTION public.accept_invite(text) TO authenticated;
