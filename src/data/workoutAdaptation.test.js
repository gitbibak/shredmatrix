import { describe, expect, it } from 'vitest';
import { adaptNextWorkout, chooseAdaptation } from './workoutAdaptation';

const plan = {
  workoutSplit: [
    { focus: 'Push', exercises: [{ name: 'Push-up', sets: 4, reps: '8-10' }] },
    { focus: 'Pull', exercises: [{ name: 'Row', sets: 4, reps: '8-10' }, { name: 'Curl', sets: 3, reps: '10-12' }] },
  ],
};

describe('workout adaptation', () => {
  it('holds progression whenever pain is reported', () => {
    expect(chooseAdaptation({ painReported: true, perceivedExertion: 1, energyAfter: 3 }, [], 'muscle')).toBe('hold');
  });

  it('reduces the next session after high effort or low energy', () => {
    const action = chooseAdaptation({ painReported: false, perceivedExertion: 3, energyAfter: 2 }, [], 'muscle');
    const result = adaptNextWorkout(plan, 'Push', action, 'feedback-1');
    expect(result.plan.workoutSplit[1].exercises).toHaveLength(1);
    expect(result.plan.workoutSplit[1].exercises[0].sets).toBe(3);
  });

  it('only progresses after two comfortable high-energy sessions', () => {
    const action = chooseAdaptation(
      { painReported: false, perceivedExertion: 1, energyAfter: 3 },
      [{ perceived_exertion: 1, energy_after: 3, pain_reported: false }],
      'muscle',
    );
    const result = adaptNextWorkout(plan, 'Push', action, 'feedback-2');
    expect(result.plan.workoutSplit[1].exercises[0].reps).toBe('9-11');
  });
});
