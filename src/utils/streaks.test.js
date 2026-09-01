import { describe, expect, it } from 'vitest';
import {
  computeFreezeAllowance,
  computeStreaks,
  findFreezeCandidate,
  getRestDayIndexes,
  toDateStr,
} from './streaks';

const day = (offset, base = new Date('2026-09-03T12:00:00')) => {
  const date = new Date(base);
  date.setDate(date.getDate() + offset);
  return toDateStr(date);
};
// 2026-09-03 is a Thursday (Mon=0 → index 3).
const today = new Date('2026-09-03T12:00:00');

describe('computeStreaks', () => {
  it('counts consecutive workout days and keeps today open', () => {
    const dates = new Set([day(-3), day(-2), day(-1)]);
    expect(computeStreaks(dates, { today })).toEqual({ current: 3, longest: 3 });
  });

  it('does not break the streak on plan rest days', () => {
    // Rest on Tuesday (index 1) and Wednesday (index 2); workouts Sat, Sun, Mon.
    const dates = new Set([day(-5), day(-4), day(-3)]);
    const withoutRest = computeStreaks(dates, { today });
    const withRest = computeStreaks(dates, { today, restDayIndexes: new Set([1, 2]) });
    expect(withoutRest.current).toBe(0);
    expect(withRest.current).toBe(3);
  });

  it('treats frozen days as kept without adding to the count', () => {
    const dates = new Set([day(-4), day(-3), day(-1)]);
    expect(computeStreaks(dates, { today }).current).toBe(1);
    expect(computeStreaks(dates, { today, frozenDates: new Set([day(-2)]) }).current).toBe(3);
  });

  it('returns zero for no workouts', () => {
    expect(computeStreaks(new Set(), { today })).toEqual({ current: 0, longest: 0 });
  });
});

describe('findFreezeCandidate', () => {
  it('suggests yesterday when it broke an existing streak', () => {
    const dates = new Set([day(-3), day(-2)]);
    expect(findFreezeCandidate(dates, { today })).toBe(day(-1));
  });

  it('skips rest days and returns null when the streak is intact', () => {
    const dates = new Set([day(-2)]);
    expect(findFreezeCandidate(dates, { today, restDayIndexes: new Set([2]) })).toBeNull();
  });

  it('returns null when there was no streak to protect', () => {
    const dates = new Set([day(-10)]);
    expect(findFreezeCandidate(dates, { today })).toBeNull();
  });

  it('ignores days that are already frozen', () => {
    const dates = new Set([day(-3), day(-2)]);
    expect(findFreezeCandidate(dates, { today, frozenDates: new Set([day(-1)]) })).toBeNull();
  });
});

describe('computeFreezeAllowance', () => {
  it('grants one weekly freeze plus referral bonuses', () => {
    expect(computeFreezeAllowance({ today })).toEqual({ weekly: 1, bonus: 0, total: 1, nextSource: 'weekly' });
    expect(computeFreezeAllowance({ today, activatedReferrals: 2 })).toMatchObject({ weekly: 1, bonus: 2, total: 3 });
  });

  it('consumes the weekly freeze only within the current week', () => {
    const thisWeek = computeFreezeAllowance({ today, freezes: [{ date: day(-1), source: 'weekly' }] });
    expect(thisWeek).toMatchObject({ weekly: 0, total: 0, nextSource: null });
    const lastWeek = computeFreezeAllowance({ today, freezes: [{ date: day(-8), source: 'weekly' }] });
    expect(lastWeek.weekly).toBe(1);
  });

  it('uses referral bonuses after the weekly freeze', () => {
    const allowance = computeFreezeAllowance({
      today,
      activatedReferrals: 2,
      freezes: [{ date: day(-1), source: 'weekly' }, { date: day(-9), source: 'referral' }],
    });
    expect(allowance).toEqual({ weekly: 0, bonus: 1, total: 1, nextSource: 'referral' });
  });
});

describe('getRestDayIndexes', () => {
  it('reads rest days from the plan split in any language', () => {
    const plan = { workoutSplit: [{ focus: 'Upper' }, { day: 'Dinlenme' }, { focus: 'Lower' }, { isRest: true }, { focus: 'Descanso activo' }, { focus: 'Push' }, { focus: 'Rest' }] };
    expect([...getRestDayIndexes(plan)]).toEqual([1, 3, 4, 6]);
  });
});
