import { describe, expect, it } from 'vitest';
import { getWorkoutDayImage, MODULE_IMAGES } from './moduleAssets';

describe('moduleAssets', () => {
  it('replaces legacy strength images for non-strength modules', () => {
    expect(getWorkoutDayImage('fat_loss', '/images/workouts/legs.png')).toBe(MODULE_IMAGES.fat_loss);
    expect(getWorkoutDayImage('meditation', '/images/blog/sleep-recovery.jpg')).toBe(MODULE_IMAGES.meditation);
    expect(getWorkoutDayImage('reformer', '/images/workouts/back.png')).toBe(MODULE_IMAGES.reformer);
    expect(getWorkoutDayImage('pilates', '/images/workouts/back.png')).toBe(MODULE_IMAGES.pilates);
  });

  it('keeps muscle-group imagery inside muscle programs', () => {
    expect(getWorkoutDayImage('muscle', '/images/workouts/legs.png')).toBe('/images/workouts/legs.png');
    expect(getWorkoutDayImage('muscle')).toBe(MODULE_IMAGES.muscle);
  });
});
