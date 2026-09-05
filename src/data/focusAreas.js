// Optional "priority region" layer on top of the generated split.
//
// Regional muscle development is real; regional fat loss is not. The engine
// therefore adds a small, capped amount of extra volume for the chosen
// regions instead of building a region-only program, and the UI says so.

export const FOCUS_AREA_KEYS = ['glutes_legs', 'core', 'back_posture', 'chest_arms', 'shoulders'];
export const MAX_FOCUS_AREAS = 2;
export const TRAINING_DAY_OPTIONS = [3, 4, 5];

// A focus adds at most MAX_ADDED_SETS per week and never when the region
// already receives WEEKLY_SET_CAP hard sets from the base program.
export const WEEKLY_SET_CAP = 26;
export const MAX_ADDED_SETS = 6;

const gym = (name, reps, muscles) => ({ name, sets: 2, reps, rest: '60s', muscles, equipment: 'gym', difficulty: 2 });
const basic = (name, reps, muscles, equipment) => ({ name, sets: 2, reps, rest: '60s', muscles, equipment, difficulty: 2 });
const body = (name, reps, muscles, equipment = 'none') => ({ name, sets: 2, reps, rest: '45s', muscles, equipment, difficulty: 1 });

export const FOCUS_AREAS = {
  glutes_legs: {
    muscles: ['glutes', 'legs'],
    keywords: ['kalça', 'glute', 'bacak', 'arka bacak', 'ön bacak', 'leg'],
    accessories: {
      gym: [gym('Hip Thrust', '10-12', ['Kalça']), gym('Bulgarian Split Squat', '8-10/taraf', ['Ön Bacak', 'Kalça']), gym('Walking Lunges', '10/taraf', ['Ön Bacak', 'Kalça'])],
      home_basic: [basic('Dumbbell Glute Bridge', '12-15', ['Kalça', 'Arka Bacak'], 'dumbbell'), basic('Dumbbell Romanian Deadlift', '10-12', ['Arka Bacak', 'Kalça'], 'dumbbell'), basic('Dumbbell Step-Up', '8-10/taraf', ['Ön Bacak', 'Kalça'], 'dumbbell')],
      home_bodyweight: [body('Tek Bacak Glute Bridge', '10-12/taraf', ['Kalça', 'Arka Bacak']), body('Split Squat', '10-12/taraf', ['Ön Bacak', 'Kalça']), body('Glute Bridge March', '12-16', ['Kalça', 'Core'])],
    },
  },
  core: {
    muscles: ['core'],
    keywords: ['core', 'karın', 'abs'],
    accessories: {
      gym: [gym('Pallof Press', '10/taraf', ['Core']), gym('Hanging Leg Raise', '10-12', ['Core']), gym('Plank', '40-60 sn', ['Core'])],
      home_basic: [basic('Suitcase March', '30 sn/taraf', ['Core'], 'dumbbell'), body('Side Plank', '30-45 sn/taraf', ['Core']), body('Dead Bug', '8-10/taraf', ['Core'])],
      home_bodyweight: [body('Side Plank', '30-45 sn/taraf', ['Core']), body('Dead Bug', '8-10/taraf', ['Core']), body('Bird Dog', '8/taraf', ['Core', 'Kalça'])],
    },
  },
  back_posture: {
    muscles: ['back', 'rear_delt', 'trapez'],
    keywords: ['sırt', 'üst sırt', 'arka omuz', 'back', 'trapez'],
    accessories: {
      gym: [gym('Face Pull', '12-15', ['Arka Omuz', 'Üst Sırt']), gym('Chest-Supported Row', '10-12', ['Sırt']), gym('Reverse Pec Deck', '12-15', ['Arka Omuz'])],
      home_basic: [basic('Resistance Band Pull-Apart', '15-20', ['Arka Omuz', 'Üst Sırt'], 'resistance_band'), basic('Resistance Band Row', '12-15', ['Sırt'], 'resistance_band'), basic('Dumbbell Reverse Fly', '12-15', ['Arka Omuz'], 'dumbbell')],
      home_bodyweight: [body('Prone Y-T-W', '6/tip', ['Üst Sırt', 'Arka Omuz']), body('Yüzüstü Lat Çekiş', '12-15', ['Sırt', 'Arka Omuz']), body('Reverse Snow Angel', '10-12', ['Sırt', 'Arka Omuz'])],
    },
  },
  chest_arms: {
    muscles: ['chest', 'biceps', 'triceps'],
    keywords: ['göğüs', 'chest', 'biceps', 'triceps', 'kol'],
    accessories: {
      gym: [gym('Cable Flyes', '12-15', ['Göğüs']), gym('Barbell Curl', '10-12', ['Biceps']), gym('Triceps Pushdown', '12-15', ['Triceps'])],
      home_basic: [basic('Dumbbell Floor Press', '10-12', ['Göğüs', 'Triceps'], 'dumbbell'), basic('Dumbbell Curl', '10-12', ['Biceps'], 'dumbbell'), basic('Dumbbell Overhead Triceps Extension', '10-12', ['Triceps'], 'dumbbell')],
      home_bodyweight: [body('Dar Tutuş Diz Üstü Şınav', '8-12', ['Triceps', 'Göğüs']), body('Şınav', '8-12', ['Göğüs', 'Triceps']), body('Self-Resisted Biceps Curl', '10-12', ['Biceps'])],
    },
  },
  shoulders: {
    muscles: ['shoulder', 'rear_delt'],
    keywords: ['omuz', 'shoulder', 'delt'],
    accessories: {
      gym: [gym('Lateral Raise', '12-15', ['Omuz']), gym('Face Pull', '12-15', ['Arka Omuz', 'Üst Sırt']), gym('Rear Delt Fly', '12-15', ['Arka Omuz'])],
      home_basic: [basic('Dumbbell Lateral Raise', '12-15', ['Omuz'], 'dumbbell'), basic('Dumbbell Shoulder Press', '8-12', ['Omuz', 'Triceps'], 'dumbbell'), basic('Resistance Band Pull-Apart', '15-20', ['Arka Omuz', 'Üst Sırt'], 'resistance_band')],
      home_bodyweight: [body('Pike Şınav', '6-10', ['Omuz', 'Triceps']), body('Yüzüstü W İzometrik', '20-30 sn', ['Arka Omuz', 'Üst Sırt']), body('Prone Y-T-W', '6/tip', ['Üst Sırt', 'Arka Omuz'])],
    },
  },
};

export function normalizeFocusAreas(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((key) => FOCUS_AREA_KEYS.includes(key)))].slice(0, MAX_FOCUS_AREAS);
}

export function normalizeTrainingDays(value) {
  const days = Number(value);
  return TRAINING_DAY_OPTIONS.includes(days) ? days : null;
}

// Weekday slots used when the member asks for fewer training days than the
// phase template provides, so sessions stay spread across the week.
export const WEEK_SLOTS = { 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 4, 5] };
export const WEEKDAY_NAMES = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
