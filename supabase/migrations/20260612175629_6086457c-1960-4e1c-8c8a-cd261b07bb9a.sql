-- Tighten profiles: only authenticated members (or the owner) can read public profiles.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated members can view public profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = id);

-- Explicit deny: rsvps cannot be read by anon/authenticated. Only service_role (which bypasses RLS) may read.
DROP POLICY IF EXISTS "Deny client reads on rsvps" ON public.rsvps;
CREATE POLICY "Deny client reads on rsvps"
  ON public.rsvps
  FOR SELECT
  TO anon, authenticated
  USING (false);

-- Explicit deny: cta_clicks cannot be read by anon/authenticated. Only service_role may read.
DROP POLICY IF EXISTS "Deny client reads on cta_clicks" ON public.cta_clicks;
CREATE POLICY "Deny client reads on cta_clicks"
  ON public.cta_clicks
  FOR SELECT
  TO anon, authenticated
  USING (false);
