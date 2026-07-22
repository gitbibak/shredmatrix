import { describe, expect, it } from 'vitest';
import { generatePlan, PLAN_VERSION } from './planGenerator';

describe('planGenerator safety personalization', () => {
  it('carries health and allergy choices into the generated plan', () => {
    const plan = generatePlan({
      name: 'Test User',
      age: 30,
      gender: 'male',
      height: 180,
      weight: 82,
      bodyFatPercentage: 18,
      experience: 'intermediate',
      activityLevel: 'moderate',
      primaryGoal: 'muscle',
      workSchedule: ['flexible'],
      budget: 'moderate',
      healthConditions: ['knee_issue', 'back_pain'],
      allergies: ['lactose', 'gluten'],
    }, 0, 'tr');

    expect(plan.planVersion).toBe(PLAN_VERSION);
    expect(plan.healthConditions).toEqual(['knee_issue', 'back_pain']);
    expect(plan.allergies).toEqual(['lactose', 'gluten']);
    expect(plan.dailyNutrition.some((day) => day.meals.some((meal) => meal.hasAllergenWarning))).toBe(true);
  });

  it('filters risky exercise name variants for selected health conditions', () => {
    const plan = generatePlan({
      name: 'Test User',
      age: 30,
      gender: 'male',
      height: 180,
      weight: 82,
      bodyFatPercentage: 18,
      experience: 'advanced',
      activityLevel: 'moderate',
      primaryGoal: 'muscle',
      workSchedule: ['flexible'],
      budget: 'moderate',
      healthConditions: ['knee_issue', 'back_pain'],
      allergies: ['none'],
    }, 0, 'tr');

    const exerciseNames = plan.workoutSplit
      .flatMap((day) => day.exercises || [])
      .map((exercise) => exercise.name.toLowerCase());

    const blocked = [
      'back squat',
      'front squat',
      'romanian deadlift',
      'barbell row',
      'deficit deadlift',
      'bulgarian split squat',
      'jump squat',
    ];

    expect(exerciseNames.some((name) => blocked.some((blockedName) => name.includes(blockedName)))).toBe(false);
  });
});
