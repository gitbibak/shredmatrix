// Marketing photos for the public landing page.
export const MODULE_IMAGES = Object.freeze({
  muscle: '/images/modules/muscle-growth.jpg',
  fat_loss: '/images/modules/fat-loss.jpg',
  yoga: '/images/modules/yoga.jpg',
  meditation: '/images/modules/meditation.jpg',
  reformer: '/images/modules/reformer.jpg',
  pilates: '/images/modules/pilates.jpg',
});

// Generated, figure-free artwork for the member's workout screen
// (scripts/generate-workout-art.mjs). No stock photos of people inside the app.
export const WORKOUT_ART = Object.freeze({
  chest: '/images/workout-art/chest.png',
  back: '/images/workout-art/back.png',
  legs: '/images/workout-art/legs.png',
  shoulders: '/images/workout-art/shoulders.png',
  full: '/images/workout-art/full.png',
  cardio: '/images/workout-art/cardio.png',
  core: '/images/workout-art/core.png',
  muscle: '/images/workout-art/muscle.png',
  fat_loss: '/images/workout-art/fat-loss.png',
  yoga: '/images/workout-art/yoga.png',
  meditation: '/images/workout-art/meditation.png',
  reformer: '/images/workout-art/reformer.png',
  pilates: '/images/workout-art/pilates.png',
});

const LEGACY_DAY_ART = {
  '/images/workouts/chest.png': WORKOUT_ART.chest,
  '/images/workouts/back.png': WORKOUT_ART.back,
  '/images/workouts/legs.png': WORKOUT_ART.legs,
  '/images/workouts/shoulders.png': WORKOUT_ART.shoulders,
};

function artForFocus(focus = '') {
  const text = String(focus).toLowerCase();
  if (/kardiyo|cardio|hiit|interval|yürüyüş|walk|caminata/.test(text)) return WORKOUT_ART.cardio;
  if (/core|karın|abdomen|abs/.test(text)) return WORKOUT_ART.core;
  if (/bacak|leg|pierna|glute|kalça|lower|alt vücut|tren inferior/.test(text)) return WORKOUT_ART.legs;
  if (/sırt|back|pull|espalda|tirón/.test(text)) return WORKOUT_ART.back;
  if (/omuz|shoulder|hombro/.test(text)) return WORKOUT_ART.shoulders;
  if (/göğüs|chest|push|pecho|empuje|upper|üst vücut|tren superior/.test(text)) return WORKOUT_ART.chest;
  if (/full|tüm vücut|cuerpo completo|total/.test(text)) return WORKOUT_ART.full;
  return null;
}

export function getWorkoutDayImage(goalKey, dayImage, focus) {
  if (['muscle', 'fat_loss'].includes(goalKey)) {
    if (dayImage && LEGACY_DAY_ART[dayImage]) return LEGACY_DAY_ART[dayImage];
    if (dayImage && dayImage.startsWith('/images/workout-art/')) return dayImage;
    return artForFocus(focus) || WORKOUT_ART[goalKey];
  }
  // Mind-body modules always use their own discipline artwork.
  return WORKOUT_ART[goalKey] || WORKOUT_ART.muscle;
}
