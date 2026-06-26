-- ============================================
-- Full Balance — v2 Migration (Push + Leaderboard + Referrals)
-- Supabase Dashboard → SQL Editor'da çalıştır
-- ============================================

-- ── Push Notification Subscriptions ──
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subscriptions_own_data" ON push_subscriptions
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id);

-- ── Leaderboard — Haftalık sıralama ──
CREATE TABLE IF NOT EXISTS leaderboard_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'User',
  week_start DATE NOT NULL,
  workouts INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE leaderboard_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leaderboard_read_all" ON leaderboard_scores
  FOR SELECT USING (true);

CREATE POLICY "leaderboard_write_own" ON leaderboard_scores
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "leaderboard_update_own" ON leaderboard_scores
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "leaderboard_delete_own" ON leaderboard_scores
  FOR DELETE USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_leaderboard_week ON leaderboard_scores(week_start, workouts DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON leaderboard_scores(user_id, week_start);

-- ── Referral tracking ──
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referrals_own_data" ON referrals
  FOR ALL USING (referrer_id = auth.uid())
  WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "referrals_complete" ON referrals
  FOR UPDATE USING (referred_id = auth.uid())
  WITH CHECK (referred_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
