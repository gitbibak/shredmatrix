import { describe, expect, it } from 'vitest';
import { getWorkoutDayImage, WORKOUT_ART } from './moduleAssets';

describe('moduleAssets', () => {
  it('uses discipline artwork for mind-body modules regardless of legacy images', () => {
    expect(getWorkoutDayImage('meditation', '/images/blog/sleep-recovery.jpg')).toBe(WORKOUT_ART.meditation);
    expect(getWorkoutDayImage('reformer', '/images/workouts/back.png')).toBe(WORKOUT_ART.reformer);
    expect(getWorkoutDayImage('pilates', '/images/workouts/back.png')).toBe(WORKOUT_ART.pilates);
    expect(getWorkoutDayImage('yoga')).toBe(WORKOUT_ART.yoga);
  });

  it('maps legacy muscle-group photos to figure-free artwork', () => {
    expect(getWorkoutDayImage('muscle', '/images/workouts/legs.png')).toBe(WORKOUT_ART.legs);
    expect(getWorkoutDayImage('fat_loss', '/images/workouts/legs.png')).toBe(WORKOUT_ART.legs);
    expect(getWorkoutDayImage('muscle')).toBe(WORKOUT_ART.muscle);
  });

  it('picks artwork from the day focus in any language', () => {
    expect(getWorkoutDayImage('fat_loss', undefined, 'HIIT Kardiyo')).toBe(WORKOUT_ART.cardio);
    expect(getWorkoutDayImage('muscle', undefined, 'Pull — Espalda & Bíceps')).toBe(WORKOUT_ART.back);
    expect(getWorkoutDayImage('muscle', undefined, 'Full Body')).toBe(WORKOUT_ART.full);
  });

  it('never points at a stock photo of a person', () => {
    Object.values(WORKOUT_ART).forEach((path) => expect(path.startsWith('/images/workout-art/')).toBe(true));
  });
});
