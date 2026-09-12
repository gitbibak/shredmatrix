import { describe, it, expect } from 'vitest';
import { normalizeReminders, dueReminders, localReminderClock, scheduledMessage } from '../../supabase/functions/send-push/reminderSchedule';

describe('reminder scheduling', () => {
  it('preserves legacy daily time and leaves water disabled', () => {
    const s = normalizeReminders(null, 18);
    expect(s.workout.time).toBe('18:00'); expect(s.water.enabled).toBe(false);
    expect(dueReminders({ notification_hour: 18, timezone: 'Europe/Istanbul' }, new Date('2026-09-11T15:00Z'))).toEqual([{ kind: 'workout', time: '18:00', date: '2026-09-11' }]);
  });
  it('does not repeat an already delivered legacy daily notification', () => {
    expect(dueReminders({ notification_hour: 18, timezone: 'Europe/Istanbul', last_notified_on: '2026-09-11' }, new Date('2026-09-11T15:05Z'))).toEqual([]);
  });
  it('supports minutes, weekdays, water and independent disabling', () => {
    const sub = { timezone: 'Europe/Istanbul', reminder_settings: { workout: { enabled: false }, water: { enabled: true, days: [5], times: ['18:23', '21:00'] } } };
    expect(dueReminders(sub, new Date('2026-09-11T15:25Z'))).toEqual([{ kind: 'water', time: '18:23', date: '2026-09-11' }]);
    expect(dueReminders(sub, new Date('2026-09-12T15:25Z'))).toEqual([]);
    expect(dueReminders(sub, new Date('2026-09-11T15:35Z'))).toEqual([]);
  });
  it('handles midnight, IANA DST and invalid zones', () => {
    expect(localReminderClock('Europe/Istanbul', new Date('2026-09-11T21:00Z'))).toEqual({ date: '2026-09-12', day: 6, minute: 0 });
    expect(localReminderClock('America/New_York', new Date('2026-11-01T06:30Z')).minute).toBe(90);
    expect(localReminderClock('invalid', new Date('2026-09-11T10:00Z')).minute).toBe(600);
  });
  it('deduplicates times, caps water at eight and rejects malformed times/days', () => {
    const s = normalizeReminders({ water: { times: ['10:00', '10:00', '25:00'], days: [-1, 1, 1, '2', 9] } });
    expect(s.water.times).toEqual(['10:00']); expect(s.water.days).toEqual([1]);
    expect(normalizeReminders({ water: { times: Array.from({ length: 20 }, (_, i) => `${String(i).padStart(2, '0')}:00`) } }).water.times).toHaveLength(8);
  });
  it('localizes without health values and uses distinct delivery tags', () => {
    for (const lang of ['tr', 'en', 'es']) {
      const message = scheduledMessage(lang, { kind: 'water', date: '2026-09-11', time: '12:30' });
      expect(message.url).toContain('message=water'); expect(message.tag).toContain('12:30');
      expect(message.body).not.toMatch(/kg|kcal|ml|BMI/);
    }
  });
});
