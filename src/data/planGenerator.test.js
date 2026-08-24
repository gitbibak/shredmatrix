import { describe, expect, it } from 'vitest';
import {
  findMealAllergyViolations,
  generatePlan,
  normalizeTrainingEnvironment,
  personalizeMealItems,
  PLAN_VERSION,
} from './planGenerator';
import { findHomeEquipmentViolations } from './homeWorkoutPrograms';

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
    trainingEnvironment: 'gym',
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

  it('generates complete training and nutrition data for every module, level and language', () => {
    const goals = ['muscle', 'fat_loss', 'yoga', 'pilates', 'reformer', 'meditation'];

    for (const lang of ['tr', 'en', 'es']) {
      for (const goal of goals) {
        for (const phase of [0, 1, 2, 3]) {
          const plan = generatePlan({
            ...baseMetrics,
            primaryGoal: goal,
            experience: phase === 0 ? 'beginner' : 'advanced',
          }, phase, lang);

          expect(plan.workoutSplit).toHaveLength(7);
          expect(plan.dailyNutrition).toHaveLength(7);
          expect(Number.isFinite(plan.dailyCalories)).toBe(true);
          expect(Number.isFinite(plan.bmr)).toBe(true);
          expect(Number.isFinite(plan.tdee)).toBe(true);

          plan.workoutSplit.forEach((day) => {
            expect(day.day).toEqual(expect.any(String));
            expect(day.focus).toEqual(expect.any(String));
            expect(Array.isArray(day.exercises)).toBe(true);
          });

          plan.dailyNutrition.forEach((day) => {
            expect(day.calories).toBeGreaterThan(0);
            expect(day.meals.length).toBeGreaterThan(0);
            expect(day.meals.every((meal) => meal.items.length > 0)).toBe(true);
          });
        }
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

  it('does not invent a body-fat measurement and uses the matching calorie method', () => {
    const plan = generatePlan({
      ...baseMetrics,
      bodyFatPercentage: undefined,
    }, 0, 'tr');

    expect(plan.userBodyFat).toBeNull();
    expect(plan.personalization.calorieMethod).toBe('mifflin_st_jeor');
  });

  it('keeps the weekly calorie average aligned with the personal target', () => {
    for (const goal of ['muscle', 'fat_loss', 'yoga', 'pilates', 'reformer', 'meditation']) {
      const plan = generatePlan({ ...baseMetrics, primaryGoal: goal }, 0, 'tr');
      const weeklyAverage = Math.round(
        plan.dailyNutrition.reduce((sum, day) => sum + day.calories, 0) / plan.dailyNutrition.length,
      );

      expect(Math.abs(weeklyAverage - plan.dailyCalories)).toBeLessThanOrEqual(1);
      expect(plan.macros.protein).toBeGreaterThanOrEqual(Math.round(baseMetrics.weight * 1.2));
      expect(plan.macros.fat).toBeGreaterThanOrEqual(Math.round(baseMetrics.weight * 0.8));
      expect(plan.macros.carbs).toBeGreaterThan(0);
    }
  });

  it('changes food choices for economy plans instead of only changing prices', () => {
    const moderate = generatePlan({ ...baseMetrics, budget: 'moderate' }, 0, 'tr');
    const economy = generatePlan({ ...baseMetrics, budget: 'economy' }, 0, 'tr');
    const moderateFoods = moderate.dailyNutrition.flatMap((day) => day.meals.flatMap((meal) => meal.items));
    const economyFoods = economy.dailyNutrition.flatMap((day) => day.meals.flatMap((meal) => meal.items));

    expect(economyFoods).not.toEqual(moderateFoods);
    expect(economyFoods.some((item) => /mercimek|nohut|kuru fasulye/i.test(item))).toBe(true);
    expect(economy.personalization.budgetAdjusted).toBe(true);
  });

  it('shifts meal timing for night schedules', () => {
    const flexible = generatePlan({ ...baseMetrics, workSchedule: ['flexible'] }, 0, 'tr');
    const night = generatePlan({ ...baseMetrics, workSchedule: ['night_shift'] }, 0, 'tr');

    expect(night.dailyNutrition[0].meals[0].time).not.toBe(flexible.dailyNutrition[0].meals[0].time);
    expect(night.dailyNutrition[0].meals.every((meal) => meal.scheduleAdjusted)).toBe(true);
    expect(night.personalization.scheduleAdjusted).toBe(true);
  });

  it('caps intensity and requires clearance for heart conditions', () => {
    const plan = generatePlan({
      ...baseMetrics,
      primaryGoal: 'fat_loss',
      experience: 'expert',
      healthConditions: ['heart_condition'],
    }, 3, 'tr');
    const exerciseText = plan.workoutSplit
      .flatMap((day) => day.exercises || [])
      .map((exercise) => exercise.name)
      .join(' ')
      .toLowerCase();

    expect(plan.phase).toBe(0);
    expect(plan.personalization.requestedPhase).toBe(3);
    expect(plan.personalization.requiresMedicalClearance).toBe(true);
    expect(plan.planQuality.medicalNotice).toContain('sağlık uzmanı');
    ['sprint', 'hiit', 'tabata', 'amrap', 'emom', 'burpee', 'box jump'].forEach((term) => {
      expect(exerciseText).not.toContain(term);
    });
  });

  it('keeps replacement meal choices inside allergy and diet rules', () => {
    const items = personalizeMealItems(
      ['Whey protein shake', 'Salmon with wheat toast', 'Egg omelet'],
      { allergies: ['vegan', 'gluten'], budget: 'economy', lang: 'en' },
    );
    const text = items.join(' ').toLowerCase();

    ['whey', 'milk', 'yogurt', 'salmon', 'egg', 'wheat', 'toast', 'chicken'].forEach((term) => {
      expect(text).not.toContain(term);
    });
  });

  it('keeps every module and language clear of every selected allergen', () => {
    const goals = ['muscle', 'fat_loss', 'yoga', 'pilates', 'reformer', 'meditation'];
    const allergies = ['lactose', 'gluten', 'egg', 'nuts', 'seafood', 'soy', 'sesame', 'vegan', 'vegetarian'];

    for (const lang of ['tr', 'en', 'es']) {
      for (const primaryGoal of goals) {
        const plan = generatePlan({
          ...baseMetrics,
          primaryGoal,
          allergies,
        }, 0, lang);

        expect(findMealAllergyViolations(plan.dailyNutrition, allergies)).toEqual([]);
        expect(plan.personalization.allergyValidated).toBe(true);
      }
    }
  });

  it('normalizes equipment choices to the supported contract for every module', () => {
    expect(normalizeTrainingEnvironment('muscle', 'home_basic')).toBe('home_basic');
    expect(normalizeTrainingEnvironment('fat_loss', 'home_bodyweight')).toBe('home_bodyweight');
    expect(normalizeTrainingEnvironment('yoga', 'gym')).toBe('home_bodyweight');
    expect(normalizeTrainingEnvironment('pilates', 'home_basic')).toBe('home_bodyweight');
    expect(normalizeTrainingEnvironment('meditation', 'gym')).toBe('home_bodyweight');
    expect(normalizeTrainingEnvironment('reformer', 'home_bodyweight')).toBe('studio');
    expect(normalizeTrainingEnvironment('reformer', 'home_reformer')).toBe('home_reformer');

    for (const primaryGoal of ['yoga', 'pilates', 'meditation']) {
      const plan = generatePlan({ ...baseMetrics, primaryGoal, trainingEnvironment: 'gym' }, 0, 'en');
      expect(plan.trainingEnvironment).toBe('home_bodyweight');
      expect(plan.personalization.equipmentValidated).toBe(true);
    }

    const reformer = generatePlan({
      ...baseMetrics,
      primaryGoal: 'reformer',
      trainingEnvironment: 'home_bodyweight',
    }, 0, 'en');
    expect(reformer.trainingEnvironment).toBe('studio');
    expect(reformer.planQuality.equipmentLabel).toBe('Studio reformer machine');
    expect(reformer.personalization.equipmentValidated).toBe(true);
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

  it('creates equipment-feasible home plans at every level without gym-only movements', () => {
    for (const goal of ['muscle', 'fat_loss']) {
      for (const trainingEnvironment of ['home_bodyweight', 'home_basic']) {
        for (const phase of [0, 1, 2, 3]) {
          const plan = generatePlan({
            ...baseMetrics,
            primaryGoal: goal,
            experience: ['beginner', 'intermediate', 'advanced', 'expert'][phase],
            trainingEnvironment,
          }, phase, 'tr');
          const allExercises = plan.workoutSplit.flatMap((day) => [
            ...(day.exercises || []),
            ...(day.coreFinisher || []),
          ]);
          const exerciseText = allExercises.map((exercise) => exercise.name).join(' ').toLowerCase();

          ['barbell', 'cable', 'machine', 'treadmill', 'rowing', 'ski erg', 'assault bike', 'sled', 'trx', 'battle rope', 'bench press', 'lat pulldown', 'leg press', 'pushdown'].forEach((term) => {
            expect(exerciseText).not.toContain(term);
          });
          if (trainingEnvironment === 'home_bodyweight') {
            ['dumbbell', 'kettlebell', 'medicine ball', 'ab wheel', 'resistance band', 'backpack'].forEach((term) => {
              expect(exerciseText).not.toContain(term);
            });
          }
          expect(findHomeEquipmentViolations(plan.workoutSplit, trainingEnvironment)).toEqual([]);
          expect(allExercises.every((exercise) => Array.isArray(exercise.muscles))).toBe(true);
          expect(plan.trainingEnvironment).toBe(trainingEnvironment);
          expect(plan.personalization.environmentAdjusted).toBe(true);
          expect(plan.personalization.equipmentValidated).toBe(true);
        }
      }
    }
  });

  it('keeps home plans equipment-feasible after health substitutions', () => {
    for (const trainingEnvironment of ['home_bodyweight', 'home_basic']) {
      for (const condition of ['back_pain', 'knee_issue', 'shoulder_injury', 'wrist_issue', 'heart_condition']) {
        const plan = generatePlan({
          ...baseMetrics,
          primaryGoal: 'muscle',
          experience: 'advanced',
          trainingEnvironment,
          healthConditions: [condition],
        }, 2, 'tr');
        expect(findHomeEquipmentViolations(plan.workoutSplit, trainingEnvironment)).toEqual([]);
        const text = plan.workoutSplit.flatMap((day) => day.exercises || []).map((exercise) => exercise.name).join(' ').toLowerCase();
        ['cable', 'machine', 'lat pulldown', 'leg curl', 'leg press', 'landmine', 'pushdown'].forEach((term) => {
          expect(text).not.toContain(term);
        });
        if (condition === 'wrist_issue') expect(text).not.toContain('plank');
      }
    }
  });

  it('progresses home levels without losing weekly major-muscle coverage', () => {
    for (const trainingEnvironment of ['home_bodyweight', 'home_basic']) {
      for (const phase of [0, 1, 2, 3]) {
        const plan = generatePlan({
          ...baseMetrics,
          primaryGoal: 'muscle',
          experience: ['beginner', 'intermediate', 'advanced', 'expert'][phase],
          trainingEnvironment,
        }, phase, 'tr');
        const activeDays = plan.workoutSplit.filter((day) => !day.isRest);
        const muscles = activeDays.flatMap((day) => [
          ...(day.exercises || []),
          ...(day.coreFinisher || []),
        ].flatMap((exercise) => exercise.muscles || []));
        ['Göğüs', 'Sırt', 'Ön Bacak', 'Kalça', 'Core'].forEach((muscle) => {
          expect(muscles.filter((item) => item === muscle).length).toBeGreaterThanOrEqual(2);
        });
        expect(activeDays.length).toBe(phase === 0 ? 3 : phase === 1 ? 4 : 5);
        const lowerBodyDays = plan.workoutSplit
          .map((day, index) => ({ index, hasLowerBody: !day.isRest && day.exercises.some((exercise) => (exercise.muscles || []).some((muscle) => ['Ön Bacak', 'Arka Bacak', 'Kalça'].includes(muscle))) }))
          .filter((day) => day.hasLowerBody)
          .map((day) => day.index);
        if (phase >= 2) {
          expect(lowerBodyDays.every((dayIndex, index) => index === 0 || dayIndex - lowerBodyDays[index - 1] > 1)).toBe(true);
        }
      }
    }
  });

  it('limits fat-loss programming to one high-intensity day per week', () => {
    for (const phase of [0, 1, 2, 3]) {
      const plan = generatePlan({
        ...baseMetrics,
        primaryGoal: 'fat_loss',
        experience: ['beginner', 'intermediate', 'advanced', 'expert'][phase],
      }, phase === 0 ? 0 : phase, 'tr');
      const intenseDays = plan.workoutSplit.filter((day) => {
        const text = `${day.focus} ${(day.exercises || []).map((exercise) => exercise.name).join(' ')}`;
        return /hiit|sprint|tabata|amrap|emom|metabolik|conditioning|circuit|interval|burpee|box jump|jump lunge|jump squat/i.test(text);
      });
      expect(intenseDays.length).toBeLessThanOrEqual(phase === 0 ? 0 : 1);
    }
  });

  it('removes unsupervised extreme yoga skills and long breath holds at every level', () => {
    for (const phase of [0, 1, 2, 3]) {
      const plan = generatePlan({ ...baseMetrics, primaryGoal: 'yoga' }, phase, 'tr');
      const text = plan.workoutSplit
        .flatMap((day) => [day.focus, ...(day.exercises || []).map((exercise) => `${exercise.name} ${exercise.reps}`)])
        .join(' ')
        .toLowerCase();
      ['headstand', 'sirsasana', 'handstand', 'scorpion', 'forearm stand', 'pincha mayurasana', 'peacock', 'mayurasana', 'flying pigeon', 'kumbhaka', 'bandha', 'kapalabhati', '90 dk'].forEach((term) => {
        expect(text).not.toContain(term);
      });
    }
  });

  it('keeps beginner and intermediate Pilates progression neck-safe', () => {
    const blockedByPhase = {
      0: ['roll up', 'rolling like a ball', 'teaser', 'criss cross', 'double leg stretch', 'pilates push-up'],
      1: ['jackknife', 'neck pull', 'control balance', 'boomerang', 'open leg rocker'],
    };
    for (const phase of [0, 1]) {
      const plan = generatePlan({ ...baseMetrics, primaryGoal: 'pilates' }, phase, 'tr');
      const text = plan.workoutSplit.flatMap((day) => day.exercises || []).map((exercise) => exercise.name).join(' ').toLowerCase();
      blockedByPhase[phase].forEach((term) => expect(text).not.toContain(term));
    }
  });

  it('keeps meditation sessions single-technique, time-bounded and free of breath retention', () => {
    const durations = ['8 dk', '15 dk', '25 dk', '35 dk'];
    for (const phase of [0, 1, 2, 3]) {
      const plan = generatePlan({
        ...baseMetrics,
        primaryGoal: 'meditation',
        experience: ['beginner', 'intermediate', 'advanced', 'expert'][phase],
      }, phase === 0 ? 0 : phase, 'tr');
      plan.workoutSplit.filter((day) => !day.isRest).forEach((day) => {
        expect(day.exercises).toHaveLength(1);
        expect(day.exercises[0].reps).toBe(durations[phase]);
      });
      const text = plan.workoutSplit.flatMap((day) => day.exercises || []).map((exercise) => exercise.name).join(' ').toLowerCase();
      ['wim hof', 'kapalabhati', 'nefes tutma', 'kumbhaka'].forEach((term) => expect(text).not.toContain(term));
    }
  });

  it('keeps remote reformer plans away from high-risk unsupported skills', () => {
    for (const phase of [1, 2, 3]) {
      const plan = generatePlan({ ...baseMetrics, primaryGoal: 'reformer' }, phase, 'tr');
      const text = plan.workoutSplit.flatMap((day) => day.exercises || []).map((exercise) => exercise.name).join(' ').toLowerCase();
      ['long spine', 'snake', 'control balance', 'headstand', 'russian split', 'high bridge', 'tendon stretch', 'horseback'].forEach((term) => {
        expect(text).not.toContain(term);
      });
    }
  });

  it('does not mistake restorative training for a rest day', () => {
    for (const goal of ['yoga', 'pilates', 'reformer']) {
      const plan = generatePlan({ ...baseMetrics, primaryGoal: goal }, 1, 'tr');
      const restorativeDays = plan.workoutSplit.filter((day) => /restore|restoratif/i.test(day.focus));
      restorativeDays.forEach((day) => {
        expect(day.isRest).toBe(false);
        expect(day.exercises.length).toBeGreaterThan(0);
      });
    }
  });
});
