import { describe, expect, it } from 'vitest';
import { calculateBalanceScore, getLevel, getMoodIntensity } from './balanceScore';

const referenceDate = '2026-09-02T12:00:00Z';
const timeZone = 'Europe/Istanbul';

function calculate(input = {}) {
  return calculateBalanceScore({ referenceDate, timeZone, ...input });
}

describe('calculateBalanceScore', () => {
  it('returns no score when there is not enough observed data', () => {
    const result = calculate();
    expect(result.overallScore).toBeNull();
    expect(result.dataCompleteness.sufficient).toBe(false);
    expect(Object.values(result.categoryScores).every((value) => value === null)).toBe(true);
  });

  it('calculates partial data without penalizing missing categories', () => {
    const result = calculate({
      workoutLogs: [{ date: '2026-09-01' }, { date: '2026-09-02' }],
      waterHistory: [{ date: '2026-09-02', glasses: 8, target_met: true }],
      weeklyTarget: 4,
    });
    expect(result.overallScore).toBe(53);
    expect(result.categoryScores.activity).toBe(50);
    expect(result.categoryScores.hydration).toBe(100);
    expect(result.categoryScores.nutrition).toBeNull();
    expect(result.categoryScores.recovery).toBeNull();
    expect(result.dataCompleteness.availableCategories).toEqual(['activity', 'consistency', 'hydration']);
  });

  it('returns 100 for complete ideal records across the full window', () => {
    const dates = ['2026-08-27', '2026-08-28', '2026-08-29', '2026-08-30', '2026-08-31', '2026-09-01', '2026-09-02'];
    const result = calculate({
      workoutLogs: dates.map((date) => ({ date, focus: 'Strength' })),
      waterHistory: dates.map((date) => ({ date, glasses: 8, target_met: true })),
      sleepEntries: dates.map((date) => ({ date, hours: 8 })),
      checkins: dates.map((date) => ({ date, energy: 3, nutrition_aligned: true })),
      weeklyTarget: 7,
    });
    expect(result.overallScore).toBe(100);
    expect(Object.values(result.categoryScores).filter((value) => value != null).every((value) => value === 100)).toBe(true);
    expect(result.strengths).toHaveLength(2);
  });

  it('keeps low but valid scores bounded and explainable', () => {
    const result = calculate({
      sleepEntries: [{ date: '2026-09-01', hours: 2 }, { date: '2026-09-02', hours: 2 }],
      checkins: [
        { date: '2026-09-01', energy: 1, nutrition_aligned: false },
        { date: '2026-09-02', energy: 1, nutrition_aligned: false },
      ],
    });
    expect(result.overallScore).toBe(16);
    expect(result.categoryScores.nutrition).toBe(0);
    expect(result.categoryScores.recovery).toBe(25);
    expect(result.improvementAreas[0].score).toBe(0);
    expect(getLevel(result.overallScore).key).toBe('beginner');
  });

  it('ignores invalid values instead of corrupting the result', () => {
    const result = calculate({
      workoutLogs: [{ date: 'not-a-date' }],
      waterHistory: [{ date: '2026-09-02', glasses: 'invalid' }],
      sleepEntries: [{ date: '2026-09-02', hours: 99 }],
      checkins: [{ date: '2026-09-02', energy: 8, nutrition_aligned: 'yes' }],
    });
    expect(result.overallScore).toBeNull();
    expect(result.categoryScores.recovery).toBeNull();
    expect(result.categoryScores.nutrition).toBeNull();
  });

  it('excludes records before the seven-day window', () => {
    const result = calculate({
      workoutLogs: [{ date: '2026-08-26' }],
      waterHistory: [{ date: '2026-08-26', glasses: 8 }],
      sleepEntries: [{ date: '2026-08-26', hours: 8 }],
    });
    expect(result.overallScore).toBeNull();
    expect(result.dataCompleteness.signalCount).toBe(0);
    expect(result.period).toEqual({ start: '2026-08-27', end: '2026-09-02' });
  });

  it('uses the supplied timezone at the calendar-day boundary', () => {
    const input = {
      referenceDate: '2026-09-02T21:30:00Z',
      workoutLogs: [{ date: '2026-09-02' }, { date: '2026-09-03' }],
      sleepEntries: [{ date: '2026-09-02', hours: 8 }, { date: '2026-09-03', hours: 8 }],
      checkins: [{ date: '2026-09-03', energy: 3, nutrition_aligned: true }],
    };
    const istanbul = calculateBalanceScore({ ...input, timeZone: 'Europe/Istanbul' });
    const utc = calculateBalanceScore({ ...input, timeZone: 'UTC' });
    expect(istanbul.period.end).toBe('2026-09-03');
    expect(istanbul.overallScore).not.toBeNull();
    expect(utc.period.end).toBe('2026-09-02');
    expect(utc.overallScore).toBeNull();
  });
});

describe('getMoodIntensity', () => {
  it('falls back to neutral intensity for unknown moods', () => {
    expect(getMoodIntensity('unknown')).toBe(1);
  });
});
