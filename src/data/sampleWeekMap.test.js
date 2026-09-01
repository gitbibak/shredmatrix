import { describe, expect, it } from 'vitest';
import { generatePlan, localizePlan } from './planGenerator';
import { formatSampleExercise, getSampleWeek } from './sampleWeekMap';
import { sampleHomeWeeks } from './sampleHomeWeeks';

const TURKISH = /[çğıöşüÇĞİÖŞÜ]|\bve\b|\bTam Vücut\b/;

describe('generated sample weeks', () => {
  it('cover every variant in three languages with seven days each', () => {
    for (const [variant, byLang] of Object.entries(sampleHomeWeeks)) {
      for (const lang of ['tr', 'en', 'es']) {
        expect(byLang[lang], `${variant}/${lang}`).toHaveLength(7);
      }
    }
  });

  it('contain no Turkish text in English or Spanish weeks', () => {
    for (const byLang of Object.values(sampleHomeWeeks)) {
      for (const lang of ['en', 'es']) {
        for (const day of byLang[lang]) {
          expect(day.focus).not.toMatch(TURKISH);
          for (const exercise of day.exercises) {
            expect(exercise.name).not.toMatch(TURKISH);
            expect(exercise.reps).not.toMatch(TURKISH);
          }
        }
      }
    }
  });

  it('maps landing pages to a sample and formats exercises', () => {
    const sample = getSampleWeek('/en/home-workout-no-equipment', 'en');
    expect(sample?.variant).toBe('fat_loss_bodyweight');
    expect(sample.days.some((day) => day.rest)).toBe(true);
    expect(formatSampleExercise({ name: 'Push-Up', sets: 3, reps: '8-12', rest: '60s' }, sample.copy)).toBe('Push-Up: 3 sets × 8-12, 60s rest');
    expect(formatSampleExercise({ name: 'Brisk Walk', sets: 1, reps: '30-45 min', rest: '-' }, sample.copy)).toBe('Brisk Walk: 1 set × 30-45 min');
    expect(getSampleWeek('/bmi-hesaplama', 'tr')).toBeNull();
  });
});

describe('home plan localization', () => {
  const metrics = (environment) => ({
    name: 'Test', age: 28, gender: 'female', height: 165, weight: 62,
    experience: 'beginner', activityLevel: 'moderate', primaryGoal: 'fat_loss',
    workSchedule: ['flexible'], budget: 'moderate', trainingEnvironment: environment,
    healthConditions: ['none'], allergies: ['none'],
  });

  it('translates home exercise names and focus labels for English and Spanish members', () => {
    for (const environment of ['home_bodyweight', 'home_basic']) {
      for (const lang of ['en', 'es']) {
        const plan = localizePlan(generatePlan(metrics(environment), 0, lang), lang);
        for (const day of plan.workoutSplit) {
          expect(day.focus, `${environment}/${lang}`).not.toMatch(TURKISH);
          for (const exercise of day.exercises || []) {
            expect(exercise.name, `${environment}/${lang}/${exercise.name}`).not.toMatch(TURKISH);
          }
        }
      }
    }
  });
});
