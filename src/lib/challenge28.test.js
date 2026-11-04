import { describe, expect, it } from 'vitest';
import { challengeStatus } from './challenge28';

describe('28-day challenge status', () => {
  it('is inactive until joined', () => {
    expect(challengeStatus(null, [], '2026-11-04')).toEqual({ state: 'none' });
    expect(challengeStatus({ startedAt: 'bad' }, [], '2026-11-04').state).toBe('none');
  });

  it('counts unique workout days inside the 28 days and per week', () => {
    const status = challengeStatus({ startedAt: '2026-11-01' }, ['2026-10-31', '2026-11-01', '2026-11-01', '2026-11-03', '2026-11-09'], '2026-11-10');
    expect(status).toMatchObject({ state: 'active', day: 10, done: 3, weeks: [2, 1, 0, 0], currentWeek: 1, leftThisWeek: 2 });
  });

  it('completes at 12 workouts and ends after 28 days otherwise', () => {
    const twelve = Array.from({ length: 12 }, (_, i) => `2026-11-${String(1 + i * 2).padStart(2, '0')}`);
    expect(challengeStatus({ startedAt: '2026-11-01' }, twelve, '2026-11-24').state).toBe('completed');
    const ended = challengeStatus({ startedAt: '2026-10-01' }, ['2026-10-02', '2026-10-30'], '2026-11-04');
    expect(ended).toMatchObject({ state: 'ended', done: 1, day: 28 });
  });

  it('keeps a recorded completion', () => {
    expect(challengeStatus({ startedAt: '2026-09-01', completedAt: '2026-09-25' }, [], '2026-11-04').state).toBe('completed');
  });
});
