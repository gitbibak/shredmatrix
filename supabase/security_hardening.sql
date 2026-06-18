-- ============================================
-- ShredMatrix — Security Hardening SQL
-- Run AFTER migration.sql in: Supabase Dashboard → SQL Editor
--
-- What this does:
--   1. Drops old permissive RLS policies, recreates with WITH CHECK
--   2. Makes user-photos bucket PRIVATE
--   3. Adds storage policy with WITH CHECK for insert
--   4. Creates delete_current_user RPC for full account deletion
-- ============================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. DROP old RLS policies (they lack WITH CHECK)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP POLICY IF EXISTS "users_own_data" ON profiles;
DROP POLICY IF EXISTS "users_own_data" ON plans;
DROP POLICY IF EXISTS "users_own_data" ON workout_logs;
DROP POLICY IF EXISTS "users_own_data" ON progress_entries;
DROP POLICY IF EXISTS "users_own_data" ON measurements;
DROP POLICY IF EXISTS "users_own_data" ON water_logs;
DROP POLICY IF EXISTS "users_own_data" ON sleep_logs;
DROP POLICY IF EXISTS "users_own_data" ON reminders;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. Recreate RLS policies WITH CHECK
--    USING  = controls which rows can be READ/UPDATE/DELETE
--    WITH CHECK = controls which rows can be INSERT/UPDATE (data validation)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- profiles: user can only read/modify their own profile
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (id = auth.uid());

-- plans
CREATE POLICY "plans_select" ON plans FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "plans_insert" ON plans FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "plans_update" ON plans FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "plans_delete" ON plans FOR DELETE USING (user_id = auth.uid());

-- workout_logs
CREATE POLICY "workout_logs_select" ON workout_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "workout_logs_insert" ON workout_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "workout_logs_update" ON workout_logs FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "workout_logs_delete" ON workout_logs FOR DELETE USING (user_id = auth.uid());

-- progress_entries
CREATE POLICY "progress_entries_select" ON progress_entries FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "progress_entries_insert" ON progress_entries FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "progress_entries_update" ON progress_entries FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "progress_entries_delete" ON progress_entries FOR DELETE USING (user_id = auth.uid());

-- measurements
CREATE POLICY "measurements_select" ON measurements FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "measurements_insert" ON measurements FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "measurements_update" ON measurements FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "measurements_delete" ON measurements FOR DELETE USING (user_id = auth.uid());

-- water_logs
CREATE POLICY "water_logs_select" ON water_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "water_logs_insert" ON water_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "water_logs_update" ON water_logs FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "water_logs_delete" ON water_logs FOR DELETE USING (user_id = auth.uid());

-- sleep_logs
CREATE POLICY "sleep_logs_select" ON sleep_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "sleep_logs_insert" ON sleep_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "sleep_logs_update" ON sleep_logs FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "sleep_logs_delete" ON sleep_logs FOR DELETE USING (user_id = auth.uid());

-- reminders
CREATE POLICY "reminders_select" ON reminders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "reminders_insert" ON reminders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "reminders_update" ON reminders FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "reminders_delete" ON reminders FOR DELETE USING (user_id = auth.uid());

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. Make user-photos bucket PRIVATE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UPDATE storage.buckets SET public = false WHERE id = 'user-photos';

-- Drop old storage policy and recreate with WITH CHECK
DROP POLICY IF EXISTS "users_own_photos" ON storage.objects;

-- SELECT: users can read their own photos
CREATE POLICY "storage_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- INSERT: users can only upload to their own folder
CREATE POLICY "storage_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: users can only update their own photos
CREATE POLICY "storage_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  ) WITH CHECK (
    bucket_id = 'user-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: users can only delete their own photos
CREATE POLICY "storage_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. RPC: delete_current_user
--    Allows authenticated user to delete their own auth account
--    Called from client after cleaning up all data
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION public.delete_current_user()
RETURNS void AS $$
BEGIN
  -- Delete the calling user from auth.users
  -- CASCADE will clean up profiles and all FK-linked tables
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION public.delete_current_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_current_user() TO authenticated;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Done! Verify:
--   SELECT public FROM storage.buckets WHERE id = 'user-photos';
--   → should return FALSE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
