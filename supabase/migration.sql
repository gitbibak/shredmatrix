-- ============================================
-- Full Balance / ShredMatrix — Idempotent Supabase Schema
-- Run in Supabase Dashboard -> SQL Editor.
-- Safe to rerun: tables, columns, indexes, buckets, triggers and policies are guarded.
-- ============================================

-- Required for gen_random_uuid() on older Postgres setups.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Core Tables ─────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  onboarding_data JSONB,
  current_phase INTEGER DEFAULT 0,
  plan_created_at TIMESTAMPTZ,
  first_login_at TIMESTAMPTZ DEFAULT NOW(),
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  email TEXT,
  acquisition_source TEXT,
  acquisition_medium TEXT,
  acquisition_campaign TEXT,
  acquisition_content TEXT,
  acquisition_term TEXT,
  landing_path TEXT,
  app_language TEXT,
  browser_locale TEXT,
  time_zone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_data JSONB,
  ADD COLUMN IF NOT EXISTS current_phase INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS plan_created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_login_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS acquisition_source TEXT,
  ADD COLUMN IF NOT EXISTS acquisition_medium TEXT,
  ADD COLUMN IF NOT EXISTS acquisition_campaign TEXT,
  ADD COLUMN IF NOT EXISTS acquisition_content TEXT,
  ADD COLUMN IF NOT EXISTS acquisition_term TEXT,
  ADD COLUMN IF NOT EXISTS landing_path TEXT,
  ADD COLUMN IF NOT EXISTS app_language TEXT,
  ADD COLUMN IF NOT EXISTS browser_locale TEXT,
  ADD COLUMN IF NOT EXISTS time_zone TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_focus TEXT,
  exercises JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight REAL,
  body_fat REAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  chest REAL,
  waist REAL,
  hip REAL,
  arm REAL,
  leg REAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  glasses INTEGER DEFAULT 0,
  target_met BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours REAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

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

CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT FALSE,
  hour INTEGER DEFAULT 9,
  last_notified TIMESTAMPTZ,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('tr', 'en', 'es')),
  timezone TEXT NOT NULL DEFAULT 'UTC',
  notification_hour SMALLINT NOT NULL DEFAULT 9 CHECK (notification_hour BETWEEN 7 AND 21),
  last_notified_on DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.leaderboard_scores (
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

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.trainer_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.trainer_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT trainer_clients_not_self CHECK (trainer_id <> client_id),
  CONSTRAINT trainer_clients_unique_pair UNIQUE (trainer_id, client_id)
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT,
  email TEXT,
  category TEXT NOT NULL DEFAULT 'support',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  source TEXT NOT NULL DEFAULT 'contact_form',
  page_url TEXT,
  user_agent TEXT,
  admin_note TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT support_tickets_status_check CHECK (status IN ('open', 'reviewing', 'resolved')),
  CONSTRAINT support_tickets_priority_check CHECK (priority IN ('low', 'normal', 'high')),
  CONSTRAINT support_tickets_category_check CHECK (category IN ('support', 'bug', 'idea', 'account', 'privacy', 'partnership'))
);

-- ── Indexes ─────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_workout_logs_user ON public.workout_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_progress_user ON public.progress_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_water_user ON public.water_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_sleep_user ON public.sleep_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_wellbeing_checkins_user_date ON public.wellbeing_checkins(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_measurements_user ON public.measurements(user_id, date);
CREATE INDEX IF NOT EXISTS idx_push_subs_user ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_week ON public.leaderboard_scores(week_start, workouts DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON public.leaderboard_scores(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_invites_trainer ON public.trainer_invites(trainer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trainer_invites_code ON public.trainer_invites(code);
CREATE INDEX IF NOT EXISTS idx_trainer_clients_trainer ON public.trainer_clients(trainer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trainer_clients_client ON public.trainer_clients(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON public.support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id, created_at DESC);

REVOKE ALL ON TABLE public.support_tickets FROM anon, authenticated;
GRANT INSERT ON TABLE public.support_tickets TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE public.support_tickets TO authenticated;

-- ── RLS ─────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellbeing_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trainer_invites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trainer_clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wellbeing_checkins TO authenticated;

-- Drop legacy and current policies before recreating deterministic policies.
DROP POLICY IF EXISTS "users_own_data" ON public.profiles;
DROP POLICY IF EXISTS "users_own_data" ON public.plans;
DROP POLICY IF EXISTS "users_own_data" ON public.workout_logs;
DROP POLICY IF EXISTS "users_own_data" ON public.progress_entries;
DROP POLICY IF EXISTS "users_own_data" ON public.measurements;
DROP POLICY IF EXISTS "users_own_data" ON public.water_logs;
DROP POLICY IF EXISTS "users_own_data" ON public.sleep_logs;
DROP POLICY IF EXISTS "users_own_data" ON public.wellbeing_checkins;
DROP POLICY IF EXISTS "users_own_data" ON public.reminders;

DROP POLICY IF EXISTS "profiles_own_data" ON public.profiles;
DROP POLICY IF EXISTS "plans_own_data" ON public.plans;
DROP POLICY IF EXISTS "workout_logs_own_data" ON public.workout_logs;
DROP POLICY IF EXISTS "progress_entries_own_data" ON public.progress_entries;
DROP POLICY IF EXISTS "measurements_own_data" ON public.measurements;
DROP POLICY IF EXISTS "water_logs_own_data" ON public.water_logs;
DROP POLICY IF EXISTS "sleep_logs_own_data" ON public.sleep_logs;
DROP POLICY IF EXISTS "wellbeing_checkins_own_data" ON public.wellbeing_checkins;
DROP POLICY IF EXISTS "reminders_own_data" ON public.reminders;
DROP POLICY IF EXISTS "push_subscriptions_own_data" ON public.push_subscriptions;
DROP POLICY IF EXISTS "leaderboard_read_all" ON public.leaderboard_scores;
DROP POLICY IF EXISTS "leaderboard_write_own" ON public.leaderboard_scores;
DROP POLICY IF EXISTS "leaderboard_update_own" ON public.leaderboard_scores;
DROP POLICY IF EXISTS "leaderboard_delete_own" ON public.leaderboard_scores;
DROP POLICY IF EXISTS "referrals_own_data" ON public.referrals;
DROP POLICY IF EXISTS "referrals_complete" ON public.referrals;
DROP POLICY IF EXISTS "referrals_referrer_own" ON public.referrals;
DROP POLICY IF EXISTS "referrals_referred_update" ON public.referrals;
DROP POLICY IF EXISTS "trainer_invites_own_data" ON public.trainer_invites;
DROP POLICY IF EXISTS "trainer_clients_linked_select" ON public.trainer_clients;
DROP POLICY IF EXISTS "trainer_clients_linked_delete" ON public.trainer_clients;
DROP POLICY IF EXISTS "support_tickets_insert_public" ON public.support_tickets;
DROP POLICY IF EXISTS "support_tickets_select_admin" ON public.support_tickets;
DROP POLICY IF EXISTS "support_tickets_select_access" ON public.support_tickets;
DROP POLICY IF EXISTS "support_tickets_update_admin" ON public.support_tickets;
DROP POLICY IF EXISTS "support_tickets_delete_admin" ON public.support_tickets;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
DROP POLICY IF EXISTS "plans_select" ON public.plans;
DROP POLICY IF EXISTS "plans_insert" ON public.plans;
DROP POLICY IF EXISTS "plans_update" ON public.plans;
DROP POLICY IF EXISTS "plans_delete" ON public.plans;
DROP POLICY IF EXISTS "workout_logs_select" ON public.workout_logs;
DROP POLICY IF EXISTS "workout_logs_insert" ON public.workout_logs;
DROP POLICY IF EXISTS "workout_logs_update" ON public.workout_logs;
DROP POLICY IF EXISTS "workout_logs_delete" ON public.workout_logs;
DROP POLICY IF EXISTS "progress_entries_select" ON public.progress_entries;
DROP POLICY IF EXISTS "progress_entries_insert" ON public.progress_entries;
DROP POLICY IF EXISTS "progress_entries_update" ON public.progress_entries;
DROP POLICY IF EXISTS "progress_entries_delete" ON public.progress_entries;
DROP POLICY IF EXISTS "measurements_select" ON public.measurements;
DROP POLICY IF EXISTS "measurements_insert" ON public.measurements;
DROP POLICY IF EXISTS "measurements_update" ON public.measurements;
DROP POLICY IF EXISTS "measurements_delete" ON public.measurements;
DROP POLICY IF EXISTS "water_logs_select" ON public.water_logs;
DROP POLICY IF EXISTS "water_logs_insert" ON public.water_logs;
DROP POLICY IF EXISTS "water_logs_update" ON public.water_logs;
DROP POLICY IF EXISTS "water_logs_delete" ON public.water_logs;
DROP POLICY IF EXISTS "sleep_logs_select" ON public.sleep_logs;
DROP POLICY IF EXISTS "sleep_logs_insert" ON public.sleep_logs;
DROP POLICY IF EXISTS "sleep_logs_update" ON public.sleep_logs;
DROP POLICY IF EXISTS "sleep_logs_delete" ON public.sleep_logs;
DROP POLICY IF EXISTS "reminders_select" ON public.reminders;
DROP POLICY IF EXISTS "reminders_insert" ON public.reminders;
DROP POLICY IF EXISTS "reminders_update" ON public.reminders;
DROP POLICY IF EXISTS "reminders_delete" ON public.reminders;

CREATE POLICY "profiles_own_data" ON public.profiles
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "plans_own_data" ON public.plans
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "workout_logs_own_data" ON public.workout_logs
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "progress_entries_own_data" ON public.progress_entries
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "measurements_own_data" ON public.measurements
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "water_logs_own_data" ON public.water_logs
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "sleep_logs_own_data" ON public.sleep_logs
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "wellbeing_checkins_own_data" ON public.wellbeing_checkins
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "reminders_own_data" ON public.reminders
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "push_subscriptions_own_data" ON public.push_subscriptions
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "leaderboard_read_all" ON public.leaderboard_scores
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "leaderboard_write_own" ON public.leaderboard_scores
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "leaderboard_update_own" ON public.leaderboard_scores
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "leaderboard_delete_own" ON public.leaderboard_scores
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "referrals_referrer_own" ON public.referrals
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = referrer_id)
  WITH CHECK ((SELECT auth.uid()) = referrer_id);

CREATE POLICY "referrals_referred_update" ON public.referrals
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = referred_id)
  WITH CHECK ((SELECT auth.uid()) = referred_id);

CREATE POLICY "trainer_invites_own_data" ON public.trainer_invites
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = trainer_id)
  WITH CHECK ((SELECT auth.uid()) = trainer_id);

CREATE POLICY "trainer_clients_linked_select" ON public.trainer_clients
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = trainer_id OR (SELECT auth.uid()) = client_id);

CREATE POLICY "trainer_clients_linked_delete" ON public.trainer_clients
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = trainer_id OR (SELECT auth.uid()) = client_id);

CREATE POLICY "support_tickets_insert_public" ON public.support_tickets
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR (SELECT auth.uid()) = user_id);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_user_id UUID := (SELECT auth.uid());
BEGIN
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = current_user_id
      AND role = 'admin'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.create_trainer_invite()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
  SET search_path = public, auth, pg_catalog
AS $$
DECLARE
  current_user_id UUID := (SELECT auth.uid());
  invite_code TEXT;
  invite_expires_at TIMESTAMPTZ := NOW() + INTERVAL '14 days';
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.trainer_invites
  SET active = false
  WHERE trainer_id = current_user_id
    AND active = true;

  LOOP
    invite_code := 'PT-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', '') FROM 1 FOR 8));

    BEGIN
      INSERT INTO public.trainer_invites (trainer_id, code, expires_at)
      VALUES (current_user_id, invite_code, invite_expires_at);
      EXIT;
    EXCEPTION
      WHEN unique_violation THEN
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'code', invite_code,
    'expires_at', invite_expires_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_trainer_invite() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_trainer_invite() FROM anon;
GRANT EXECUTE ON FUNCTION public.create_trainer_invite() TO authenticated;

CREATE OR REPLACE FUNCTION public.connect_trainer_by_code(invite_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
DECLARE
  current_user_id UUID := (SELECT auth.uid());
  normalized_code TEXT := UPPER(TRIM(invite_code));
  invite_row public.trainer_invites%ROWTYPE;
  trainer_name TEXT;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT *
  INTO invite_row
  FROM public.trainer_invites
  WHERE code = normalized_code
    AND active = true
    AND expires_at > NOW()
  LIMIT 1;

  IF invite_row.id IS NULL THEN
    RAISE EXCEPTION 'Trainer invite code is invalid or expired';
  END IF;

  IF invite_row.trainer_id = current_user_id THEN
    RAISE EXCEPTION 'A trainer cannot connect to their own invite code';
  END IF;

  INSERT INTO public.trainer_clients (trainer_id, client_id, status)
  VALUES (invite_row.trainer_id, current_user_id, 'active')
  ON CONFLICT (trainer_id, client_id)
  DO UPDATE SET status = 'active';

  SELECT name
  INTO trainer_name
  FROM public.profiles
  WHERE id = invite_row.trainer_id;

  RETURN jsonb_build_object(
    'trainer_id', invite_row.trainer_id,
    'trainer_name', COALESCE(trainer_name, 'Trainer')
  );
END;
$$;

REVOKE ALL ON FUNCTION public.connect_trainer_by_code(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.connect_trainer_by_code(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.connect_trainer_by_code(TEXT) TO authenticated;

-- Admin read/delete policies are used by the admin panel. The is_admin()
-- function is locked down and returns false for unauthenticated calls.
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all plans" ON public.plans;
DROP POLICY IF EXISTS "Admin can delete plans" ON public.plans;
DROP POLICY IF EXISTS "Admin can view support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admin can update support tickets" ON public.support_tickets;

CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_admin() OR (SELECT auth.uid()) = id);

CREATE POLICY "Admin can delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin can view all plans" ON public.plans
  FOR SELECT TO authenticated
  USING (public.is_admin() OR (SELECT auth.uid()) = user_id);

CREATE POLICY "Admin can delete plans" ON public.plans
  FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE POLICY "support_tickets_select_access" ON public.support_tickets
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id)
  );

CREATE POLICY "support_tickets_update_admin" ON public.support_tickets
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "support_tickets_delete_admin" ON public.support_tickets
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ── Storage ─────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('user-photos', 'user-photos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "users_own_photos" ON storage.objects;
DROP POLICY IF EXISTS "storage_select_own" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_own" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_own" ON storage.objects;

CREATE POLICY "storage_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'user-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "storage_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'user-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "storage_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'user-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'user-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "storage_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'user-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- ── Auth Profile Trigger ────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, name, email, role, acquisition_source, acquisition_medium,
    acquisition_campaign, acquisition_content, acquisition_term,
    landing_path, app_language, browser_locale, time_zone
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    'user',
    LEFT(NEW.raw_user_meta_data->>'acquisition_source', 80),
    LEFT(NEW.raw_user_meta_data->>'acquisition_medium', 80),
    LEFT(NEW.raw_user_meta_data->>'acquisition_campaign', 120),
    LEFT(NEW.raw_user_meta_data->>'acquisition_content', 120),
    LEFT(NEW.raw_user_meta_data->>'acquisition_term', 120),
    LEFT(NEW.raw_user_meta_data->>'landing_path', 160),
    CASE WHEN NEW.raw_user_meta_data->>'app_language' IN ('tr', 'en', 'es')
      THEN NEW.raw_user_meta_data->>'app_language' ELSE NULL END,
    LEFT(NEW.raw_user_meta_data->>'browser_locale', 20),
    LEFT(NEW.raw_user_meta_data->>'time_zone', 60)
  )
  ON CONFLICT (id) DO UPDATE
    SET email = COALESCE(public.profiles.email, EXCLUDED.email),
        name = COALESCE(public.profiles.name, EXCLUDED.name),
        acquisition_source = COALESCE(public.profiles.acquisition_source, EXCLUDED.acquisition_source),
        acquisition_medium = COALESCE(public.profiles.acquisition_medium, EXCLUDED.acquisition_medium),
        acquisition_campaign = COALESCE(public.profiles.acquisition_campaign, EXCLUDED.acquisition_campaign),
        acquisition_content = COALESCE(public.profiles.acquisition_content, EXCLUDED.acquisition_content),
        acquisition_term = COALESCE(public.profiles.acquisition_term, EXCLUDED.acquisition_term),
        landing_path = COALESCE(public.profiles.landing_path, EXCLUDED.landing_path),
        app_language = COALESCE(public.profiles.app_language, EXCLUDED.app_language),
        browser_locale = COALESCE(public.profiles.browser_locale, EXCLUDED.browser_locale),
        time_zone = COALESCE(public.profiles.time_zone, EXCLUDED.time_zone);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- ── Account Deletion RPC ────────────────────

CREATE OR REPLACE FUNCTION public.delete_current_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_user_id UUID := (SELECT auth.uid());
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_current_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_current_user() FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_current_user() TO authenticated;
