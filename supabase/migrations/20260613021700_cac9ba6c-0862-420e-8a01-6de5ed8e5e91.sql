-- 1) Add host_user_id to events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS host_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS events_host_user_id_idx ON public.events(host_user_id);

-- 2) event_checkins table
CREATE TABLE IF NOT EXISTS public.event_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  walkup_name text,
  checked_in_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  checked_in_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_checkins_member_or_walkup_chk
    CHECK ((user_id IS NOT NULL AND walkup_name IS NULL)
        OR (user_id IS NULL AND walkup_name IS NOT NULL AND length(trim(walkup_name)) > 0))
);

CREATE UNIQUE INDEX IF NOT EXISTS event_checkins_event_user_uniq
  ON public.event_checkins(event_id, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS event_checkins_event_walkup_uniq
  ON public.event_checkins(event_id, lower(walkup_name)) WHERE walkup_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS event_checkins_user_idx ON public.event_checkins(user_id);
CREATE INDEX IF NOT EXISTS event_checkins_event_idx ON public.event_checkins(event_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_checkins TO authenticated;
GRANT ALL ON public.event_checkins TO service_role;

ALTER TABLE public.event_checkins ENABLE ROW LEVEL SECURITY;

-- 3) Host helper
CREATE OR REPLACE FUNCTION public.has_event_host(_user_id uuid, _event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = _event_id
      AND e.host_user_id IS NOT NULL
      AND e.host_user_id = _user_id
  );
$$;

-- 4) Policies
CREATE POLICY "Auth users can read checkins for published events"
ON public.event_checkins FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.published = true)
);

CREATE POLICY "Hosts can insert checkins for their event"
ON public.event_checkins FOR INSERT TO authenticated
WITH CHECK (
  public.has_event_host(auth.uid(), event_id) AND checked_in_by = auth.uid()
);

CREATE POLICY "Hosts can update their event checkins"
ON public.event_checkins FOR UPDATE TO authenticated
USING (public.has_event_host(auth.uid(), event_id))
WITH CHECK (public.has_event_host(auth.uid(), event_id));

CREATE POLICY "Hosts can delete their event checkins"
ON public.event_checkins FOR DELETE TO authenticated
USING (public.has_event_host(auth.uid(), event_id));
