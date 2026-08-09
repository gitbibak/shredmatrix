CREATE TABLE IF NOT EXISTS public.wellbeing_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  energy SMALLINT NOT NULL CHECK (energy BETWEEN 1 AND 3),
  nutrition_aligned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_wellbeing_checkins_user_date
  ON public.wellbeing_checkins(user_id, date DESC);

ALTER TABLE public.wellbeing_checkins ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wellbeing_checkins TO authenticated;

DROP POLICY IF EXISTS "wellbeing_checkins_own_data" ON public.wellbeing_checkins;
CREATE POLICY "wellbeing_checkins_own_data" ON public.wellbeing_checkins
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
