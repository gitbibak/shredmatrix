import { describe, expect, it } from 'vitest';
import { calculateLongevityBalance } from './longevityScore';

const now = new Date('2026-08-10T12:00:00');

function daysAgo(days) {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

describe('calculateLongevityBalance', () => {
  it('waits for enough real signals instead of treating missing data as zero', () => {
    const result = calculateLongevityBalance({ sleepEntries: [{ date: daysAgo(0), hours: 8 }], now });
    expect(result.score).toBeNull();
    expect(result.status).toBe('collecting');
    expect(result.available.recovery).toBe(false);
  });

  it('scores logged strength, mobility, sleep and nutrition habits transparently', () => {
    const workouts = [
      { date: daysAgo(1), focus: 'Full Body Strength', exercises: ['Squat', 'Row'] },
      { date: daysAgo(4), focus: 'Yoga Mobility', exercises: ['Stretch'] },
      { date: daysAgo(8), focus: 'Upper Body', exercises: ['Bench Press'] },
      { date: daysAgo(11), focus: 'Pilates', exercises: ['Balance'] },
    ];
    const sleepEntries = Array.from({ length: 7 }, (_, index) => ({ date: daysAgo(index), hours: 8 }));
    const checkins = Array.from({ length: 5 }, (_, index) => ({ date: daysAgo(index), nutrition_aligned: index < 4, energy: 3 }));

    const result = calculateLongevityBalance({
      workoutLogs: workouts,
      sleepEntries,
      checkins,
      plan: { goal: 'Kas Gelişimi', trainingDays: 3 },
      now,
    });

    expect(result.score).not.toBeNull();
    expect(result.scores.recovery).toBe(100);
    expect(result.scores.nutrition).toBe(80);
    expect(result.available).toEqual({ movement: true, strength: true, mobility: true, recovery: true, nutrition: true });
  });

  it('prioritizes recovery when the latest energy check-in is low', () => {
    const result = calculateLongevityBalance({
      workoutLogs: [{ date: daysAgo(1), focus: 'Strength', exercises: ['Squat'] }],
      sleepEntries: [{ date: daysAgo(0), hours: 6 }, { date: daysAgo(1), hours: 6 }],
      checkins: [{ date: daysAgo(0), nutrition_aligned: true, energy: 1 }],
      plan: { goal: 'Fat Loss' },
      now,
    });
    expect(result.recommendation).toEqual({ key: 'recovery', target: 'nutrition' });
  });

  it('does not carry an old low-energy check-in into a new day', () => {
    const result = calculateLongevityBalance({
      workoutLogs: [{ date: daysAgo(1), focus: 'Strength', exercises: ['Squat'] }],
      sleepEntries: [{ date: daysAgo(0), hours: 8 }, { date: daysAgo(1), hours: 8 }],
      checkins: [{ date: daysAgo(2), nutrition_aligned: true, energy: 1 }],
      plan: { goal: 'Fat Loss' },
      now,
    });
    expect(result.recommendation.key).not.toBe('recovery');
  });

  it('does not use body weight or health conditions as a lifespan prediction', () => {
    const result = calculateLongevityBalance({
      plan: { weight: 140, bodyFat: 45, healthConditions: ['heart_blood_pressure'] },
      now,
    });
    expect(result.score).toBeNull();
    expect(result).not.toHaveProperty('biologicalAge');
    expect(result.disclaimer).toBe('habit_score');
  });
});
