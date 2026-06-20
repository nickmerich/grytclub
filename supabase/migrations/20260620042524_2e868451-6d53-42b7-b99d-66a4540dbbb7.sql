GRANT INSERT ON public.welcome_signups TO anon, authenticated;

CREATE POLICY "Anyone can submit a welcome signup"
ON public.welcome_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);