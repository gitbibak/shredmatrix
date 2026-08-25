import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { NOTIFICATION_CONTENT, getDailyNotification } from '../supabase/functions/send-push/notificationContent.js';

const read = (path) => readFileSync(join(cwd(), path), 'utf8');

describe('scheduled push security', () => {
  it('uses an encrypted cron secret instead of an empty database setting', () => {
    const migration = read('supabase/migrations/20260814143000_secure_push_cron.sql');

    expect(migration).toContain("vault.create_secret(");
    expect(migration).toContain("name = 'push_cron_secret'");
    expect(migration).toContain("'x-cron-secret'");
    expect(migration).not.toContain("current_setting('supabase.service_role_key'");
  });

  it('authenticates the function and uses standards-compliant payload encryption', () => {
    const source = read('supabase/functions/send-push/index.ts');

    expect(source).toContain("req.headers.get('x-cron-secret')");
    expect(source).toContain("'verify_push_cron_secret'");
    expect(source).toContain("webpush.sendNotification");
    expect(source).not.toContain('crypto.subtle.sign');
  });

  it('keeps notification copy concise, localized, and free of private health data', () => {
    Object.values(NOTIFICATION_CONTENT).forEach(({ messages }) => {
      messages.forEach(({ title, body }) => {
        expect(title.length).toBeLessThanOrEqual(28);
        expect(body.length).toBeLessThanOrEqual(80);
        expect(`${title} ${body}`).not.toMatch(/Full Balance|kilo|weight|BMI|alerji|allergy/i);
      });
    });
  });

  it('uses a stable daily message and opens the Today screen with attribution', () => {
    const first = getDailyNotification('tr', '2026-08-25', 'subscription-1');
    const second = getDailyNotification('tr', '2026-08-25', 'subscription-1');

    expect(second).toEqual(first);
    expect(first.url).toBe(`/dashboard?entry=push&message=${first.category}`);
    expect(first).not.toHaveProperty('actions');
  });
});
