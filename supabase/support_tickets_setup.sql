-- Full Balance support inbox.
-- Safe to rerun in Supabase SQL Editor or with Supabase CLI.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON public.support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id, created_at DESC);

REVOKE ALL ON TABLE public.support_tickets FROM anon, authenticated;
GRANT INSERT ON TABLE public.support_tickets TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE public.support_tickets TO authenticated;

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "support_tickets_insert_public" ON public.support_tickets;
DROP POLICY IF EXISTS "support_tickets_select_admin" ON public.support_tickets;
DROP POLICY IF EXISTS "support_tickets_select_access" ON public.support_tickets;
DROP POLICY IF EXISTS "support_tickets_update_admin" ON public.support_tickets;
DROP POLICY IF EXISTS "support_tickets_delete_admin" ON public.support_tickets;

CREATE POLICY "support_tickets_insert_public" ON public.support_tickets
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR (SELECT auth.uid()) = user_id);

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
