import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

const read = (path) => readFileSync(join(cwd(), path), 'utf8');

describe('database hardening migrations', () => {
  it('prevents clients from changing authorization or managing profile lifecycle', () => {
    const roleMigration = read(
      'supabase/migrations/20260814131500_remove_obsolete_trainer_and_harden_functions.sql',
    );
    const lifecycleMigration = read(
      'supabase/migrations/20260815000500_lock_profile_lifecycle.sql',
    );

    expect(roleMigration).toContain('REVOKE UPDATE ON public.profiles FROM authenticated');
    expect(roleMigration).toContain(
      'GRANT UPDATE (name, onboarding_data, current_phase, plan_created_at, avatar_url)',
    );
    expect(roleMigration).toContain("CHECK (role IN ('user', 'admin'))");
    expect(lifecycleMigration).toContain(
      'REVOKE INSERT, DELETE ON public.profiles FROM authenticated',
    );
    expect(lifecycleMigration).toContain('DROP POLICY IF EXISTS profiles_insert_own');
    expect(lifecycleMigration).toContain('DROP POLICY IF EXISTS profiles_delete_access');
  });

  it('retires PT connections without deleting historical records', () => {
    const migration = read(
      'supabase/migrations/20260814131500_remove_obsolete_trainer_and_harden_functions.sql',
    );

    expect(migration).toContain(
      'REVOKE ALL ON public.trainer_clients FROM anon, authenticated',
    );
    expect(migration).toContain(
      'REVOKE ALL ON public.trainer_invites FROM anon, authenticated',
    );
    expect(migration).not.toMatch(/DROP TABLE\s+(?:IF EXISTS\s+)?public\.trainer_/i);
  });
});
