import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

const migrationSql = readFileSync(
  join(cwd(), 'supabase/migration.sql'),
  'utf8',
);

describe('supabase migration.sql', () => {
  it('uses rerunnable DDL guards for core schema objects', () => {
    expect(migrationSql).toContain('CREATE TABLE IF NOT EXISTS public.profiles');
    expect(migrationSql).toContain('CREATE INDEX IF NOT EXISTS idx_workout_logs_user');
    expect(migrationSql).toContain('ON CONFLICT (id) DO UPDATE SET public = false');
    expect(migrationSql).toContain('DROP POLICY IF EXISTS');
  });

  it('keeps public tables protected by RLS and authenticated ownership policies', () => {
    const tables = [
      'profiles',
      'plans',
      'workout_logs',
      'progress_entries',
      'measurements',
      'water_logs',
      'sleep_logs',
      'reminders',
      'push_subscriptions',
      'leaderboard_scores',
      'referrals',
      'trainer_invites',
      'trainer_clients',
      'support_tickets',
    ];

    for (const table of tables) {
      expect(migrationSql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`);
    }

    expect(migrationSql).toContain('FOR ALL TO authenticated');
    expect(migrationSql).toContain('WITH CHECK ((SELECT auth.uid()) = user_id)');
    expect(migrationSql).not.toContain('auth.role()');
  });

  it('keeps storage private and scoped to the authenticated user folder', () => {
    expect(migrationSql).toContain("VALUES ('user-photos', 'user-photos', false)");
    expect(migrationSql).toContain("bucket_id = 'user-photos'");
    expect(migrationSql).toContain("(storage.foldername(name))[1] = (SELECT auth.uid())::text");
  });

  it('guards privileged RPCs from public execution', () => {
    expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.is_admin()');
    expect(migrationSql).toContain('REVOKE ALL ON FUNCTION public.is_admin() FROM anon');
    expect(migrationSql).toContain('GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated');
    expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.delete_current_user()');
    expect(migrationSql).toContain('IF current_user_id IS NULL THEN');
    expect(migrationSql).toContain('REVOKE ALL ON FUNCTION public.delete_current_user() FROM PUBLIC');
    expect(migrationSql).toContain('REVOKE ALL ON FUNCTION public.delete_current_user() FROM anon');
    expect(migrationSql).toContain('GRANT EXECUTE ON FUNCTION public.delete_current_user() TO authenticated');
  });

  it('adds protected trainer-client invite infrastructure', () => {
    expect(migrationSql).toContain('CREATE TABLE IF NOT EXISTS public.trainer_invites');
    expect(migrationSql).toContain('CREATE TABLE IF NOT EXISTS public.trainer_clients');
    expect(migrationSql).toContain('CONSTRAINT trainer_clients_not_self CHECK (trainer_id <> client_id)');
    expect(migrationSql).toContain('CREATE POLICY "trainer_invites_own_data"');
    expect(migrationSql).toContain('CREATE POLICY "trainer_clients_linked_select"');
    expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.create_trainer_invite()');
    expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.connect_trainer_by_code(invite_code TEXT)');
    expect(migrationSql).toContain('gen_random_uuid()');
    expect(migrationSql).not.toContain('gen_random_bytes');
    expect(migrationSql).toContain('REVOKE ALL ON FUNCTION public.create_trainer_invite() FROM anon');
    expect(migrationSql).toContain('REVOKE ALL ON FUNCTION public.connect_trainer_by_code(TEXT) FROM anon');
    expect(migrationSql).toContain('GRANT EXECUTE ON FUNCTION public.create_trainer_invite() TO authenticated');
    expect(migrationSql).toContain('GRANT EXECUTE ON FUNCTION public.connect_trainer_by_code(TEXT) TO authenticated');
  });

  it('adds protected support inbox infrastructure for admin follow-up', () => {
    expect(migrationSql).toContain('CREATE TABLE IF NOT EXISTS public.support_tickets');
    expect(migrationSql).toContain('CREATE POLICY "support_tickets_insert_public"');
    expect(migrationSql).toContain('FOR INSERT TO anon, authenticated');
    expect(migrationSql).toContain('CREATE POLICY "support_tickets_select_admin"');
    expect(migrationSql).toContain('CREATE POLICY "support_tickets_update_admin"');
    expect(migrationSql).toContain('CREATE POLICY "support_tickets_delete_admin"');
    expect(migrationSql).toContain('USING (public.is_admin())');
  });

  it('keeps profile admin metadata available for the admin panel', () => {
    expect(migrationSql).toContain('ADD COLUMN IF NOT EXISTS role TEXT DEFAULT');
    expect(migrationSql).toContain('ADD COLUMN IF NOT EXISTS email TEXT');
    expect(migrationSql).toContain('NEW.email');
  });
});
