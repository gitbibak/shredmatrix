import { describe, expect, it } from 'vitest';
import { calculateBalanceScore, getLevel, getMoodIntensity } from './balanceScore';

describe('calculateBalanceScore', () => {
  it('returns a bounded score and a matching level', () => {
    const today = new Date().toISOString().split('T')[0];
    const result = calculateBalanceScore({
      workoutLogs: [{ date: today }],
      waterHistory: [{ date: today, glasses: 8 }],
      sleepEntries: [{ date: today, hours: 8 }],
      progressEntries: [
        { date: '2026-07-01', weight: 80 },
        { date: '2026-07-07', weight: 81 },
      ],
      measurements: [{ date: today, waist: 82 }],
      weeklyTarget: 4,
      goalType: 'muscle',
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.level).toEqual(getLevel(result.score));
  });

  it('handles empty input without throwing', () => {
    const result = calculateBalanceScore();

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.breakdown.weightTrend).toBe(50);
  });
});

describe('getMoodIntensity', () => {
  it('falls back to neutral intensity for unknown moods', () => {
    expect(getMoodIntensity('unknown')).toBe(1);
  });
});
