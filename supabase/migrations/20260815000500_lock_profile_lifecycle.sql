-- Profiles are created by the auth trigger and accounts are deleted by guarded
-- Edge Functions. Client-side profile row creation/deletion is never required.
REVOKE INSERT, DELETE ON public.profiles FROM authenticated;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_access ON public.profiles;
