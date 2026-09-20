import { describe, expect, it } from 'vitest';
import { generatePlan, localizePlan } from './planGenerator';
import { QUALITY_TEXT, localizeQualityText } from './qualityTextMap';

const TURKISH_OR_DK = /[ğşıİçĞŞÇ]|\bdk\b/;
const GOALS = ['muscle', 'fat_loss', 'yoga', 'pilates', 'reformer', 'meditation'];
const PHASES = [0, 1, 2, 3];

const metrics = (goal, trainingEnvironment = 'gym') => ({
  goal, primaryGoal: goal, weight: 75, height: 175, age: 30, gender: 'female',
  activity: 'moderate', activityLevel: 'moderate', experience: 'beginner', trainingEnvironment,
  healthConditions: ['none'], allergies: ['none'], budget: 'moderate', workSchedule: ['flexible'],
});

const collectQualityStrings = (plan) => {
  const values = [];
  plan.workoutSplit.forEach((day) => {
    expect(day.quality).toBeTruthy();
    Object.values(day.quality).forEach((value) => { if (typeof value === 'string') values.push(value); });
  });
  expect(plan.planQuality).toBeTruthy();
  Object.values(plan.planQuality).forEach((value) => { if (typeof value === 'string') values.push(value); });
  return values;
};

describe('localizeQualityText', () => {
  it('returns the original for tr or unmapped values', () => {
    expect(localizeQualityText('Temel', 'tr')).toBe('Temel');
    expect(localizeQualityText('bilinmeyen', 'en')).toBe('bilinmeyen');
    expect(localizeQualityText('Temel', 'en')).toBe('Foundation');
    expect(localizeQualityText('Temel', 'es')).toBe('Base');
  });

  it('has the same key set for en and es', () => {
    expect(Object.keys(QUALITY_TEXT.es).sort()).toEqual(Object.keys(QUALITY_TEXT.en).sort());
  });
});

describe('localizePlan quality texts', () => {
  ['en', 'es'].forEach((lang) => {
    GOALS.forEach((goal) => {
      PHASES.forEach((phase) => {
        it(`leaves no Turkish quality text for ${lang}/${goal}/phase ${phase}`, () => {
          const plan = localizePlan(generatePlan(metrics(goal), phase, lang), lang);
          collectQualityStrings(plan).forEach((value) => expect(value).not.toMatch(TURKISH_OR_DK));
        });
      });
    });

    ['home_basic', 'home_bodyweight'].forEach((environment) => {
      ['muscle', 'fat_loss'].forEach((goal) => {
        PHASES.forEach((phase) => {
          it(`leaves no Turkish quality text for ${lang}/${goal}/${environment}/phase ${phase}`, () => {
            const plan = localizePlan(generatePlan(metrics(goal, environment), phase, lang), lang);
            collectQualityStrings(plan).forEach((value) => expect(value).not.toMatch(TURKISH_OR_DK));
          });
        });
      });
    });
  });

  it('keeps Turkish quality texts untouched for tr', () => {
    const plan = generatePlan(metrics('muscle'), 0, 'tr');
    expect(localizePlan(plan, 'tr')).toBe(plan);
    expect(plan.planQuality.phaseName).toBe('Temel');
  });
});
