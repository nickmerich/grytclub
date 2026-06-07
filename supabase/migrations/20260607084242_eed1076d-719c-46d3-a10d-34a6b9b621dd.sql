CREATE TABLE public.cta_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cta text NOT NULL,
  href text,
  path text,
  referrer text,
  user_agent text,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.cta_clicks TO anon, authenticated;
GRANT ALL ON public.cta_clicks TO service_role;
ALTER TABLE public.cta_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log a CTA click"
  ON public.cta_clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(cta) BETWEEN 1 AND 64
    AND (href IS NULL OR length(href) <= 500)
    AND (path IS NULL OR length(path) <= 500)
    AND (referrer IS NULL OR length(referrer) <= 500)
    AND (user_agent IS NULL OR length(user_agent) <= 500)
    AND (session_id IS NULL OR length(session_id) <= 64)
  );
CREATE INDEX cta_clicks_cta_created_at_idx ON public.cta_clicks (cta, created_at DESC);