import { describe, expect, it } from 'vitest';
import { formatTrainerReport, summarizeTrainerData } from './trainerReport';

describe('trainer report utilities', () => {
  it('summarizes recent training, hydration, sleep and body metrics', () => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const summary = summarizeTrainerData({
      plan: {
        userName: 'Ada',
        goal: 'Muscle Growth',
        dailyCalories: 2500,
        macros: { protein: 180, carbs: 280, fat: 70 },
        workoutSplit: [{ isRest: false }, { isRest: true }, { isRest: false }],
      },
      workoutLogs: [{ date: today }, { date: yesterday }],
      progressEntries: [
        { date: yesterday, weight: 79 },
        { date: today, weight: 80, bodyFat: 14 },
      ],
      measurements: [{ date: today, chest: 104, waist: 82 }],
      waterHistory: [{ date: today, glasses: 8, target_met: true }],
      sleepEntries: [{ date: today, hours: 7.5 }],
    });

    expect(summary.athleteName).toBe('Ada');
    expect(summary.workoutsLast7).toBe(2);
    expect(summary.trainingDaysPerWeek).toBe(2);
    expect(summary.waterTargetDays).toBe(1);
    expect(summary.sleepAvg).toBe(7.5);
    expect(summary.weightChange).toBe(1);
  });

  it('formats a shareable plain text report', () => {
    const report = formatTrainerReport(summarizeTrainerData({
      plan: { userName: 'Ada', goal: 'Fat Loss', dailyCalories: 1900 },
    }));

    expect(report).toContain('PT Progress Report');
    expect(report).toContain('Athlete: Ada');
    expect(report).toContain('Goal: Fat Loss');
  });
});
