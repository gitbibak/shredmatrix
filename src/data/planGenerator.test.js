import { describe, expect, it } from 'vitest';
import { generatePlan, PLAN_VERSION } from './planGenerator';

describe('planGenerator safety personalization', () => {
  const baseMetrics = {
    name: 'Test User',
    age: 30,
    gender: 'male',
    height: 180,
    weight: 82,
    bodyFatPercentage: 18,
    experience: 'beginner',
    activityLevel: 'moderate',
    primaryGoal: 'muscle',
    workSchedule: ['flexible'],
    budget: 'moderate',
    healthConditions: ['none'],
    allergies: ['none'],
  };

  it('carries health and allergy choices into the generated plan', () => {
    const plan = generatePlan({
      ...baseMetrics,
      experience: 'intermediate',
      primaryGoal: 'muscle',
      healthConditions: ['knee_issue', 'back_pain'],
      allergies: ['lactose', 'gluten'],
    }, 0, 'tr');

    expect(plan.planVersion).toBe(PLAN_VERSION);
    expect(plan.healthConditions).toEqual(['knee_issue', 'back_pain']);
    expect(plan.allergies).toEqual(['lactose', 'gluten']);
    expect(plan.dailyNutrition.some((day) => day.meals.some((meal) => meal.allergyAdjusted))).toBe(true);

    const foodText = plan.dailyNutrition
      .flatMap((day) => day.meals)
      .flatMap((meal) => meal.items)
      .join(' ')
      .toLowerCase();

    const forbidden = ['süt', 'peynir', 'yoğurt', 'whey', 'ekmek', 'makarna', 'bulgur', 'yulaf', 'granola'];
    expect(forbidden.some((keyword) => foodText.includes(keyword))).toBe(false);
  });

  it('filters risky exercise name variants for selected health conditions', () => {
    const plan = generatePlan({
      ...baseMetrics,
      experience: 'advanced',
      primaryGoal: 'muscle',
      healthConditions: ['knee_issue', 'back_pain'],
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

  it('adds quality guidance to every module and level', () => {
    const goals = ['muscle', 'fat_loss', 'yoga', 'pilates', 'reformer', 'meditation'];

    for (const goal of goals) {
      for (const phase of [0, 1, 2, 3]) {
        const plan = generatePlan({
          ...baseMetrics,
          primaryGoal: goal,
          experience: phase === 0 ? 'beginner' : 'intermediate',
        }, phase, 'tr');

        expect(plan.planQuality).toEqual(expect.objectContaining({
          phaseName: expect.any(String),
          weeklyTarget: expect.any(String),
          progressionRule: expect.any(String),
          regressionOption: expect.any(String),
          safetyNotes: expect.any(String),
        }));

        plan.workoutSplit.forEach((day) => {
          expect(day.quality).toEqual(expect.objectContaining({
            goal: expect.any(String),
            difficulty: expect.any(String),
            expectedDuration: expect.any(String),
            intensity: expect.any(String),
            warmup: expect.any(String),
            cooldown: expect.any(String),
            progressionRule: expect.any(String),
            regressionOption: expect.any(String),
            safetyNotes: expect.any(String),
          }));
        });
      }
    }
  });

  it('assigns a discipline-specific image to every active day', () => {
    const expectedImages = {
      fat_loss: '/images/modules/fat-loss.jpg',
      yoga: '/images/modules/yoga.jpg',
      pilates: '/images/modules/pilates.jpg',
      reformer: '/images/modules/reformer.jpg',
      meditation: '/images/modules/meditation.jpg',
    };

    for (const [goal, expectedImage] of Object.entries(expectedImages)) {
      const plan = generatePlan({
        ...baseMetrics,
        primaryGoal: goal,
      }, 0, 'tr');

      const activeDays = plan.workoutSplit.filter((day) => {
        const focus = day.focus.toLowerCase();
        return !['dinlenme', 'rest', 'off', 'descanso'].some((label) => focus.includes(label));
      });

      expect(activeDays.length).toBeGreaterThan(0);
      activeDays.forEach((day) => expect(day.image).toBe(expectedImage));
    }
  });

  it('keeps beginner fat-loss plans low impact and strength-retention focused', () => {
    const plan = generatePlan({
      ...baseMetrics,
      primaryGoal: 'fat_loss',
      experience: 'beginner',
    }, 0, 'tr');

    const planText = plan.workoutSplit
      .flatMap((day) => [day.focus, ...(day.exercises || []).map((exercise) => exercise.name)])
      .join(' ')
      .toLowerCase();

    ['burpee', 'box jump', 'jump lunge', 'jump squat', 'sprint', 'battle ropes', 'hiit'].forEach((keyword) => {
      expect(planText).not.toContain(keyword);
    });

    expect(plan.planQuality.weeklyTarget).toContain('3 güç');
  });

  it('keeps foundation yoga and intermediate yoga away from neck-loaded inversions', () => {
    const plan = generatePlan({
      ...baseMetrics,
      primaryGoal: 'yoga',
      experience: 'intermediate',
    }, 1, 'tr');

    const planText = plan.workoutSplit
      .flatMap((day) => [day.focus, ...(day.exercises || []).map((exercise) => exercise.name)])
      .join(' ')
      .toLowerCase();

    ['headstand', 'sirsasana', 'shoulder stand', 'sarvangasana', 'kapalabhati'].forEach((keyword) => {
      expect(planText).not.toContain(keyword);
    });
  });

  it('keeps reformer beginner plans on stable reformer-only basics', () => {
    const plan = generatePlan({
      ...baseMetrics,
      primaryGoal: 'reformer',
      experience: 'beginner',
    }, 0, 'tr');

    const planText = plan.workoutSplit
      .flatMap((day) => [day.focus, ...(day.exercises || []).map((exercise) => exercise.name)])
      .join(' ')
      .toLowerCase();

    ['short spine', 'snake', 'control balance', 'headstand', 'jump', 'tower', 'cadillac', 'wunda'].forEach((keyword) => {
      expect(planText).not.toContain(keyword);
    });
  });

  it('keeps expert reformer plans reformer-only until equipment selection exists', () => {
    const plan = generatePlan({
      ...baseMetrics,
      primaryGoal: 'reformer',
      experience: 'expert',
    }, 3, 'tr');

    const planText = plan.workoutSplit
      .flatMap((day) => [day.focus, ...(day.exercises || []).map((exercise) => exercise.name)])
      .join(' ')
      .toLowerCase();

    ['tower', 'cadillac', 'wunda chair'].forEach((keyword) => {
      expect(planText).not.toContain(keyword);
    });
  });
});
