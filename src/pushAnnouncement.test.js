import { describe, expect, it } from 'vitest';
import { announcementFor, getDailyNotification } from '../supabase/functions/send-push/notificationContent.js';

describe('push announcements', () => {
  it('replaces the reminder on the announcement day in the member language', () => {
    const message = announcementFor('tr', '2026-11-15', 'workout');
    expect(message.title).toBe('Kurucudan bir rica 🥤');
    expect(message.url).toBe('/dashboard?entry=push&message=founder_support');
    expect(announcementFor('de', '2026-11-15', 'daily').language).toBe('en');
  });

  it('leaves water breaks and other days alone', () => {
    expect(announcementFor('tr', '2026-11-15', 'water')).toBeNull();
    expect(announcementFor('tr', '2026-11-16', 'workout')).toBeNull();
    expect(getDailyNotification('tr', '2026-11-16', 'sub-1').category).not.toBe('founder_support');
  });
});
