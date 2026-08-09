DROP POLICY IF EXISTS "support_tickets_select_admin" ON public.support_tickets;
DROP POLICY IF EXISTS "support_tickets_select_access" ON public.support_tickets;

CREATE POLICY "support_tickets_select_access" ON public.support_tickets
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id)
  );
