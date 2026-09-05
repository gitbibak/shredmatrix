import { describe, expect, it } from 'vitest';
import { applyFocusEmphasis, applyTrainingDays, generatePlan, localizePlan } from './planGenerator';
import { FOCUS_AREAS, MAX_ADDED_SETS, normalizeFocusAreas, normalizeTrainingDays } from './focusAreas';
import { findHomeEquipmentViolations } from './homeWorkoutPrograms';

const metrics = (overrides = {}) => ({
  name: 'Test', age: 30, gender: 'female', height: 168, weight: 64,
  experience: 'beginner', activityLevel: 'moderate', primaryGoal: 'muscle',
  workSchedule: ['flexible'], budget: 'moderate', trainingEnvironment: 'gym',
  healthConditions: ['none'], allergies: ['none'],
  ...overrides,
});

const isRest = (day) => /dinlen|rest|descanso/i.test(`${day.day} ${day.focus}`);
const trainingDays = (plan) => plan.workoutSplit.filter((day) => !isRest(day));

describe('normalizers', () => {
  it('limits focus areas to two known keys and validates day counts', () => {
    expect(normalizeFocusAreas(['core', 'bogus', 'core', 'glutes_legs', 'shoulders'])).toEqual(['core', 'glutes_legs']);
    expect(normalizeTrainingDays('4')).toBe(4);
    expect(normalizeTrainingDays(6)).toBeNull();
    expect(normalizeTrainingDays(undefined)).toBeNull();
  });
});

describe('applyTrainingDays', () => {
  it('reduces a six-day split to three spread sessions with distinct focuses', () => {
    const plan = generatePlan(metrics({ experience: 'expert' }), 3, 'tr');
    const base = trainingDays(plan).length;
    expect(base).toBeGreaterThan(3);
    const reduced = generatePlan(metrics({ experience: 'expert', trainingDaysPerWeek: 3 }), 3, 'tr');
    const sessions = trainingDays(reduced);
    expect(sessions).toHaveLength(3);
    expect(sessions.map((day) => day.day)).toEqual(['Pazartesi', 'Çarşamba', 'Cuma']);
    expect(new Set(sessions.map((day) => day.focus.split(' ')[0])).size).toBe(3);
    expect(reduced.trainingDays).toBe(3);
    expect(reduced.personalization.trainingDaysAdjusted).toBe(true);
  });

  it('never adds sessions beyond the template and keeps the week at seven days', () => {
    const template = generatePlan(metrics(), 0, 'tr').workoutSplit;
    expect(applyTrainingDays(template, 5)).toBe(template);
    expect(applyTrainingDays(template, 3)).toHaveLength(7);
  });

  it('localizes the inserted rest days', () => {
    const plan = localizePlan(generatePlan(metrics({ experience: 'advanced', trainingDaysPerWeek: 4 }), 2, 'en'), 'en');
    const rest = plan.workoutSplit.filter((day) => /rest/i.test(day.focus));
    expect(rest.length).toBe(3);
    rest.forEach((day) => expect(day.exercises[0].name).not.toMatch(/Dinlenme/));
  });
});

describe('applyFocusEmphasis', () => {
  it('adds capped extra volume and an accessory for a gym glute focus', () => {
    const base = generatePlan(metrics(), 0, 'tr');
    const focused = generatePlan(metrics({ focusAreas: ['glutes_legs'] }), 0, 'tr');
    const count = (plan) => plan.workoutSplit.reduce((sum, day) => sum + (day.exercises || []).reduce((s, ex) => s + (Number(ex.sets) || 0), 0), 0);
    expect(count(focused)).toBeGreaterThan(count(base));
    const accessories = focused.workoutSplit.flatMap((day) => (day.exercises || []).filter((ex) => ex.focusArea === 'glutes_legs'));
    expect(accessories.length).toBeGreaterThanOrEqual(1);
    expect(accessories.length).toBeLessThanOrEqual(2);
    expect(focused.focusAreas).toEqual(['glutes_legs']);
    expect(count(focused) - count(base)).toBeLessThanOrEqual(MAX_ADDED_SETS);
    accessories.forEach((ex) => expect(FOCUS_AREAS.glutes_legs.accessories.gym.map((a) => a.name)).toContain(ex.name));
  });

  it('does not add volume when the region is already trained at the cap', () => {
    const plan = generatePlan(metrics({ experience: 'expert', focusAreas: ['glutes_legs', 'chest_arms'] }), 3, 'tr');
    const added = plan.workoutSplit.flatMap((day) => (day.exercises || []).filter((ex) => ex.focusArea || ex.focusBoost));
    expect(added.length).toBeLessThanOrEqual(2 * MAX_ADDED_SETS);
  });

  it('keeps home plans equipment-safe when focus accessories are added', () => {
    for (const environment of ['home_bodyweight', 'home_basic']) {
      const plan = generatePlan(metrics({ trainingEnvironment: environment, focusAreas: ['back_posture', 'core'], primaryGoal: 'fat_loss' }), 0, 'tr');
      expect(findHomeEquipmentViolations(plan.workoutSplit, environment)).toEqual([]);
      expect(plan.personalization.equipmentValidated).toBe(true);
      expect(plan.focusAreas).toEqual(['back_posture', 'core']);
    }
  });

  it('ignores focus areas for non-strength goals and empty input', () => {
    const yoga = generatePlan(metrics({ primaryGoal: 'yoga', focusAreas: ['core'] }), 0, 'tr');
    expect(yoga.focusAreas).toEqual([]);
    const split = generatePlan(metrics(), 0, 'tr').workoutSplit;
    expect(applyFocusEmphasis(split, [], 'gym')).toBe(split);
  });

  it('translates accessory names for English home plans', () => {
    const plan = localizePlan(generatePlan(metrics({ trainingEnvironment: 'home_bodyweight', focusAreas: ['shoulders'] }), 0, 'en'), 'en');
    const accessories = plan.workoutSplit.flatMap((day) => (day.exercises || []).filter((ex) => ex.focusArea));
    expect(accessories.length).toBeGreaterThan(0);
    accessories.forEach((ex) => expect(ex.name).not.toMatch(/[çğıöşüÇĞİÖŞÜ]/));
  });
});
