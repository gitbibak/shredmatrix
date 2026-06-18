-- ============================================
-- ShredMatrix — Security Hardening Migration
-- Existing Supabase projects can run this after the initial migration.
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_data" ON profiles;
DROP POLICY IF EXISTS "users_own_data" ON plans;
DROP POLICY IF EXISTS "users_own_data" ON workout_logs;
DROP POLICY IF EXISTS "users_own_data" ON progress_entries;
DROP POLICY IF EXISTS "users_own_data" ON measurements;
DROP POLICY IF EXISTS "users_own_data" ON water_logs;
DROP POLICY IF EXISTS "users_own_data" ON sleep_logs;
DROP POLICY IF EXISTS "users_own_data" ON reminders;

DROP POLICY IF EXISTS "profiles_own_data" ON profiles;
DROP POLICY IF EXISTS "plans_own_data" ON plans;
DROP POLICY IF EXISTS "workout_logs_own_data" ON workout_logs;
DROP POLICY IF EXISTS "progress_entries_own_data" ON progress_entries;
DROP POLICY IF EXISTS "measurements_own_data" ON measurements;
DROP POLICY IF EXISTS "water_logs_own_data" ON water_logs;
DROP POLICY IF EXISTS "sleep_logs_own_data" ON sleep_logs;
DROP POLICY IF EXISTS "reminders_own_data" ON reminders;

CREATE POLICY "profiles_own_data" ON profiles FOR ALL USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "plans_own_data" ON plans FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "workout_logs_own_data" ON workout_logs FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "progress_entries_own_data" ON progress_entries FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "measurements_own_data" ON measurements FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "water_logs_own_data" ON water_logs FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "sleep_logs_own_data" ON sleep_logs FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "reminders_own_data" ON reminders FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

UPDATE storage.buckets SET public = false WHERE id = 'user-photos';

DROP POLICY IF EXISTS "users_own_photos" ON storage.objects;
CREATE POLICY "users_own_photos" ON storage.objects FOR ALL
  USING (bucket_id = 'user-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'user-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE OR REPLACE FUNCTION public.delete_current_user()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

REVOKE ALL ON FUNCTION public.delete_current_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_current_user() TO authenticated;
