-- Streak freezes: a member can protect a broken streak once a week, plus one
-- extra time for every friend who joined through their invite and created a
-- plan. Only the member can read or write their own freezes.

CREATE TABLE IF NOT EXISTS public.streak_freezes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  source TEXT NOT NULL DEFAULT 'weekly' CHECK (source IN ('weekly', 'referral')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_streak_freezes_user_date
  ON public.streak_freezes(user_id, date DESC);

ALTER TABLE public.streak_freezes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON public.streak_freezes TO authenticated;

DROP POLICY IF EXISTS "streak_freezes_own_data" ON public.streak_freezes;
CREATE POLICY "streak_freezes_own_data" ON public.streak_freezes
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
