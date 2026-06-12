-- 1. CHALLENGES
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  tagline text,
  description text,
  theme text NOT NULL DEFAULT 'base',
  accent_color text NOT NULL DEFAULT '#38bdf8',
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  target_label text,
  target_value numeric,
  unit text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.challenges TO authenticated;
GRANT SELECT ON public.challenges TO anon;
GRANT ALL ON public.challenges TO service_role;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published challenges"
  ON public.challenges FOR SELECT
  USING (published = true);

CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. CHALLENGE STEPS
CREATE TABLE public.challenge_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  ordinal integer NOT NULL,
  title text NOT NULL,
  description text,
  target_value numeric,
  unit text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, ordinal)
);

GRANT SELECT ON public.challenge_steps TO authenticated;
GRANT SELECT ON public.challenge_steps TO anon;
GRANT ALL ON public.challenge_steps TO service_role;
ALTER TABLE public.challenge_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view steps for published challenges"
  ON public.challenge_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.challenges c
    WHERE c.id = challenge_steps.challenge_id AND c.published = true
  ));

-- 3. PARTICIPANTS
CREATE TABLE public.challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_id)
);

GRANT SELECT, INSERT, DELETE ON public.challenge_participants TO authenticated;
GRANT ALL ON public.challenge_participants TO service_role;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view any participation"
  ON public.challenge_participants FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Members can join a challenge as themselves"
  ON public.challenge_participants FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can leave their own challenge"
  ON public.challenge_participants FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- 4. STEP COMPLETIONS
CREATE TABLE public.challenge_step_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_id uuid NOT NULL REFERENCES public.challenge_steps(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  value numeric,
  UNIQUE (user_id, step_id)
);

GRANT SELECT, INSERT, DELETE ON public.challenge_step_completions TO authenticated;
GRANT ALL ON public.challenge_step_completions TO service_role;
ALTER TABLE public.challenge_step_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view any step completion"
  ON public.challenge_step_completions FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Members can mark their own steps complete"
  ON public.challenge_step_completions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can un-mark their own steps"
  ON public.challenge_step_completions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- 5. PROFILES ADDITIONS
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS best_5k_seconds integer,
  ADD COLUMN IF NOT EXISTS best_10k_seconds integer,
  ADD COLUMN IF NOT EXISTS best_half_seconds integer,
  ADD COLUMN IF NOT EXISTS best_marathon_seconds integer,
  ADD COLUMN IF NOT EXISTS athlete_alignment text;

-- 6. SEED CONTENT
INSERT INTO public.challenges (slug, title, tagline, description, theme, accent_color, starts_on, ends_on, target_label, target_value, unit)
VALUES
  ('june-base-builder','June Base Builder','Stack consistent easy miles before summer racing.','Four weeks of easy aerobic running. The goal is not speed — it is showing up. Build the base now, race off it later.','base','#38bdf8','2026-06-01','2026-06-30','Total easy miles',60,'mi'),
  ('saturday-streak','Saturday Streak','Show up for four Saturdays in a row.','The simplest challenge in the club. RSVP, show up, run, stay for coffee. Four weeks straight unlocks the streak badge.','streak','#f97316','2026-06-06','2026-06-27','Saturday runs',4,'runs'),
  ('hill-repeats','Hill Repeats','Get strong with one hill session per week.','One short, hard hill session weekly for a month. Pick the same hill if you can — progress is easier to see when the climb stays constant.','strength','#a3e635','2026-06-02','2026-06-30','Hill sessions',4,'sessions')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.challenge_steps (challenge_id, ordinal, title, description, target_value, unit)
SELECT c.id, s.ordinal, s.title, s.description, s.target_value, 'mi'
FROM public.challenges c
CROSS JOIN (VALUES
  (1, 'Week 1: 12 easy miles', 'Spread across 3+ runs. Conversational pace only.', 12::numeric),
  (2, 'Week 2: 14 easy miles', 'Add one slightly longer run on the weekend.', 14::numeric),
  (3, 'Week 3: 16 easy miles', 'Mid-week double if you feel good.', 16::numeric),
  (4, 'Week 4: 18 easy miles', 'Long run 6+ miles. Still easy.', 18::numeric)
) AS s(ordinal, title, description, target_value)
WHERE c.slug = 'june-base-builder'
ON CONFLICT (challenge_id, ordinal) DO NOTHING;

INSERT INTO public.challenge_steps (challenge_id, ordinal, title, description, target_value, unit)
SELECT c.id, s.ordinal, s.title, s.description, 1::numeric, 'run'
FROM public.challenges c
CROSS JOIN (VALUES
  (1, 'Saturday 1', 'Show up at 7am. Any pace.'),
  (2, 'Saturday 2', 'Back-to-back. Easy effort.'),
  (3, 'Saturday 3', 'Stay for coffee.'),
  (4, 'Saturday 4', 'Lock the streak. Post your recap.')
) AS s(ordinal, title, description)
WHERE c.slug = 'saturday-streak'
ON CONFLICT (challenge_id, ordinal) DO NOTHING;

INSERT INTO public.challenge_steps (challenge_id, ordinal, title, description, target_value, unit)
SELECT c.id, s.ordinal, s.title, s.description, s.target_value, 'reps'
FROM public.challenges c
CROSS JOIN (VALUES
  (1, 'Session 1: 4 x 60s uphill', 'Hard up, easy jog down. Full recovery.', 4::numeric),
  (2, 'Session 2: 5 x 60s uphill', 'Same hill if possible.', 5::numeric),
  (3, 'Session 3: 6 x 60s uphill', 'Form first, then effort.', 6::numeric),
  (4, 'Session 4: 8 x 60s uphill', 'Final session. Should feel hard.', 8::numeric)
) AS s(ordinal, title, description, target_value)
WHERE c.slug = 'hill-repeats'
ON CONFLICT (challenge_id, ordinal) DO NOTHING;