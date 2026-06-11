
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  location_name TEXT NOT NULL,
  location_address TEXT,
  distance_mi NUMERIC(4,1),
  pace_label TEXT,
  host_name TEXT,
  capacity INTEGER,
  description TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX events_upcoming_idx ON public.events (event_date, start_time) WHERE published = true;

GRANT SELECT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published events"
  ON public.events FOR SELECT
  USING (published = true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the next 4 Saturdays from 2026-06-13
INSERT INTO public.events (slug, title, event_date, start_time, location_name, location_address, distance_mi, pace_label, host_name, description) VALUES
  ('saturday-2026-06-13', 'Saturday Run — Montour/Peters Trail', '2026-06-13', '07:00', 'Peters Lake Park Trailhead', '212 Valley Brook Rd, McMurray, PA', 4.0, 'All paces (8:00–12:00/mi)', 'GRYT Crew', 'Weekly Saturday run. Out-and-back on the Montour/Peters Trail. Coffee after.'),
  ('saturday-2026-06-20', 'Saturday Run — Montour/Peters Trail', '2026-06-20', '07:00', 'Peters Lake Park Trailhead', '212 Valley Brook Rd, McMurray, PA', 4.0, 'All paces (8:00–12:00/mi)', 'GRYT Crew', 'Weekly Saturday run. Out-and-back on the Montour/Peters Trail. Coffee after.'),
  ('saturday-2026-06-27', 'Saturday Run — Montour/Peters Trail', '2026-06-27', '07:00', 'Peters Lake Park Trailhead', '212 Valley Brook Rd, McMurray, PA', 4.0, 'All paces (8:00–12:00/mi)', 'GRYT Crew', 'Weekly Saturday run. Out-and-back on the Montour/Peters Trail. Coffee after.'),
  ('saturday-2026-07-04', 'First Saturday — July Edition', '2026-07-04', '07:00', 'Peters Lake Park Trailhead', '212 Valley Brook Rd, McMurray, PA', 4.0, 'All paces (8:00–12:00/mi)', 'GRYT Crew', 'First Saturday of the month — extra welcoming for new runners. Coffee after.');
