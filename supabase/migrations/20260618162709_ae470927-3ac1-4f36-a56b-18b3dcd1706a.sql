CREATE TABLE public.welcome_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  inviter_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  inviter_freeform text,
  source text NOT NULL DEFAULT 'qr-welcome',
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX welcome_signups_inviter_idx ON public.welcome_signups (inviter_user_id);
CREATE INDEX welcome_signups_email_idx ON public.welcome_signups (lower(email));
CREATE INDEX welcome_signups_created_idx ON public.welcome_signups (created_at DESC);

GRANT SELECT ON public.welcome_signups TO authenticated;
GRANT ALL ON public.welcome_signups TO service_role;

ALTER TABLE public.welcome_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inviter can see their attributions"
  ON public.welcome_signups
  FOR SELECT
  TO authenticated
  USING (auth.uid() = inviter_user_id);