-- Retire the removed PT connection feature without deleting historical data.
REVOKE ALL ON public.trainer_clients FROM anon, authenticated;
REVOKE ALL ON public.trainer_invites FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.connect_trainer_by_code(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_trainer_invite() FROM PUBLIC, anon, authenticated;

-- Trigger functions do not need to be callable through the Data API.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Keep privileged role checks outside the exposed Data API schema.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, auth, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated, service_role;

-- Users may update profile content, but never their authorization role or identity.
REVOKE UPDATE ON public.profiles FROM authenticated;
REVOKE INSERT, DELETE ON public.profiles FROM authenticated;
GRANT UPDATE (name, onboarding_data, current_phase, plan_created_at, avatar_url)
  ON public.profiles TO authenticated;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));

DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS profiles_own_data ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_access ON public.profiles;
CREATE POLICY profiles_select_access ON public.profiles FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id OR (SELECT private.is_admin()));
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Admin can view all plans" ON public.plans;
DROP POLICY IF EXISTS "Admin can delete plans" ON public.plans;
DROP POLICY IF EXISTS plans_own_data ON public.plans;
CREATE POLICY plans_select_access ON public.plans FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR (SELECT private.is_admin()));
CREATE POLICY plans_insert_own ON public.plans FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY plans_update_own ON public.plans FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY plans_delete_access ON public.plans FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id OR (SELECT private.is_admin()));

DROP POLICY IF EXISTS support_tickets_select_access ON public.support_tickets;
DROP POLICY IF EXISTS support_tickets_update_admin ON public.support_tickets;
DROP POLICY IF EXISTS support_tickets_delete_admin ON public.support_tickets;
CREATE POLICY support_tickets_select_access ON public.support_tickets FOR SELECT TO authenticated
  USING ((SELECT private.is_admin()) OR (SELECT auth.uid()) = user_id);
CREATE POLICY support_tickets_update_admin ON public.support_tickets FOR UPDATE TO authenticated
  USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY support_tickets_delete_admin ON public.support_tickets FOR DELETE TO authenticated
  USING ((SELECT private.is_admin()));

DROP POLICY IF EXISTS referrals_referrer_own ON public.referrals;
DROP POLICY IF EXISTS referrals_referred_update ON public.referrals;
CREATE POLICY referrals_select_linked ON public.referrals FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = referrer_id OR (SELECT auth.uid()) = referred_id);
CREATE POLICY referrals_insert_own ON public.referrals FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = referrer_id);
CREATE POLICY referrals_update_linked ON public.referrals FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = referrer_id OR (SELECT auth.uid()) = referred_id)
  WITH CHECK ((SELECT auth.uid()) = referrer_id OR (SELECT auth.uid()) = referred_id);
CREATE POLICY referrals_delete_own ON public.referrals FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = referrer_id);

CREATE INDEX IF NOT EXISTS idx_referrals_referred_id
  ON public.referrals(referred_id)
  WHERE referred_id IS NOT NULL;
