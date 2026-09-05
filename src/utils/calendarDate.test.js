import { describe, expect, it } from 'vitest';
import { localDateKey, recentCalendarEntries } from './calendarDate';

describe('calendar dates', () => {
  it('uses local calendar fields instead of the UTC day', () => {
    const date = new Date(2026, 8, 6, 0, 30);
    expect(localDateKey(date)).toBe('2026-09-06');
  });
  it('filters by seven calendar days across a month boundary', () => {
    const entries = ['2026-08-01', '2026-08-27', '2026-08-28', '2026-09-03', '2026-09-04']
      .map(date => ({ date, hours: 8 }));
    expect(recentCalendarEntries(entries, 7, new Date(2026, 8, 3)).map(e => e.date))
      .toEqual(['2026-08-28', '2026-09-03']);
  });
});
