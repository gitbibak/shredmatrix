import { describe, expect, it } from 'vitest';
import { summarizeRetention } from './adminService';

describe('summarizeRetention', () => {
  it('excludes users who are not yet eligible and measures exact return days', () => {
    const profiles = [
      { id: 'd7', created_at: '2026-08-10T09:00:00.000Z' },
      { id: 'd1', created_at: '2026-08-19T09:00:00.000Z' },
      { id: 'new', created_at: '2026-08-20T12:00:00.000Z' },
    ];
    const activity = [
      { user_id: 'd7', activity_date: '2026-08-11' },
      { user_id: 'd7', activity_date: '2026-08-17' },
      { user_id: 'd1', activity_date: '2026-08-20' },
    ];
    const result = summarizeRetention(profiles, activity, ['d7', 'new'], new Date('2026-08-20T16:00:00.000Z'));
    expect(result).toMatchObject({
      registrations: 3,
      activated: 2,
      activationRate: 67,
      d1Eligible: 2,
      d1Returned: 2,
      d1Rate: 100,
      d7Eligible: 1,
      d7Returned: 1,
      d7Rate: 100,
    });
  });
});
