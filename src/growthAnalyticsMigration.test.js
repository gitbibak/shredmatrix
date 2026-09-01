import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

const migration = readFileSync(
  join(cwd(), 'supabase/migrations/20260901213724_add_growth_analytics_foundation.sql'),
  'utf8',
);

describe('growth analytics migration', () => {
  it('is additive and stores no anonymous database writes', () => {
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS public.growth_events');
    expect(migration).toContain('ALTER TABLE public.growth_events ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain('TO authenticated');
    expect(migration).toContain('WITH CHECK ((SELECT auth.uid()) = user_id)');
    expect(migration).toContain('REVOKE ALL ON public.growth_events FROM PUBLIC, anon, authenticated');
    expect(migration).not.toContain('TO anon');
    expect(migration).not.toMatch(/DROP TABLE|DROP COLUMN/);
  });

  it('rejects sensitive or nested event properties in the database', () => {
    expect(migration).toContain('private.analytics_properties_are_safe');
    expect(migration).toContain('jsonb_typeof(property.value) NOT IN');
    expect(migration).toContain('weight|bmi|body|fat');
  });
});
