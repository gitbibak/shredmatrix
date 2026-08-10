export const MODULE_IMAGES = Object.freeze({
  muscle: '/images/modules/muscle-growth.jpg',
  fat_loss: '/images/modules/fat-loss.jpg',
  yoga: '/images/modules/yoga.jpg',
  meditation: '/images/modules/meditation.jpg',
  reformer: '/images/modules/reformer.jpg',
  pilates: '/images/modules/pilates.jpg',
});

export function getWorkoutDayImage(goalKey, dayImage) {
  if (goalKey === 'muscle' && dayImage) return dayImage;
  return MODULE_IMAGES[goalKey] || MODULE_IMAGES.muscle;
}
