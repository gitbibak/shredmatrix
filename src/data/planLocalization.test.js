import { describe, expect, it } from 'vitest';
import { generatePlan, localizePlan } from './planGenerator';

const TURKISH = /[çğıöşüÇĞİÖŞÜ]|\b(nefes|dinl\.)/;
const ENVIRONMENTS = {
  muscle: ['gym', 'home_bodyweight', 'home_basic'],
  fat_loss: ['gym', 'home_bodyweight', 'home_basic'],
  yoga: ['home_bodyweight'],
  pilates: ['home_bodyweight'],
  reformer: ['studio', 'home_reformer'],
  meditation: ['home_bodyweight'],
};

function leftovers(lang) {
  const found = new Set();
  Object.entries(ENVIRONMENTS).forEach(([goal, environments]) => environments.forEach((environment) => {
    ['beginner', 'intermediate', 'advanced', 'expert'].forEach((experience) => [0, 1, 2, 3].forEach((phase) => {
      const plan = localizePlan(generatePlan({
        age: 30, gender: 'female', height: 170, weight: 65, experience, activityLevel: 'moderate',
        primaryGoal: goal, trainingEnvironment: environment, healthConditions: ['none'], allergies: ['none'],
      }, phase, lang), lang);
      plan.workoutSplit.forEach((day) => {
        [day.day, day.focus].forEach((text) => { if (TURKISH.test(text)) found.add(text); });
        [...(day.exercises || []), ...(day.coreFinisher || [])].forEach((exercise) => {
          [exercise.name, exercise.reps, exercise.rest].forEach((text) => {
            if (typeof text === 'string' && TURKISH.test(text)) found.add(text);
          });
        });
      });
    }));
  }));
  return [...found];
}

describe('plan localization', () => {
  it.each(['en', 'es'])('leaves no Turkish day, focus, exercise or rep text in %s plans', (lang) => {
    expect(leftovers(lang)).toEqual([]);
  });

  it('keeps the Turkish source name for the exercise guide and video lookups', () => {
    const plan = localizePlan(generatePlan({
      age: 30, gender: 'female', height: 170, weight: 65, experience: 'beginner',
      activityLevel: 'moderate', primaryGoal: 'pilates', healthConditions: ['none'], allergies: ['none'],
    }, 0, 'en'), 'en');
    const foam = plan.workoutSplit.flatMap((day) => day.exercises || []).find((exercise) => exercise.sourceName === 'Foam Roller Sırt');
    expect(foam?.name).toBe('Foam Roller Upper Back');
  });
});
