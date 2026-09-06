/**
 * Full Balance — Plan Generator (Mock)
 * Her antrenman gününe özel beslenme programı + fiyat bilgisi.
 * İş programı: Değişken (bazen 14:00-18:00), Haftalık 4 gün antrenman.
 */

import { buildMealTemplates, dayLabelMap } from './mealDatabase';
import { calculateNutritionDays, recipeAllergens } from './recipeNutrition';
import { getWorkoutDayImage } from './moduleAssets';
import { buildHomeWorkoutProgram, findHomeEquipmentViolations } from './homeWorkoutPrograms';

// Plan şablonu versiyonu — egzersiz/beslenme değişikliklerinde artır
// App.jsx kaydedilmiş planın versiyonunu kontrol eder, eskiyse yeniden oluşturur
import { PLAN_VERSION } from './planVersion.js';
import { FOCUS_AREAS, MAX_ADDED_SETS, WEEK_SLOTS, WEEKDAY_NAMES, WEEKLY_SET_CAP, normalizeFocusAreas, normalizeTrainingDays } from './focusAreas.js';
export { PLAN_VERSION };

// ── Kalori Hesaplama ─────────────────────────────────────
function calculateBMR(weight, bodyFat, age, height, gender) {
  let mifflinBMR;
  if (gender === 'female') {
    mifflinBMR = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    mifflinBMR = 10 * weight + 6.25 * height - 5 * age + 5;
  }

  if (!Number.isFinite(bodyFat)) return mifflinBMR;
  const leanMass = weight * (1 - bodyFat / 100);
  return 370 + 21.6 * leanMass;
}

const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

// ── Makro Dağılımları ────────────────────────────────────
function calculateMacros(calories, goal, weight) {
  const proteinPerKg = {
    muscle: 1.8,
    fat_loss: 1.8,
    meditation: 1.2,
    yoga: 1.4,
    pilates: 1.5,
    reformer: 1.5,
  };
  const targetProtein = Math.round(weight * (proteinPerKg[goal] || 1.6));
  const protein = Math.min(targetProtein, Math.floor((calories * 0.35) / 4));
  const minimumFat = Math.round(weight * 0.8);
  const fat = Math.min(
    Math.max(minimumFat, Math.round((calories * 0.25) / 9)),
    Math.floor((calories * 0.35) / 9),
  );
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  return {
    protein,
    carbs,
    fat,
  };
}

const DAY_ENERGY_WEIGHTS = {
  upper: 1.02,
  shoulders: 1.02,
  back: 1.03,
  lower: 1.05,
  hiit: 1.04,
  active_rest: 0.98,
  rest: 0.94,
};

function buildDailyCalorieTargets(baseCalories, dayTypes) {
  const weights = dayTypes.map((type) => DAY_ENERGY_WEIGHTS[type] || 1);
  const averageWeight = weights.reduce((sum, value) => sum + value, 0) / Math.max(1, weights.length);
  return weights.map((weight) => Math.round((baseCalories * weight) / averageWeight));
}

// ── Öğün Veritabanı (Antrenman Tipine Göre — Dil Destekli) ──
function getMealTemplates(lang = 'tr') {
  return buildMealTemplates(lang);
}

// ── Gün → Öğün template eşleştirme ──────────────────────
function getDayMealType(dayFocus) {
  const f = dayFocus.toLowerCase();
  // Turkish + English + Spanish
  if (f.includes('göğüs') || f.includes('triceps') || f.includes('üst vücut') || f.includes('push') || f.includes('chest') || f.includes('upper')) return 'upper';
  if (f.includes('sırt') || f.includes('biceps') || f.includes('pull') || f.includes('back')) return 'back';
  if (f.includes('omuz') || f.includes('trapez') || f.includes('shoulder')) return 'shoulders';
  if (f.includes('bacak') || f.includes('core') || f.includes('alt vücut') || f.includes('leg') || f.includes('pierna')) return 'lower';
  if (f.includes('hiit') || f.includes('metabol') || f.includes('kardiyo') || f.includes('conditioning') || f.includes('cardio') || f.includes('metabolik')) return 'hiit';
  if (f.includes('aktif') || f.includes('toparlanma') || f.includes('active') || f.includes('recovery') || f.includes('recuper')) return 'active_rest';
  if (f.includes('dinlenme') || f.includes('rest') || f.includes('off') || f.includes('descanso')) return 'rest';
  return 'rest';
}
// ── Core Finisher — Rotasyonlu Karın Egzersizleri ──────────
const CORE_POOL = [
  // Category 0: Üst Karın
  [
    { name: 'Cable Crunch', sets: 3, reps: '15', rest: '45s' },
    { name: 'Weighted Crunch', sets: 3, reps: '12', rest: '45s' },
  ],
  // Category 1: Alt Karın
  [
    { name: 'Hanging Leg Raise', sets: 3, reps: '12', rest: '45s' },
    { name: 'Reverse Crunch', sets: 3, reps: '15', rest: '30s' },
  ],
  // Category 2: Oblikler
  [
    { name: 'Russian Twist', sets: 3, reps: '20', rest: '30s' },
    { name: 'Cable Woodchop', sets: 3, reps: '12/taraf', rest: '45s' },
  ],
  // Category 3: İzometrik
  [
    { name: 'Plank', sets: 3, reps: '45s', rest: '30s' },
    { name: 'Dead Bug', sets: 3, reps: '10/taraf', rest: '30s' },
  ],
];

const CORE_CATEGORY_LABELS = {
  tr: ['Üst Karın', 'Alt Karın', 'Oblikler', 'İzometrik'],
  en: ['Upper Abs', 'Lower Abs', 'Obliques', 'Isometric'],
  es: ['Abdominales Superiores', 'Abdominales Inferiores', 'Oblicuos', 'Isométricos'],
};

// Hedeflere göre kardiyo notu
const CARDIO_NOTES = {
  tr: {
    fat_loss_liss: '20-25 dk tempolu yürüyüş veya bisiklet önerilir',
    fat_loss_hiit: 'HIIT: 15 dk interval sprint (30s sprint / 60s yürüyüş)',
    muscle: '15 dk hafif tempolu yürüyüş (opsiyonel — kalp sağlığı için)',
  },
  en: {
    fat_loss_liss: '20-25 min brisk walk or cycling recommended',
    fat_loss_hiit: 'HIIT: 15 min interval sprint (30s sprint / 60s walk)',
    muscle: '15 min light walk (optional — for heart health)',
  },
  es: {
    fat_loss_liss: '20-25 min caminata rápida o ciclismo recomendado',
    fat_loss_hiit: 'HIIT: 15 min sprint intervalos (30s sprint / 60s caminata)',
    muscle: '15 min caminata ligera (opcional — para salud cardíaca)',
  },
};

function getCardioNote(goal, dayIndex, lang) {
  const notes = CARDIO_NOTES[lang] || CARDIO_NOTES.tr;
  if (goal === 'fat_loss') {
    // Intervals are programmed explicitly on the relevant day. Avoid adding a
    // second, context-free sprint prescription to every third strength day.
    return notes.fat_loss_liss;
  }
  if (goal === 'muscle') return notes.muscle;
  // meditation, yoga, pilates, reformer → no cardio
  return null;
}

// Goals that should NOT get core finisher (they have core built-in)
const SKIP_CORE_GOALS = new Set(['meditation', 'yoga', 'pilates', 'reformer']);

// ══════════════════════════════════════════════════════════════
// EGZERSİZ → KAS GRUBU EŞLEŞTİRME
// Her egzersizin çalıştırdığı birincil kas grupları
// ══════════════════════════════════════════════════════════════
const EXERCISE_MUSCLE_MAP = {
  // ── Göğüs ──
  'Bench Press': ['chest', 'triceps'], 'Incline Barbell Press': ['chest', 'shoulder'],
  'Incline Dumbbell Press': ['chest', 'shoulder'],
  'Dumbbell Bench Press': ['chest', 'triceps'], 'Decline Press': ['chest', 'triceps'],
  'Cable Flyes': ['chest'], 'Dumbbell Flyes': ['chest'],
  'Cable Crossover': ['chest'], 'Pec Deck': ['chest'],
  'Incline Smith Machine Press': ['chest', 'shoulder'],
  'Machine Chest Press': ['chest', 'triceps'],
  'DB Bench Press': ['chest', 'triceps'], 'Incline DB Press': ['chest', 'shoulder'],
  'Push-Up': ['chest', 'triceps'], 'Push-Up Variations': ['chest', 'triceps'],
  'Push-Up + Plyo Push-Up Combo': ['chest', 'triceps'],
  'Paused Bench Press (3s)': ['chest', 'triceps'],
  'Close Grip Floor Press': ['chest', 'triceps'],
  'Tempo Bench Press (3-1-3)': ['chest', 'triceps'],
  'Bench Press (Tempo: 3-0-1)': ['chest', 'triceps'],
  'Dumbbell Pullover': ['chest', 'back'],
  // ── Sırt ──
  'Deadlift': ['back', 'legs'], 'Deficit Deadlift': ['back', 'legs'],
  'Barbell Row': ['back', 'biceps'], 'T-Bar Row': ['back'],
  'Lat Pulldown': ['back', 'biceps'], 'Pull-Ups': ['back', 'biceps'],
  'Weighted Pull-Up': ['back', 'biceps'], 'Weighted Chin-Ups': ['back', 'biceps'],
  'Chin-Up': ['back', 'biceps'], 'Chin-Ups': ['back', 'biceps'],
  'Seated Cable Row': ['back'], 'Cable Row': ['back'],
  'Single Arm Dumbbell Row': ['back'], 'Dumbbell Row': ['back'],
  'Cable Pullover': ['back'], 'Pendlay Row': ['back'],
  'Meadows Row': ['back'], 'Kroc Row': ['back'],
  'Seal Row': ['back'], 'Chest-Supported Row': ['back'],
  'Straight Arm Pulldown': ['back'],
  'Reverse Pec Deck': ['rear_delt', 'back'], 'Reverse Fly': ['rear_delt', 'back'],
  'TRX Rows': ['back'], 'Ring Row': ['back'],
  'Renegade Row': ['back', 'core'], 'Barbell Row (Tempo: 3-0-1)': ['back'],
  'Pendlay Row (Strict)': ['back'],
  'Chest-Supported Shrug': ['back', 'trapez'],
  // ── Omuz ──
  'Military Press': ['shoulder', 'triceps'], 'Shoulder Press': ['shoulder', 'triceps'],
  'Dumbbell Shoulder Press': ['shoulder', 'triceps'],
  'Arnold Press': ['shoulder', 'triceps'], 'Push Press': ['shoulder', 'triceps'],
  'Lateral Raise': ['shoulder'], 'Cable Lateral Raise': ['shoulder'],
  'Front Raise': ['shoulder'], 'Face Pull': ['shoulder', 'rear_delt'],
  'Rear Delt Fly': ['rear_delt', 'shoulder'], 'Rear Delt Cable Fly': ['rear_delt', 'shoulder'],
  'Upright Row': ['shoulder', 'trapez'], 'Barbell Shrug': ['trapez'],
  'Shrug': ['trapez'], 'Shrug (Dropset)': ['trapez'],
  'DB Lateral Raise': ['shoulder'], 'Band Pull-Apart': ['rear_delt', 'shoulder'],
  'Landmine Press': ['shoulder', 'chest'],
  'Lateral Raise (light)': ['shoulder'],
  'Lateral Raise (21s Method)': ['shoulder'],
  'Lu Raise': ['shoulder'], 'Giant Set: Lateral Raise + Front Raise + Rear Delt': ['shoulder', 'rear_delt'],
  'OHP': ['shoulder', 'triceps'],
  // ── Triceps ──
  'Triceps Pushdown': ['triceps'], 'Overhead Triceps Extension': ['triceps'],
  'Skull Crushers': ['triceps'], 'Dips': ['chest', 'triceps'],
  'Weighted Dips': ['chest', 'triceps'], 'Triceps Dip': ['triceps'],
  'Close Grip Bench Press': ['triceps', 'chest'],
  'Cable Kickback (Dropset)': ['triceps'], 'JM Press': ['triceps'],
  'Overhead Cable Extension': ['triceps'], 'Rope Pushdown': ['triceps'],
  // ── Biceps ──
  'Barbell Curl': ['biceps'], 'Hammer Curl': ['biceps'],
  'Preacher Curl': ['biceps'], 'Incline Dumbbell Curl': ['biceps'],
  'EZ Bar Curl': ['biceps'], 'Reverse Curl': ['biceps', 'forearm'],
  'Concentration Curl (Dropset)': ['biceps'], 'Spider Curl': ['biceps'],
  'Bayesian Curl': ['biceps'], 'Cable Curl': ['biceps'],
  'Bicep Curl': ['biceps'],
  'Behind-the-Back Wrist Curl': ['forearm'],
  // ── Bacak ──
  'Squat': ['legs', 'glutes'], 'Back Squat': ['legs', 'glutes'],
  'Front Squat': ['legs'], 'Back Squat (RPE 9)': ['legs', 'glutes'],
  'Paused Front Squat': ['legs'], 'Back Squat (Pause)': ['legs', 'glutes'],
  'Hack Squat': ['legs'], 'Goblet Squat': ['legs', 'glutes'],
  'Barbell Squat': ['legs', 'glutes'], 'Jump Squat': ['legs', 'glutes'],
  'Tempo Squat (3-1-3)': ['legs', 'glutes'],
  'Romanian Deadlift': ['legs', 'glutes'], 'Sumo Deadlift': ['legs', 'glutes', 'back'],
  'Leg Press': ['legs'], 'Leg Extension': ['legs'],
  'Leg Curl': ['legs'], 'Lying Leg Curl': ['legs'],
  'Walking Lunges': ['legs', 'glutes'], 'Walking Dumbbell Lunge': ['legs', 'glutes'],
  'Bulgarian Split Squat': ['legs', 'glutes'], 'Reverse Lunge (Barbell)': ['legs', 'glutes'],
  'Jump Lunges': ['legs', 'glutes'], 'Lunge': ['legs', 'glutes'],
  'Hip Thrust': ['glutes'], 'Glute Bridge': ['glutes'],
  'Calf Raise': ['calves'], 'Standing Calf Raise (Dropset)': ['calves'],
  'Seated Calf Raise': ['calves'], 'Standing Single Leg Calf Raise': ['calves'],
  'Adductor Machine': ['legs'], 'Step-Ups': ['legs', 'glutes'],
  'Step-Up (low box)': ['legs', 'glutes'],
  'Nordic Hamstring Curl': ['legs'], 'Good Morning': ['legs', 'back'],
  'Glute Ham Raise': ['legs', 'glutes'],
  'Box Jump': ['legs'], 'Sissy Squat': ['legs'],
  'Wall Sit': ['legs'], 'Deadlift (Orta Ağırlık)': ['legs', 'back'],
  // ── Core ──
  'Plank': ['core'], 'Dead Bug': ['core'], 'Ab Wheel Rollout': ['core'],
  'Ab Wheel': ['core'], 'Pallof Press': ['core'],
  'Hanging Leg Raise': ['core'], 'Reverse Crunch': ['core'],
  'Russian Twist': ['core'], 'Cable Crunch': ['core'],
  'Weighted Crunch': ['core'], 'Cable Woodchop': ['core'],
  'V-Up': ['core'], 'Plank to Push-Up': ['core', 'chest'],
  'Plank Variations': ['core'], 'Sit-Up': ['core'],
  'Toes to Bar': ['core'], 'Mountain Climbers': ['core', 'full_body'],
  'Bear Crawl': ['core', 'full_body'],
  // ── Full Body / HIIT ──
  'Burpees': ['full_body'], 'Burpee': ['full_body'],
  'Kettlebell Swing': ['full_body', 'glutes'], 'Battle Ropes': ['full_body'],
  'Thrusters': ['full_body'], 'Thruster': ['full_body'],
  'Clean & Press': ['full_body'], 'Devil Press': ['full_body'],
  'Turkish Get-Up': ['full_body', 'core'],
  'Sled Push': ['full_body', 'legs'], 'Farmer Walk': ['full_body'],
  'Medicine Ball Slam': ['full_body'],
  'Burpee to Pull-Up': ['full_body'], 'Burpee Broad Jump': ['full_body'],
  'Dumbbell Snatch': ['full_body', 'shoulder'],
  'Wall Ball': ['full_body', 'legs'],
  'Plate Pinch + Farmer Walk': ['full_body', 'forearm'],
  'Ab Wheel + Pallof Press': ['core'],
  'Box Jump x30': ['legs'], 'Push-Up x30': ['chest', 'triceps'],
  'Kettlebell Swing x30': ['full_body'], 'Walking Lunge x30': ['legs', 'glutes'],
  'Burpee x20': ['full_body'],
  // ── Kardiyo Makineleri ──
  'Rowing Machine': ['full_body'], 'Assault Bike': ['full_body'],
  'Treadmill Sprint Intervals': ['full_body'], 'Sprint İntervalleri (Koşu Bandı)': ['full_body'],
  'Assault Bike Intervals': ['full_body'], 'Ski Erg Intervals': ['full_body'],
  'Jump Rope': ['full_body', 'calves'],
  'Battle Ropes (Tabata)': ['full_body'],
  // ── Aktif Dinlenme ──
  'Hafif Yürüyüş': ['active_rest'], 'Foam Rolling': ['active_rest'],
  'Foam Rolling & Stretching': ['active_rest'],
  'Yoga / Esneme': ['active_rest'], 'Stretching Routine': ['active_rest'],
  'Hafif Tempo Yürüyüş': ['active_rest'],
  'Hafif Yüzme veya Bisiklet': ['active_rest'], 'Hafif Yüzme': ['active_rest'],
  'Mobility Drill (Kalça + Omuz)': ['active_rest'],
  'Foam Rolling + Kontrast Duş': ['active_rest'],
  'Mobilite Çalışması': ['active_rest'], 'Soğuk / Sıcak Kontrast': ['active_rest'],
  'Tam Dinlenme': ['rest'],
};

// ══════════════════════════════════════════════════════════════
// FOCUS → İZİN VERİLEN KAS GRUPLARI
// Her antrenman focus alanının kabul ettiği kas grupları
// ══════════════════════════════════════════════════════════════
const FOCUS_ALLOWED_MUSCLES = {
  chest:    ['chest', 'triceps', 'shoulder', 'core'],
  back:     ['back', 'biceps', 'rear_delt', 'trapez', 'forearm', 'core'],
  shoulder: ['shoulder', 'rear_delt', 'triceps', 'biceps', 'trapez', 'core'],
  legs:     ['legs', 'glutes', 'calves', 'core', 'back'],
  push:     ['chest', 'shoulder', 'triceps', 'core'],
  pull:     ['back', 'biceps', 'rear_delt', 'trapez', 'forearm', 'core'],
  upper:    ['chest', 'back', 'shoulder', 'triceps', 'biceps', 'rear_delt', 'trapez', 'core'],
  hiit:     ['full_body', 'chest', 'back', 'shoulder', 'legs', 'glutes', 'core', 'triceps', 'biceps', 'calves'],
  full_body: ['full_body', 'chest', 'back', 'shoulder', 'legs', 'glutes', 'core', 'triceps', 'biceps', 'calves', 'trapez', 'rear_delt'],
  core:     ['core', 'full_body'],
  active_rest: ['active_rest', 'full_body', 'core'],
  rest:     ['rest'],
};

// Focus adından izin verilen kas grubunu belirle
function getFocusMuscleCategory(focusStr) {
  const f = focusStr.toLowerCase();
  if (f.includes('dinlenme') || f.includes('rest') || f.includes('off')) return 'rest';
  if (f.includes('aktif') || f.includes('toparlanma') || f.includes('recovery')) return 'active_rest';
  if (f.includes('full body') || f.includes('tam vücut') || f.includes('zayıf nokta') || f.includes('hybrid') || f.includes('conditioning') || f.includes('amrap')) return 'full_body';
  if (f.includes('hiit') || f.includes('metaboli') || f.includes('kardiyo') || f.includes('circuit') || f.includes('devre') || f.includes('emom') || f.includes('tabata')) return 'hiit';
  // Üst/Alt vücut günleri tek kas adı (göğüs/sırt/triceps...) içerse bile
  // çok-kaslıdır — bu yüzden push/pull ve tekil-kas kontrollerinden ÖNCE yakala.
  if (f.includes('üst vücut') || f.includes('upper')) return 'upper';
  if (f.includes('alt vücut') || f.includes('lower')) return 'legs';
  if (f.includes('push') && f.includes('pull')) return 'upper';
  if (f.includes('push') || (f.includes('göğüs') && f.includes('omuz') && f.includes('triceps'))) return 'push';
  if (f.includes('pull') || (f.includes('sırt') && f.includes('biceps'))) return 'pull';
  if (f.includes('göğüs') || f.includes('chest')) return 'chest';
  if (f.includes('sırt') || f.includes('back')) return 'back';
  if (f.includes('omuz') || f.includes('shoulder') || f.includes('trapez')) return 'shoulder';
  if (f.includes('bacak') || f.includes('leg') || f.includes('quad') || f.includes('hamstring') || f.includes('kalça') || f.includes('alt vücut') || f.includes('lower')) return 'legs';
  if (f.includes('üst vücut') || f.includes('upper')) return 'upper';
  if (f.includes('core') || f.includes('karın') || f.includes('abs')) return 'core';
  return 'full_body'; // fallback
}

// Egzersizin belirtilen focus alanına uygun olup olmadığını kontrol et
function isExerciseValidForFocus(exerciseName, focusCategory) {
  const allowed = FOCUS_ALLOWED_MUSCLES[focusCategory];
  if (!allowed) return true;
  const muscles = EXERCISE_MUSCLE_MAP[exerciseName];
  if (!muscles) return true; // tanımlanmamış egzersiz → kabul et
  return muscles.some(m => allowed.includes(m));
}

// ══════════════════════════════════════════════════════════════
// DENEYİM SEVİYESİ MODİFİYELERİ
// ══════════════════════════════════════════════════════════════
const EXPERIENCE_MODIFIERS = {
  beginner:     { setMult: 0.8,  repShift: 2, restAddSec: 15, maxExercises: 6, skipSupersets: true },
  intermediate: { setMult: 1.0,  repShift: 0, restAddSec: 0,  maxExercises: 7, skipSupersets: false },
  advanced:     { setMult: 1.1,  repShift: -1, restAddSec: -10, maxExercises: 8, skipSupersets: false },
  expert:       { setMult: 1.15, repShift: -1, restAddSec: -15, maxExercises: 9, skipSupersets: false },
};

function applyExperienceModifiers(exercises, experience, goal) {
  // Yoga/pilates/meditation/reformer için deneyim ayarı yapma
  if (['meditation', 'yoga', 'pilates', 'reformer'].includes(goal)) return exercises;

  const mod = EXPERIENCE_MODIFIERS[experience] || EXPERIENCE_MODIFIERS.intermediate;
  let result = exercises;

  // Süperset/Dropset filtreleme (beginner)
  if (mod.skipSupersets) {
    result = result.filter(ex => {
      const n = ex.name.toLowerCase();
      return !n.includes('süperset') && !n.includes('dropset') && !n.includes('giant set')
             && !n.includes('⚠️') && !n.includes('↻') && !n.includes('📝')
             && !n.includes('finisher:') && !n.includes('→ ardından');
    });
  }

  // Egzersiz sayısı limiti
  if (result.length > mod.maxExercises) {
    result = result.slice(0, mod.maxExercises);
  }

  // Set/rep/rest ayarlama
  return result.map(ex => {
    if (ex.sets === '-' || ex.sets === 1) return ex;
    const newSets = Math.max(2, Math.round((parseInt(ex.sets) || 3) * mod.setMult));
    let newReps = ex.reps;
    if (typeof ex.reps === 'string' && /^\d+(-\d+)?$/.test(ex.reps)) {
      const parts = ex.reps.split('-').map(Number);
      newReps = parts.length === 2
        ? `${Math.max(4, parts[0] + mod.repShift)}-${Math.max(6, parts[1] + mod.repShift)}`
        : `${Math.max(4, parts[0] + mod.repShift)}`;
    }
    let newRest = ex.rest;
    if (typeof ex.rest === 'string' && ex.rest.endsWith('s') && ex.rest !== '-') {
      const sec = parseInt(ex.rest) || 60;
      newRest = `${Math.max(15, sec + mod.restAddSec)}s`;
    }
    return { ...ex, sets: newSets, reps: newReps, rest: newRest };
  });
}

// ══════════════════════════════════════════════════════════════
// OTOMATİK FAZ SEÇİMİ
// Deneyim seviyesine göre başlangıç fazını belirle
// ══════════════════════════════════════════════════════════════
function getAutoPhase(experience, maxPhase) {
  const phaseMap = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 };
  return Math.min(phaseMap[experience] ?? 0, maxPhase);
}

// ══════════════════════════════════════════════════════════════
// EGZERSİZ DOĞRULAMA & DÜZELTME
// ══════════════════════════════════════════════════════════════

// Belirli kas grubu için yedek egzersiz havuzu
const FALLBACK_EXERCISES = {
  chest: [
    { name: 'Machine Chest Press', sets: 3, reps: '12', rest: '60s' },
    { name: 'Dumbbell Bench Press', sets: 4, reps: '10-12', rest: '75s' },
    { name: 'Cable Flyes', sets: 3, reps: '12-15', rest: '45s' },
  ],
  back: [
    { name: 'Lat Pulldown', sets: 4, reps: '10-12', rest: '75s' },
    { name: 'Seated Cable Row', sets: 3, reps: '12', rest: '60s' },
    { name: 'Dumbbell Row', sets: 3, reps: '10-12', rest: '60s' },
  ],
  shoulder: [
    { name: 'Lateral Raise', sets: 4, reps: '12-15', rest: '45s' },
    { name: 'Face Pull', sets: 3, reps: '15', rest: '45s' },
    { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', rest: '60s' },
  ],
  legs: [
    { name: 'Leg Press', sets: 4, reps: '12-15', rest: '75s' },
    { name: 'Leg Curl', sets: 3, reps: '12-15', rest: '45s' },
    { name: 'Calf Raise', sets: 3, reps: '15-20', rest: '30s' },
  ],
  triceps: [
    { name: 'Triceps Pushdown', sets: 3, reps: '12-15', rest: '45s' },
    { name: 'Overhead Triceps Extension', sets: 3, reps: '12', rest: '45s' },
  ],
  biceps: [
    { name: 'Hammer Curl', sets: 3, reps: '12-15', rest: '45s' },
    { name: 'Cable Curl', sets: 3, reps: '12', rest: '45s' },
  ],
};

function validateAndFixExercises(workoutSplit) {
  return workoutSplit.map(day => {
    if (!day.exercises || day.exercises.length === 0) return day;
    const focusCat = getFocusMuscleCategory(day.focus);
    if (focusCat === 'rest' || focusCat === 'active_rest' || focusCat === 'full_body' || focusCat === 'hiit') return day;

    const validExercises = [];
    const usedNames = new Set();

    for (const ex of day.exercises) {
      // Notlar/açıklamalar (⚠️, ↻, 📝) → olduğu gibi bırak
      if (ex.sets === '-' && (ex.name.includes('⚠️') || ex.name.includes('↻') || ex.name.includes('📝'))) {
        validExercises.push(ex);
        continue;
      }
      if (isExerciseValidForFocus(ex.name, focusCat) && !usedNames.has(ex.name)) {
        validExercises.push(ex);
        usedNames.add(ex.name);
      }
    }

    // En az 4 geçerli egzersiz olmalı, yoksa yedeklerden ekle
    if (validExercises.length < 4) {
      const allowed = FOCUS_ALLOWED_MUSCLES[focusCat] || [];
      for (const muscleGroup of allowed) {
        if (validExercises.length >= 5) break;
        const fallbacks = FALLBACK_EXERCISES[muscleGroup];
        if (!fallbacks) continue;
        for (const fb of fallbacks) {
          if (validExercises.length >= 5) break;
          if (!usedNames.has(fb.name)) {
            validExercises.push({ ...fb });
            usedNames.add(fb.name);
          }
        }
      }
    }

    return { ...day, exercises: validExercises };
  });
}

// ══════════════════════════════════════════════════════════════
// PROGRAM KALİTE KATMANI
// Her modül/faz için amaç, süre, ilerleme, regresyon ve güvenlik bilgisi.
// ══════════════════════════════════════════════════════════════
const PHASE_LABELS = ['Temel', 'Orta', 'İleri', 'Usta'];

const QUALITY_PROFILES = {
  muscle: [
    {
      difficulty: 'Temel',
      expectedDuration: '45-60 dk',
      weeklyTarget: '4 antrenman + 3 toparlanma günü',
      intensity: 'RPE 6-7',
      progressionRule: 'Tüm setlerde üst tekrar sınırına temiz formda çıkınca sonraki hafta ağırlığı %2-5 artır.',
      regressionOption: 'Serbest ağırlık zor gelirse makine veya vücut ağırlığı alternatifi kullan.',
      safetyNotes: 'Failure, dropset ve süperset yok; önce teknik ve düzen.',
    },
    {
      difficulty: 'Orta',
      expectedDuration: '55-70 dk',
      weeklyTarget: '5 antrenman + 2 toparlanma günü',
      intensity: 'RPE 7-8',
      progressionRule: 'Haftalık kas hacmini 8-12 kaliteli sete taşı, form bozulursa hacmi sabitle.',
      regressionOption: 'Yorgunluk artarsa son izolasyon hareketini çıkar.',
      safetyNotes: 'Aynı eklemi iki gün üst üste zorlayan ekstra set ekleme.',
    },
    {
      difficulty: 'İleri',
      expectedDuration: '60-75 dk',
      weeklyTarget: '6 antrenman + 1 tam dinlenme',
      intensity: 'RPE 7-9',
      progressionRule: 'Top set + back-off mantığı kullan; 4-6 haftada bir deload yap.',
      regressionOption: 'Uyku veya toparlanma düşükse ana hareket setini 1 azalt.',
      safetyNotes: 'Ağır omurga yükünü arka arkaya günlere ekleme.',
    },
    {
      difficulty: 'Usta',
      expectedDuration: '65-80 dk',
      weeklyTarget: '6 antrenman + zorunlu deload haftası',
      intensity: 'RPE 8-9 kontrollü',
      progressionRule: '3 hafta yüklen, 1 hafta deload; ileri teknikleri seans başına 1-2 hareketle sınırla.',
      regressionOption: 'Ağrı, düşük uyku veya performans düşüşünde hipertrofi versiyonuna dön.',
      safetyNotes: '7 sert gün yok; maksimum performans için toparlanma planın parçası.',
    },
  ],
  fat_loss: [
    {
      difficulty: 'Temel',
      expectedDuration: '35-50 dk',
      weeklyTarget: '3 güç + 2 düşük yoğunluk kardiyo + 2 dinlenme',
      intensity: 'Konuşabilecek tempo',
      progressionRule: 'Önce haftalık adım/kardiyo süresini artır; HIIT ekleme.',
      regressionOption: 'Nefes çok yükselirse tempolu yürüyüşe dön.',
      safetyNotes: 'Başlangıçta zıplama, burpee ve sprint zorunlu değil.',
    },
    {
      difficulty: 'Orta',
      expectedDuration: '45-60 dk',
      weeklyTarget: '3-4 güç + 2 kardiyo + 1 kısa interval',
      intensity: 'RPE 6-8',
      progressionRule: 'Güç hareketlerinde performansı koru, kardiyo süresini kademeli artır.',
      regressionOption: 'Bacak yorgunluğu varsa intervali LISS ile değiştir.',
      safetyNotes: 'Arka arkaya HIIT günü yok.',
    },
    {
      difficulty: 'İleri',
      expectedDuration: '50-65 dk',
      weeklyTarget: '4 güç + 2 LISS + maksimum 1 HIIT',
      intensity: 'RPE 7-8',
      progressionRule: 'Haftalık kondisyonu dalgalandır; her hafta daha sert yapma.',
      regressionOption: 'Uyku düşükse metabolik devreyi teknik güç gününe çevir.',
      safetyNotes: 'Yağ yakımı için toparlanma ve kas koruma öncelik.',
    },
    {
      difficulty: 'Usta',
      expectedDuration: '55-70 dk',
      weeklyTarget: 'Hybrid ama güç koruma merkezde',
      intensity: 'RPE 7-9 kontrollü',
      progressionRule: '3 hafta yoğunluk dalgası + 1 hafta düşük hacim uygula.',
      regressionOption: 'Nabız/yorgunluk yüksekse testi düşük yoğunluk kardiyoya indir.',
      safetyNotes: 'Her gün maksimum kondisyon testi yapılmaz.',
    },
  ],
  yoga: [
    {
      difficulty: 'Temel',
      expectedDuration: '25-40 dk',
      weeklyTarget: '4 pratik + 1 restoratif + 2 dinlenme',
      intensity: 'Rahat nefes',
      progressionRule: 'Poz süresini önce 15-30 sn artır, sonra akış sayısını artır.',
      regressionOption: 'Diz/kalça rahatsızlığında blok, yastık veya diz desteği kullan.',
      safetyNotes: 'Headstand, shoulder stand, lotus ve zorlayıcı nefes yok.',
    },
    {
      difficulty: 'Orta',
      expectedDuration: '35-50 dk',
      weeklyTarget: '5 pratik + 2 toparlanma',
      intensity: 'Kontrollü akış',
      progressionRule: 'Denge ve inversiyon hazırlığını duvar/destek ile ilerlet.',
      regressionOption: 'Baş dönmesi veya boyun baskısında inversiyon hazırlığını kaldır.',
      safetyNotes: 'İnversiyonlar hazırlık seviyesinde kalır; boyna yük bindirme.',
    },
    {
      difficulty: 'İleri',
      expectedDuration: '45-65 dk',
      weeklyTarget: '5 pratik + 1 restoratif + 1 dinlenme',
      intensity: 'RPE 6-8',
      progressionRule: 'İleri pozlar sadece ağrısız ve kontrollü hazırlık tamamlandıysa yapılır.',
      regressionOption: 'Her ileri poza hazırlık versiyonu ile başla.',
      safetyNotes: 'Derin backbend ve inversiyonlar opsiyonel ilerleme kabul edilir.',
    },
    {
      difficulty: 'Usta',
      expectedDuration: '55-75 dk',
      weeklyTarget: '6 pratik + 1 restoratif/dinlenme',
      intensity: 'Yüksek beceri, düşük ego',
      progressionRule: 'Beceri günlerini restoratif günlerle dengele.',
      regressionOption: 'Boyun, bilek veya bel sinyalinde hazırlık varyasyonuna dön.',
      safetyNotes: 'Nefes tutma ve ileri inversiyonlar güvenlik notuyla uygulanır.',
    },
  ],
  pilates: [
    {
      difficulty: 'Temel',
      expectedDuration: '25-40 dk',
      weeklyTarget: '3 temel seans + 1 mobilite + dinlenme',
      intensity: 'Kontrol odaklı',
      progressionRule: 'Önce nefes, pelvis ve omurga kontrolünü sabitle.',
      regressionOption: 'Boyun/bel zorlanırsa baş destekli veya küçük aralıkla çalış.',
      safetyNotes: 'Hız değil kontrol; ağrı varsa hareketi küçült.',
    },
    {
      difficulty: 'Orta',
      expectedDuration: '35-50 dk',
      weeklyTarget: '4 seans + 1 mobilite/toparlanma',
      intensity: 'Orta dayanıklılık',
      progressionRule: 'Tek taraflı ve anti-rotasyon hareketleri kademeli artır.',
      regressionOption: 'Form bozulursa tekrar sayısını azalt.',
      safetyNotes: 'Bel çukurunu kontrol edemediğin pozisyonu ilerletme.',
    },
    {
      difficulty: 'İleri',
      expectedDuration: '45-60 dk',
      weeklyTarget: '5 seans + 1 restoratif + 1 dinlenme',
      intensity: 'Yüksek kontrol',
      progressionRule: 'Akışları ancak geçişler temizse uzat.',
      regressionOption: 'Boyun/bilek rahatsızlığında destekli versiyona dön.',
      safetyNotes: 'İleri omurga fleksiyonu ve ters pozisyonlar zorunlu değildir.',
    },
    {
      difficulty: 'Usta',
      expectedDuration: '50-65 dk',
      weeklyTarget: '5-6 seans, koreografi + toparlanma dengesi',
      intensity: 'Master kontrol',
      progressionRule: 'Koreografiyi yoğunluk değil kalite üzerinden ilerlet.',
      regressionOption: 'Her akış için kısa teknik versiyon kullanılabilir.',
      safetyNotes: 'Master seviye bile ağrısız hareket standardına bağlı.',
    },
  ],
  reformer: [
    {
      difficulty: 'Temel',
      expectedDuration: '30-45 dk',
      weeklyTarget: '3 reformer temeli + 1 esneklik + dinlenme',
      intensity: 'Hafif-orta yay',
      progressionRule: 'Önce yay kontrolü ve carriage stabilitesi; sonra aralık artır.',
      regressionOption: 'Denge bozulursa yay direncini ve hareket aralığını düşür.',
      safetyNotes: 'Başlangıçta unstable ileri pozisyon, jump board ve inversiyon yok.',
    },
    {
      difficulty: 'Orta',
      expectedDuration: '40-55 dk',
      weeklyTarget: '4 reformer seansı + toparlanma',
      intensity: 'Orta yay, kontrollü tempo',
      progressionRule: 'Tek taraflı iş ve tempo kontrolünü kademeli artır.',
      regressionOption: 'Bel/diz sinyalinde kısa kutu veya destekli varyasyon kullan.',
      safetyNotes: 'Yay direnci kaliteyi bozuyorsa azaltılır.',
    },
    {
      difficulty: 'İleri',
      expectedDuration: '45-60 dk',
      weeklyTarget: '5 seans + 1 restoratif',
      intensity: 'İleri kontrol',
      progressionRule: 'Jump board sadece diz/bel şikayeti yoksa ve düşük hacimle eklenir.',
      regressionOption: 'Zıplama yerine footwork veya düşük etkili leg press kullan.',
      safetyNotes: 'İnversiyon ve unstable hareketler opsiyoneldir.',
    },
    {
      difficulty: 'Usta',
      expectedDuration: '50-70 dk',
      weeklyTarget: '5-6 seans + ekipman uygunluğu kontrolü',
      intensity: 'Master akış',
      progressionRule: 'Repertoire genişletme ekipman ve teknik uygunlukla yapılır.',
      regressionOption: 'Tower/Cadillac yoksa reformer-only master akış uygulanır.',
      safetyNotes: 'Ekipman seçimi doğrulanmadan farklı cihaz hareketi verilmez.',
    },
  ],
  meditation: [
    {
      difficulty: 'Temel',
      expectedDuration: '5-10 dk',
      weeklyTarget: '5 kısa pratik + 2 serbest gün',
      intensity: 'Kolay başla',
      progressionRule: 'Her hafta 1-2 dk ekle; süre değil düzen kazan.',
      regressionOption: 'Zorlanırsan 3 dk nefes sayımı yap.',
      safetyNotes: 'Nefes tutma veya zorlayıcı teknik yok.',
    },
    {
      difficulty: 'Orta',
      expectedDuration: '10-20 dk',
      weeklyTarget: '5 pratik + 1 yürüyüş meditasyonu',
      intensity: 'Sürdürülebilir',
      progressionRule: 'Odak süresini artır, farklı tekniği aynı gün yığma.',
      regressionOption: 'Zihin çok dağınıksa rehberli beden taramasına dön.',
      safetyNotes: 'Baş dönmesi olursa nefes tekniğini bırak.',
    },
    {
      difficulty: 'İleri',
      expectedDuration: '20-30 dk',
      weeklyTarget: '5 uzun pratik + 1 restoratif',
      intensity: 'Derinleşme',
      progressionRule: 'Açık farkındalık ve yürüyüş meditasyonunu dönüşümlü kullan.',
      regressionOption: 'Duygusal yoğunluk artarsa kısa güvenli nefese dön.',
      safetyNotes: 'Zorlayıcı nefes tutmalar günlük rutin yapılmaz.',
    },
    {
      difficulty: 'Usta',
      expectedDuration: '30-45 dk',
      weeklyTarget: 'Uzun oturum + toparlayıcı kısa pratikler',
      intensity: 'İleri farkındalık',
      progressionRule: 'Uzun oturumları toparlayıcı günlerle dengele.',
      regressionOption: 'Uykusuz veya stresli günlerde 10 dk beden taraması yap.',
      safetyNotes: 'Nefes retansiyonu ve uzun sessizlik herkes için uygun değildir.',
    },
  ],
};

const QUALITY_FALLBACK_EXERCISES = {
  fatLossBeginnerStrength: [
    { name: 'Goblet Squat / Chair Squat', sets: 3, reps: '10-12', rest: '75s' },
    { name: 'Incline Push-Up', sets: 3, reps: '8-12', rest: '60s' },
    { name: 'Dumbbell Row', sets: 3, reps: '10-12', rest: '60s' },
    { name: 'Glute Bridge', sets: 3, reps: '12-15', rest: '45s' },
    { name: 'Tempolu Yürüyüş', sets: 1, reps: '20 dk', rest: '-' },
  ],
  fatLossLiss: [
    { name: 'Tempolu Yürüyüş veya Bisiklet', sets: 1, reps: '30-40 dk', rest: '-' },
    { name: 'Mobilite Akışı', sets: 1, reps: '10 dk', rest: '-' },
  ],
  yogaFoundation: [
    { name: 'Dolphin Pose Prep', sets: 3, reps: '20s', rest: '30s' },
    { name: 'Wall Shoulder Opener', sets: 2, reps: '45s', rest: '20s' },
    { name: 'Legs Up The Wall', sets: 1, reps: '4 dk', rest: '-' },
  ],
  reformerFoundation: [
    { name: 'Footwork (Paralel, hafif yay)', sets: 3, reps: '10', rest: '30s' },
    { name: 'Pelvic Curl on Reformer', sets: 3, reps: '8', rest: '30s' },
    { name: 'Arm Straps Supine', sets: 3, reps: '10', rest: '30s' },
    { name: 'Knee Stretch Prep', sets: 2, reps: '8', rest: '30s' },
  ],
  reformerMasterOnly: [
    { name: 'Advanced Footwork Flow', sets: 1, reps: '12 dk', rest: '-' },
    { name: 'Long Box Pulling Straps', sets: 3, reps: '10', rest: '30s' },
    { name: 'Side Split Control', sets: 3, reps: '8/taraf', rest: '45s' },
    { name: 'Semi Circle Prep', sets: 3, reps: '6', rest: '45s' },
  ],
};

const UNSAFE_YOGA_FOUNDATION = [
  'headstand', 'sirsasana', 'shoulder stand', 'sarvangasana', 'handstand',
  'lotus', 'kapalabhati', 'kumbhaka', 'scorpion',
];

const UNSAFE_REFORMER_FOUNDATION = [
  'short spine', 'snake', 'control balance', 'headstand', 'jump', 'plyometric',
  'tower', 'cadillac', 'wunda chair',
];

const FAT_LOSS_BEGINNER_HIGH_IMPACT = [
  'burpee', 'box jump', 'jump lunge', 'jump squat', 'sprint', 'battle ropes',
  'thruster', 'devil press', 'emom', 'amrap', 'assault bike', 'tabata',
];

const UNSUPERVISED_YOGA_EXTREME = [
  'headstand', 'sirsasana', 'handstand', 'scorpion', 'forearm stand', 'pincha mayurasana',
  'peacock', 'mayurasana', 'flying pigeon', 'kumbhaka', 'bandha', 'kapalabhati',
];

const PILATES_LEVEL_LIMITS = {
  0: ['roll up', 'rolling like a ball', 'teaser', 'criss cross', 'double leg stretch', 'pilates push-up'],
  1: ['jackknife', 'neck pull', 'control balance', 'boomerang', 'open leg rocker'],
};

const PILATES_FOUNDATION = [
  { name: 'Neutral Pelvis Breathing', sets: 2, reps: '6 nefes', rest: '20s' },
  { name: 'Knee Fold', sets: 3, reps: '8/taraf', rest: '20s' },
  { name: 'Toe Tap Prep', sets: 3, reps: '8/taraf', rest: '30s' },
  { name: 'Pelvic Curl', sets: 3, reps: '10', rest: '30s' },
  { name: 'Bird Dog Prep', sets: 3, reps: '8/taraf', rest: '30s' },
];

const PILATES_INTERMEDIATE = [
  { name: 'Chest Lift', sets: 3, reps: '10', rest: '30s' },
  { name: 'Single Leg Stretch Prep', sets: 3, reps: '8/taraf', rest: '20s' },
  { name: 'Side Kick Front-Back', sets: 3, reps: '8/taraf', rest: '20s' },
  { name: 'Shoulder Bridge', sets: 3, reps: '8', rest: '30s' },
  { name: 'Modified Side Plank', sets: 3, reps: '20s/taraf', rest: '30s' },
];

const SAFE_YOGA_SKILL_PREP = [
  { name: 'Dolphin Pose Prep', sets: 3, reps: '20s', rest: '30s' },
  { name: 'Wall Shoulder Opener', sets: 2, reps: '45s', rest: '20s' },
  { name: 'Supported Bridge', sets: 2, reps: '45s', rest: '30s' },
  { name: 'Legs Up The Wall', sets: 1, reps: '4 dk', rest: '-' },
];

const MEDITATION_SAFE_PRACTICES = [
  ['Nefes Sayımı', 'Kısa Vücut Taraması', 'Farkındalık Yürüyüşü', 'Şefkat Meditasyonu', 'Rehberli Görselleştirme', 'Şükran Pratiği'],
  ['Nefes Farkındalığı', 'Vücut Taraması', 'Farkındalık Yürüyüşü', 'Sevgi-Şefkat Meditasyonu', 'Açık Farkındalık', 'Yoga Nidra'],
  ['Açık Farkındalık', 'Uzun Vücut Taraması', 'Farkındalık Yürüyüşü', 'Sevgi-Şefkat Meditasyonu', 'Duygu Gözlemi', 'Yoga Nidra'],
  ['Sessiz Farkındalık Oturumu', 'Açık Farkındalık', 'Yürüyüş Meditasyonu', 'Şefkat Meditasyonu', 'Öz-Sorgulama', 'Yoga Nidra'],
];

const REFORMER_REMOTE_EXTREME = [
  'long spine', 'snake', 'control balance', 'headstand', 'russian split', 'star',
  'high bridge', 'tendon stretch', 'semi circle', 'horseback',
];

function applyHomeCoreEnvironment(workoutSplit, environment) {
  if (environment === 'gym') return workoutSplit;
  const pools = environment === 'home_basic'
    ? [
      [{ name: 'Dumbbell Dead Bug', sets: 3, reps: '8/taraf', rest: '45s', muscles: ['Core'], equipment: 'dumbbell' }],
      [{ name: 'Reverse Crunch', sets: 3, reps: '10-15', rest: '45s', muscles: ['Core'], equipment: 'none' }],
      [{ name: 'Suitcase March', sets: 3, reps: '30 sn/taraf', rest: '45s', muscles: ['Core'], equipment: 'dumbbell' }],
      [{ name: 'Plank', sets: 3, reps: '30-45 sn', rest: '45s', muscles: ['Core'], equipment: 'none' }],
    ]
    : [
      [{ name: 'Dead Bug', sets: 3, reps: '8/taraf', rest: '45s', muscles: ['Core'], equipment: 'none' }],
      [{ name: 'Reverse Crunch', sets: 3, reps: '10-15', rest: '45s', muscles: ['Core'], equipment: 'none' }],
      [{ name: 'Side Plank', sets: 3, reps: '20-30 sn/taraf', rest: '45s', muscles: ['Core'], equipment: 'none' }],
      [{ name: 'Bird Dog', sets: 3, reps: '8/taraf', rest: '45s', muscles: ['Core'], equipment: 'none' }],
    ];
  let index = 0;
  return workoutSplit.map((day) => {
    if (isRestLikeDay(day) || !day.coreFinisher) return day;
    const next = { ...day, coreFinisher: pools[index % pools.length].map((item) => ({ ...item })) };
    index += 1;
    return next;
  });
}

function limitFatLossIntensity(workoutSplit, phase) {
  let intenseDays = 0;
  return workoutSplit.map((day, index) => {
    if (isRestLikeDay(day)) return day;
    const text = `${day.focus || ''} ${(day.exercises || []).map((exercise) => exercise.name).join(' ')}`;
    const isIntense = /hiit|sprint|tabata|amrap|emom|metabolik|conditioning|circuit|interval|burpee|box jump|jump lunge|jump squat/i.test(text);
    if (!isIntense) return day;
    intenseDays += 1;
    if (phase > 0 && intenseDays === 1) return day;
    const useStrength = index % 2 === 0;
    return {
      ...day,
      focus: useStrength ? 'Tam Vücut Kuvvet + Kolay Kardiyo' : 'Düşük Yoğunluk Kardiyo + Mobilite',
      emoji: useStrength ? '💪' : '🚶',
      exercises: (useStrength ? QUALITY_FALLBACK_EXERCISES.fatLossBeginnerStrength : QUALITY_FALLBACK_EXERCISES.fatLossLiss)
        .map((exercise) => ({ ...exercise })),
    };
  });
}

function getQualityProfile(goal, phase) {
  const profiles = QUALITY_PROFILES[goal] || QUALITY_PROFILES.muscle;
  return profiles[Math.max(0, Math.min(phase, profiles.length - 1))];
}

function isRestLikeDay(day) {
  const focus = day.focus?.toLowerCase() || '';
  return /(^|\s|\/)(dinlenme|rest|off|descanso)(\s|$|\/)/i.test(focus);
}

function exerciseNameIncludes(exercise, keywords) {
  const name = exercise.name?.toLowerCase() || '';
  return keywords.some((keyword) => name.includes(keyword));
}

function inferDayGoal(day, goal) {
  const focus = day.focus?.toLowerCase() || '';
  if (isRestLikeDay(day)) return 'Toparlanma';
  if (goal === 'meditation') return 'Zihinsel toparlanma';
  if (goal === 'yoga') return focus.includes('restore') || focus.includes('restoratif') ? 'Restoratif mobilite' : 'Mobilite + denge';
  if (goal === 'pilates') return focus.includes('core') ? 'Core kontrolü' : 'Kontrollü kuvvet';
  if (goal === 'reformer') return 'Reformer kontrolü';
  if (goal === 'fat_loss') {
    if (focus.includes('kardiyo') || focus.includes('cardio')) return 'Kondisyon';
    if (focus.includes('toparlanma')) return 'Aktif toparlanma';
    return 'Kas koruma + enerji harcaması';
  }
  if (focus.includes('güç') || focus.includes('strength')) return 'Kuvvet';
  if (focus.includes('hipertrofi')) return 'Hipertrofi';
  return 'Kas gelişimi';
}

function getWarmup(goal, phase, day) {
  if (isRestLikeDay(day)) return '5-10 dk rahat yürüyüş veya nefes + mobilite';
  if (goal === 'meditation') return '1 dk rahat oturuş, burundan sakin nefes';
  if (goal === 'yoga') return phase < 2 ? 'Eklem daireleri + cat-cow + 3 sakin nefes' : 'Eklem hazırlığı + bilek/omuz/kalça aktivasyonu';
  if (goal === 'pilates') return 'Nefes, pelvis nötrleme ve 3 dk omurga mobilizasyonu';
  if (goal === 'reformer') return 'Yay kontrolü, carriage stabilitesi ve hafif footwork';
  if (goal === 'fat_loss') return phase === 0 ? '5 dk tempolu yürüyüş + temel eklem mobilitesi' : '5-8 dk düşük tempo kardiyo + dinamik mobilite';
  return '5-8 dk hafif kardiyo + çalışılacak ekleme özel ısınma setleri';
}

function getCooldown(goal, day) {
  if (isRestLikeDay(day)) return 'Erken uyku, hafif yürüyüş ve su hedefini tamamla.';
  if (goal === 'meditation') return 'Son 1 dk nefesi doğal bırak, kısa not al.';
  if (goal === 'yoga') return 'Savasana veya legs up the wall ile 3-5 dk bitir.';
  if (goal === 'pilates' || goal === 'reformer') return 'Child pose, mermaid veya nazik omurga rotasyonu ile bitir.';
  if (goal === 'fat_loss') return '5 dk düşük tempo yürüyüş ve burundan nefesle nabzı düşür.';
  return 'Hafif esneme + 5 dk düşük tempo yürüyüş.';
}

function applyEvidenceBasedExerciseSafety(day, goal, phase) {
  let nextDay = { ...day, exercises: [...(day.exercises || [])] };
  if (isRestLikeDay(nextDay)) return nextDay;

  if (goal === 'fat_loss' && phase === 0) {
    const hasHighImpact = nextDay.exercises.some((exercise) => exerciseNameIncludes(exercise, FAT_LOSS_BEGINNER_HIGH_IMPACT))
      || /hiit|sprint|conditioning|metabolik/i.test(nextDay.focus || '');
    if (hasHighImpact) {
      const isCardioDay = /kardiyo|cardio|conditioning|metabolik|hiit/i.test(nextDay.focus || '');
      nextDay = {
        ...nextDay,
        focus: isCardioDay ? 'Düşük Yoğunluk Kardiyo + Mobilite' : 'Temel Güç + Düşük Yoğunluk Kardiyo',
        emoji: isCardioDay ? '🚶' : nextDay.emoji,
        exercises: isCardioDay
          ? QUALITY_FALLBACK_EXERCISES.fatLossLiss.map((exercise) => ({ ...exercise }))
          : QUALITY_FALLBACK_EXERCISES.fatLossBeginnerStrength.map((exercise) => ({ ...exercise })),
      };
    }
  }

  if (goal === 'yoga' && phase <= 1) {
    const filtered = nextDay.exercises.filter((exercise) => !exerciseNameIncludes(exercise, UNSAFE_YOGA_FOUNDATION));
    if (filtered.length !== nextDay.exercises.length) {
      nextDay = {
        ...nextDay,
        focus: nextDay.focus.replace('İnversiyon Hazırlık', 'Omuz Stabilitesi + Güvenli Ters Duruş Hazırlığı'),
        exercises: [
          ...filtered,
          ...QUALITY_FALLBACK_EXERCISES.yogaFoundation.map((exercise) => ({ ...exercise })),
        ].slice(0, Math.max(4, filtered.length)),
      };
    }
  }

  if (goal === 'yoga') {
    const filtered = nextDay.exercises.filter((exercise) => !exerciseNameIncludes(exercise, UNSUPERVISED_YOGA_EXTREME));
    if (filtered.length !== nextDay.exercises.length) {
      nextDay = {
        ...nextDay,
        focus: 'Güvenli Beceri Hazırlığı + Mobilite',
        exercises: [...filtered, ...SAFE_YOGA_SKILL_PREP.map((exercise) => ({ ...exercise }))].slice(0, 5),
      };
    }
    if ((nextDay.exercises || []).some((exercise) => /90 dk/i.test(exercise.reps || ''))) {
      nextDay.exercises = [{ name: 'Kişisel Vinyasa Akışı', sets: 1, reps: '45 dk', rest: '-' }];
    }
  }

  if (goal === 'pilates' && phase <= 1) {
    const blocked = PILATES_LEVEL_LIMITS[phase];
    const filtered = nextDay.exercises.filter((exercise) => !exerciseNameIncludes(exercise, blocked));
    if (filtered.length !== nextDay.exercises.length || filtered.length < 3) {
      const fallback = phase === 0 ? PILATES_FOUNDATION : PILATES_INTERMEDIATE;
      nextDay = {
        ...nextDay,
        focus: phase === 0 ? 'Pilates Temeli + Core Kontrolü' : 'Kontrollü Mat Pilates',
        exercises: [...filtered, ...fallback.map((exercise) => ({ ...exercise }))].slice(0, 5),
      };
    }
  }

  if (goal === 'meditation') {
    const dayIndex = ['Pazartesi', 'Salı', 'Çarşamba', 'Cuma', 'Cumartesi', 'Pazar'].indexOf(nextDay.day);
    const practiceIndex = dayIndex < 0 ? 0 : dayIndex;
    const durations = ['8 dk', '15 dk', '25 dk', '35 dk'];
    nextDay = {
      ...nextDay,
      exercises: [{
        name: MEDITATION_SAFE_PRACTICES[phase][practiceIndex % MEDITATION_SAFE_PRACTICES[phase].length],
        sets: 1,
        reps: durations[phase],
        rest: '-',
      }],
    };
  }

  if (goal === 'reformer') {
    if (phase === 0) {
      const filtered = nextDay.exercises.filter((exercise) => !exerciseNameIncludes(exercise, UNSAFE_REFORMER_FOUNDATION));
      if (filtered.length !== nextDay.exercises.length || filtered.length < 4) {
        nextDay = {
          ...nextDay,
          focus: nextDay.focus.replace('Core & Tam Vücut', 'Core Kontrol + Reformer Temeli'),
          exercises: [
            ...filtered,
            ...QUALITY_FALLBACK_EXERCISES.reformerFoundation.map((exercise) => ({ ...exercise })),
          ].slice(0, 5),
        };
      }
    }
    if (phase > 0) {
      const filtered = nextDay.exercises.filter((exercise) => !exerciseNameIncludes(exercise, REFORMER_REMOTE_EXTREME));
      if (filtered.length !== nextDay.exercises.length) {
        nextDay = {
          ...nextDay,
          focus: 'Kontrollü Reformer Progresyonu',
          exercises: [
            ...filtered,
            ...QUALITY_FALLBACK_EXERCISES.reformerMasterOnly.map((exercise) => ({ ...exercise })),
          ].slice(0, 5),
        };
      }
    }
    if (phase === 3 && /tower|cadillac|wunda/i.test(nextDay.focus || '')) {
      nextDay = {
        ...nextDay,
        focus: 'Reformer-Only Master Kontrol',
        emoji: '🏆',
        exercises: QUALITY_FALLBACK_EXERCISES.reformerMasterOnly.map((exercise) => ({ ...exercise })),
      };
    }
  }

  return nextDay;
}

function enhanceWorkoutQuality(workoutSplit, goal, phase) {
  const standardizedSplit = goal === 'fat_loss' ? limitFatLossIntensity(workoutSplit, phase) : workoutSplit;
  const profile = getQualityProfile(goal, phase);
  return standardizedSplit.map((day) => {
    const safeDay = applyEvidenceBasedExerciseSafety(day, goal, phase);
    const restDay = isRestLikeDay(safeDay);
    return {
      ...safeDay,
      isRest: restDay,
      quality: {
        goal: inferDayGoal(safeDay, goal),
        difficulty: profile.difficulty,
        expectedDuration: restDay ? '10-30 dk opsiyonel toparlanma' : profile.expectedDuration,
        intensity: restDay ? 'Çok hafif' : profile.intensity,
        warmup: getWarmup(goal, phase, safeDay),
        cooldown: getCooldown(goal, safeDay),
        progressionRule: profile.progressionRule,
        regressionOption: profile.regressionOption,
        safetyNotes: profile.safetyNotes,
      },
    };
  });
}

function buildPlanQualitySummary(goal, phase) {
  const profile = getQualityProfile(goal, phase);
  return {
    phaseName: PHASE_LABELS[phase] || profile.difficulty,
    weeklyTarget: profile.weeklyTarget,
    intensity: profile.intensity,
    progressionRule: profile.progressionRule,
    regressionOption: profile.regressionOption,
    safetyNotes: profile.safetyNotes,
  };
}

// ══════════════════════════════════════════════════════════════
// SAĞLIK DURUMU EGZERSİZ FİLTRELERİ (Aynı kas grubu alternatifleri)
// ══════════════════════════════════════════════════════════════
const HEALTH_EXERCISE_FILTERS = {
  back_pain: {
    exclude: ['Deadlift', 'Romanian Deadlift', 'Barbell Row', 'Good Morning', 'Back Extension', 'Deficit Deadlift', 'Pendlay Row', 'Sumo Deadlift'],
    replace: {
      'Deadlift': { name: 'Lat Pulldown', sets: 4, reps: '10-12', rest: '75s' },
      'Deficit Deadlift': { name: 'Lat Pulldown', sets: 4, reps: '10-12', rest: '75s' },
      'Romanian Deadlift': { name: 'Leg Curl', sets: 4, reps: '12-15', rest: '60s' },
      'Barbell Row': { name: 'Seated Cable Row', sets: 4, reps: '10-12', rest: '75s' },
      'Good Morning': { name: 'Leg Curl', sets: 3, reps: '12-15', rest: '45s' },
      'Pendlay Row': { name: 'Seated Cable Row', sets: 4, reps: '10-12', rest: '75s' },
      'Sumo Deadlift': { name: 'Hip Thrust', sets: 4, reps: '10-12', rest: '75s' },
    },
  },
  knee_issue: {
    exclude: ['Squat', 'Back Squat', 'Front Squat', 'Leg Extension', 'Jump Squat', 'Box Jump', 'Walking Lunges', 'Lunge', 'Jump Lunges', 'Bulgarian Split Squat', 'Hack Squat', 'Sissy Squat'],
    replace: {
      'Squat': { name: 'Leg Press (hafif)', sets: 3, reps: '15', rest: '60s' },
      'Back Squat': { name: 'Leg Press (hafif)', sets: 3, reps: '15', rest: '60s' },
      'Front Squat': { name: 'Leg Press (hafif)', sets: 3, reps: '15', rest: '60s' },
      'Leg Extension': { name: 'Leg Curl', sets: 3, reps: '12-15', rest: '45s' },
      'Walking Lunges': { name: 'Step-Up (low box)', sets: 3, reps: '10/bacak', rest: '60s' },
      'Jump Squat': { name: 'Glute Bridge', sets: 3, reps: '15', rest: '45s' },
      'Box Jump': { name: 'Step-Up (low box)', sets: 3, reps: '10/bacak', rest: '60s' },
      'Bulgarian Split Squat': { name: 'Hip Thrust', sets: 3, reps: '12', rest: '60s' },
    },
  },
  shoulder_injury: {
    exclude: ['Military Press', 'Overhead Press', 'Upright Row', 'Behind Neck Press', 'Arnold Press', 'Push Press', 'OHP'],
    replace: {
      'Military Press': { name: 'Landmine Press', sets: 4, reps: '10-12', rest: '75s' },
      'Overhead Press': { name: 'Landmine Press', sets: 4, reps: '10-12', rest: '75s' },
      'Arnold Press': { name: 'Landmine Press', sets: 4, reps: '10-12', rest: '75s' },
      'Upright Row': { name: 'Lateral Raise (light)', sets: 3, reps: '15-20', rest: '45s' },
      'Push Press': { name: 'Landmine Press', sets: 4, reps: '10-12', rest: '75s' },
      'OHP': { name: 'Landmine Press', sets: 3, reps: '10-12', rest: '75s' },
    },
  },
  wrist_issue: {
    exclude: ['Barbell Curl', 'Push-Up', 'Plank', 'Push-Up Variations'],
    replace: {
      'Barbell Curl': { name: 'Hammer Curl', sets: 3, reps: '12-15', rest: '45s' },
      'Push-Up': { name: 'Machine Chest Press', sets: 3, reps: '12-15', rest: '60s' },
      'Push-Up Variations': { name: 'Machine Chest Press', sets: 3, reps: '12-15', rest: '60s' },
      'Plank': { name: 'Dead Bug', sets: 3, reps: '10/taraf', rest: '30s' },
    },
  },
  heart_condition: {
    exclude: ['Burpees', 'Burpee', 'Box Jump', 'Battle Ropes', 'Sprint', 'Treadmill Sprint Intervals', 'Jump Squat', 'Jump Lunges', 'Battle Ropes (Tabata)'],
    replace: {
      'Burpees': { name: 'Goblet Squat', sets: 3, reps: '12', rest: '60s' },
      'Burpee': { name: 'Goblet Squat', sets: 3, reps: '12', rest: '60s' },
      'Box Jump': { name: 'Step-Up (low box)', sets: 3, reps: '10/bacak', rest: '60s' },
      'Battle Ropes': { name: 'Seated Cable Row', sets: 3, reps: '12', rest: '60s' },
      'Jump Squat': { name: 'Goblet Squat', sets: 3, reps: '12', rest: '60s' },
    },
  },
};

const ALLERGEN_KEYWORDS = {
  lactose: [
    'süt', 'peynir', 'yoğurt', 'lor', 'ayran', 'cacık',
    'milk', 'cheese', 'yogurt', 'cottage', 'buttermilk', 'greek yogurt', 'cheddar',
    'leche', 'queso', 'yogur', 'requesón', 'manchego',
    'whey',
  ],
  gluten: [
    'ekmek', 'makarna', 'yulaf', 'bulgur', 'un', 'kraker', 'bisküvi', 'wrap', 'tost',
    'bread', 'pasta', 'oat', 'wheat', 'cracker', 'biscuit', 'toast', 'noodle', 'couscous',
    'pan ', 'avena', 'trigo', 'tortita', 'galleta', 'cuscús',
    'granola', 'pancake', 'tortitas',
  ],
  egg: [
    'yumurta', 'omlet', 'menemen',
    'egg', 'omelet', 'scrambled',
    'huevo', 'tortilla española', 'huevos',
  ],
  nuts: [
    'fıstık', 'badem', 'ceviz', 'fındık',
    'peanut', 'almond', 'walnut', 'hazelnut', 'pb',
    'cacahuete', 'almendra', 'nuez', 'avellana', 'nueces',
  ],
  seafood: [
    'balık', 'somon', 'ton', 'levrek', 'palamut', 'karides', 'midye', 'yengeç', 'ıstakoz',
    'salmon', 'tuna', 'fish', 'sea bass', 'mackerel', 'shrimp', 'prawn', 'crab', 'lobster', 'shellfish',
    'salmón', 'atún', 'lubina', 'caballa', 'camarón', 'gamba', 'cangrejo', 'langosta', 'marisco',
  ],
  soy: ['soya', 'soy', 'tofu', 'tempeh', 'edamame'],
  sesame: ['susam', 'tahin', 'sesame', 'tahini', 'sésamo', 'ajonjolí'],
  vegan: [
    'tavuk', 'et', 'dana', 'hindi', 'köfte', 'yumurta', 'süt', 'peynir', 'yoğurt', 'lor', 'balık', 'somon', 'ton', 'levrek', 'palamut', 'bal',
    'chicken', 'beef', 'turkey', 'meat', 'egg', 'milk', 'cheese', 'yogurt', 'cottage', 'fish', 'salmon', 'tuna', 'honey', 'whey',
    'pollo', 'ternera', 'pavo', 'albóndiga', 'huevo', 'leche', 'queso', 'yogur', 'requesón', 'salmón', 'atún', 'miel',
  ],
  vegetarian: [
    'tavuk', 'et', 'dana', 'hindi', 'köfte', 'balık', 'somon', 'ton', 'levrek', 'palamut',
    'chicken', 'beef', 'turkey', 'meat', 'fish', 'salmon', 'tuna',
    'pollo', 'ternera', 'pavo', 'albóndiga', 'salmón', 'atún',
  ],
};

const ALLERGY_REPLACEMENTS = {
  tr: {
    lactose: ['Laktozsuz yoğurt + chia', 'Bezelye protein shake (su ile)', 'Humus + pirinç patlağı'],
    gluten: ['Basmati pirinç + sebze', 'Kinoa salatası', 'Pirinç patlağı + avokado'],
    egg: ['Nohutlu sebze tabağı', 'Hindi füme + avokado', 'Bitkisel protein smoothie'],
    nuts: ['Kabak çekirdeği (30g)', 'Avokado + pirinç patlağı', 'Chia puding'],
    seafood: ['Izgara tavuk göğsü (200g)', 'Hindi köfte (180g)', 'Mercimek köftesi + salata'],
    vegan: ['Mercimek + kinoa bowl', 'Nohutlu sebze yemeği', 'Bezelye protein smoothie'],
    vegetarian: ['Yumurta dışı sebzeli protein bowl', 'Mercimek + kinoa salatası', 'Nohutlu sebze yemeği'],
    soy: ['Mercimek + kinoa bowl', 'Nohutlu sebze yemeği', 'Bezelye protein smoothie'],
    sesame: ['Avokado + pirinç patlağı', 'Kabak çekirdeği (30g)', 'Chia puding'],
    safe: 'Pirinç + sebze + zeytinyağı',
  },
  en: {
    lactose: ['Lactose-free yogurt + chia', 'Pea protein shake with water', 'Hummus + rice cakes'],
    gluten: ['Basmati rice + vegetables', 'Quinoa salad', 'Rice cakes + avocado'],
    egg: ['Chickpea vegetable bowl', 'Turkey slices + avocado', 'Plant protein smoothie'],
    nuts: ['Pumpkin seeds (30g)', 'Avocado + rice cakes', 'Chia pudding'],
    seafood: ['Grilled chicken breast (200g)', 'Turkey meatballs (180g)', 'Lentil patties + salad'],
    vegan: ['Lentil + quinoa bowl', 'Chickpea vegetable stew', 'Pea protein smoothie'],
    vegetarian: ['Vegetable protein bowl', 'Lentil + quinoa salad', 'Chickpea vegetable stew'],
    soy: ['Lentil + quinoa bowl', 'Chickpea vegetable stew', 'Pea protein smoothie'],
    sesame: ['Avocado + rice cakes', 'Pumpkin seeds (30g)', 'Chia pudding'],
    safe: 'Rice + vegetables + olive oil',
  },
  es: {
    lactose: ['Yogur sin lactosa + chía', 'Batido de proteína vegetal con agua', 'Hummus + tortitas de arroz'],
    gluten: ['Arroz basmati + verduras', 'Ensalada de quinoa', 'Tortitas de arroz + aguacate'],
    egg: ['Bowl de garbanzos y verduras', 'Pavo + aguacate', 'Smoothie de proteína vegetal'],
    nuts: ['Semillas de calabaza (30g)', 'Aguacate + tortitas de arroz', 'Pudin de chía'],
    seafood: ['Pechuga de pollo a la plancha (200g)', 'Albóndigas de pavo (180g)', 'Hamburguesas de lentejas + ensalada'],
    vegan: ['Bowl de lentejas + quinoa', 'Guiso de garbanzos y verduras', 'Smoothie de proteína vegetal'],
    vegetarian: ['Bowl vegetal alto en proteína', 'Ensalada de lentejas + quinoa', 'Guiso de garbanzos y verduras'],
    soy: ['Bowl de lentejas + quinoa', 'Guiso de garbanzos y verduras', 'Smoothie de proteína de guisante'],
    sesame: ['Aguacate + tortitas de arroz', 'Semillas de calabaza (30g)', 'Pudin de chía'],
    safe: 'Arroz + verduras + aceite de oliva',
  },
};

function itemMatchesAllergy(item, allergy) {
  const lower = String(item || '').toLocaleLowerCase('tr-TR');
  const keywords = ALLERGEN_KEYWORDS[allergy];
  return Boolean(keywords?.some((keyword) => {
    const escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, 'iu').test(lower);
  }));
}

function itemConflictsWithAllergies(item, allergies) {
  return allergies.some((allergy) => allergy !== 'none' && itemMatchesAllergy(item, allergy));
}

function getSafeFoodReplacement(item, triggeredAllergy, allergies, lang) {
  const replacements = ALLERGY_REPLACEMENTS[lang] || ALLERGY_REPLACEMENTS.tr;
  const candidates = [
    ...(replacements[triggeredAllergy] || []),
    replacements.safe,
    ALLERGY_REPLACEMENTS.tr.safe,
  ].filter(Boolean);
  return candidates.find((candidate) => !itemConflictsWithAllergies(candidate, allergies)) || item;
}

export function personalizeMealItems(items, { allergies = [], budget = 'moderate', lang = 'tr' } = {}) {
  const activeAllergies = allergies.filter((allergy) => allergy !== 'none');
  const replacements = ALLERGY_REPLACEMENTS[lang] || ALLERGY_REPLACEMENTS.tr;
  return (items || []).map((originalItem) => {
    let item = budget === 'economy' ? applyEconomyFoodSwap(originalItem, lang) : originalItem;
    for (const allergy of activeAllergies) {
      if (itemMatchesAllergy(item, allergy)) {
        item = getSafeFoodReplacement(item, allergy, activeAllergies, lang);
      }
    }
    return itemConflictsWithAllergies(item, activeAllergies) ? replacements.safe : item;
  });
}

export function findMealAllergyViolations(dailyNutrition, allergies = []) {
  const activeAllergies = allergies.filter((allergy) => allergy !== 'none');
  if (activeAllergies.length === 0) return [];

  return (dailyNutrition || []).flatMap((day) =>
    (day.meals || []).flatMap((meal) =>
      meal.ingredients?.length ? meal.ingredients.flatMap((ingredient) =>
        activeAllergies.filter((allergy) => recipeAllergens(ingredient.foodId).includes(allergy))
          .map((allergy) => ({ day: day.day, meal: meal.name, item: ingredient.label, allergy }))) : (meal.items || []).flatMap((item) => {
        const matches = activeAllergies.filter((allergy) => itemMatchesAllergy(item, allergy));
        return matches.map((allergy) => ({ day: day.day, meal: meal.name, item, allergy }));
      }),
    ),
  );
}

function getHealthExerciseReplacement(exerciseName, filter) {
  const normalized = String(exerciseName || '').toLowerCase();
  const matched = filter.exclude.find((blocked) => {
    const blockedName = blocked.toLowerCase();
    return normalized === blockedName || normalized.includes(blockedName);
  });
  if (!matched) return undefined;
  return filter.replace[exerciseName] || filter.replace[matched] || null;
}

const HOME_HEALTH_REPLACEMENTS = {
  back_pain: {
    pattern: /deadlift|romanian|hip hinge|hamstring walkout|back extension|barbell row|pendlay row/i,
    bodyweight: { name: 'Glute Bridge', sets: 3, reps: '8-12', rest: '75s', muscles: ['Kalça'], equipment: 'none', difficulty: 1 },
    basic: { name: 'Resistance Band Row', sets: 3, reps: '10-15', rest: '75s', muscles: ['Sırt', 'Biceps'], equipment: 'resistance_band', difficulty: 1 },
  },
  knee_issue: {
    pattern: /squat|lunge|step-up|split squat|jump|pistol/i,
    bodyweight: { name: 'Glute Bridge', sets: 3, reps: '10-15', rest: '75s', muscles: ['Kalça'], equipment: 'none', difficulty: 1 },
    basic: { name: 'Dumbbell Glute Bridge', sets: 3, reps: '10-15', rest: '75s', muscles: ['Kalça'], equipment: 'dumbbell', difficulty: 1 },
  },
  shoulder_injury: {
    pattern: /push-up|şınav|shoulder press|pike|overhead|lateral raise|floor press/i,
    bodyweight: { name: 'Yüzüstü Lat Çekiş', sets: 3, reps: '10-15', rest: '75s', muscles: ['Sırt', 'Arka Omuz'], equipment: 'none', difficulty: 1 },
    basic: { name: 'Resistance Band Row', sets: 3, reps: '10-15', rest: '75s', muscles: ['Sırt', 'Biceps'], equipment: 'resistance_band', difficulty: 1 },
  },
  wrist_issue: {
    pattern: /push-up|şınav|plank/i,
    bodyweight: { name: 'Dead Bug', sets: 3, reps: '8/taraf', rest: '45s', muscles: ['Core'], equipment: 'none', difficulty: 1 },
    basic: { name: 'Dumbbell Floor Press (nötr tutuş)', sets: 3, reps: '8-12', rest: '75s', muscles: ['Göğüs', 'Triceps'], equipment: 'dumbbell', difficulty: 1 },
  },
  heart_condition: {
    pattern: /interval|sprint|hiit|tabata|burpee|jump|battle rope/i,
    bodyweight: { name: 'Rahat Tempolu Yürüyüş', sets: 1, reps: '20-30 dk', rest: '-', muscles: ['Kardiyo'], equipment: 'none', difficulty: 1 },
    basic: { name: 'Rahat Tempolu Yürüyüş', sets: 1, reps: '20-30 dk', rest: '-', muscles: ['Kardiyo'], equipment: 'none', difficulty: 1 },
  },
};

function applyHomeHealthGuard(workoutSplit, healthConditions, environment) {
  if (!['home_bodyweight', 'home_basic'].includes(environment)) return workoutSplit;
  const replacementKey = environment === 'home_basic' ? 'basic' : 'bodyweight';
  const guardExercises = (exercises = []) => exercises.map((exercise) => {
    for (const condition of healthConditions) {
      const rule = HOME_HEALTH_REPLACEMENTS[condition];
      if (rule?.pattern.test(exercise.name || '')) return { ...rule[replacementKey] };
    }
    return exercise;
  }).filter((exercise, index, items) => items.findIndex((item) => item.name === exercise.name) === index);
  return workoutSplit.map((day) => ({
    ...day,
    exercises: guardExercises(day.exercises),
    ...(day.coreFinisher ? { coreFinisher: guardExercises(day.coreFinisher) } : {}),
  }));
}

function applyMedicalIntensityGuard(workoutSplit, healthConditions, lang) {
  if (!healthConditions.includes('heart_condition')) return workoutSplit;
  const lowIntensityLabel = {
    tr: 'Rahat tempolu yürüyüş',
    en: 'Comfortable-paced walk',
    es: 'Caminata a ritmo cómodo',
  }[lang] || 'Rahat tempolu yürüyüş';
  const blockedIntensity = /sprint|hiit|tabata|amrap|emom|burpee|box jump|battle rope|devil press|finisher/i;

  return workoutSplit.map((day) => {
    if (isRestLikeDay(day)) return day;
    const guardedExercises = [];
    for (const exercise of day.exercises || []) {
      if (blockedIntensity.test(exercise.name || '')) {
        if (!guardedExercises.some((item) => item.name === lowIntensityLabel)) {
          guardedExercises.push({ name: lowIntensityLabel, sets: 1, reps: '20-30 dk', rest: '-' });
        }
        continue;
      }
      const parsedSets = parseInt(exercise.sets);
      const parsedRest = parseInt(exercise.rest);
      guardedExercises.push({
        ...exercise,
        sets: Number.isFinite(parsedSets) ? Math.min(3, parsedSets) : exercise.sets,
        rest: Number.isFinite(parsedRest) ? `${Math.max(90, parsedRest)}s` : exercise.rest,
      });
    }
    return { ...day, exercises: guardedExercises, cardioNote: lowIntensityLabel };
  });
}

// ── Antrenman Programı — Fazlı Sistem ─────────────────────
// Her hedef için 4 faz: Foundation → Advanced → Intensive → Elite
const workoutPhases = {
  muscle: [
    // ─── Phase 0 — Temel (Upper/Lower ×2) ─────────────────
    // Bilimsel temel: yeni başlayan her kası haftada 2× çalışmalı.
    // Bileşik hareket odaklı, her üst gün direkt triceps + biceps içerir.
    [
      {
        day: 'Pazartesi', focus: 'Üst Vücut A — Göğüs, Omuz & Triceps', emoji: '🔥',
        image: '/images/workouts/chest.png',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: '6-8', rest: '120s' },
          { name: 'Lat Pulldown', sets: 4, reps: '8-10', rest: '90s' },
          { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', rest: '90s' },
          { name: 'Seated Cable Row', sets: 3, reps: '10-12', rest: '75s' },
          { name: 'Triceps Pushdown', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Hammer Curl', sets: 3, reps: '12-15', rest: '60s' },
        ],
      },
      {
        day: 'Salı', focus: 'Alt Vücut A — Bacak & Kalça', emoji: '🦵',
        image: '/images/workouts/legs.png',
        exercises: [
          { name: 'Squat', sets: 4, reps: '6-8', rest: '150s' },
          { name: 'Romanian Deadlift', sets: 3, reps: '8-10', rest: '120s' },
          { name: 'Leg Press', sets: 3, reps: '12-15', rest: '90s' },
          { name: 'Leg Curl', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Calf Raise', sets: 4, reps: '12-15', rest: '45s' },
        ],
      },
      {
        day: 'Çarşamba', focus: 'Dinlenme', emoji: '😴',
        exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }],
      },
      {
        day: 'Perşembe', focus: 'Üst Vücut B — Sırt, Omuz & Biceps', emoji: '💪',
        image: '/images/workouts/back.png',
        exercises: [
          { name: 'Barbell Row', sets: 4, reps: '8-10', rest: '120s' },
          { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest: '90s' },
          { name: 'Lat Pulldown', sets: 3, reps: '10-12', rest: '75s' },
          { name: 'Lateral Raise', sets: 3, reps: '12-15', rest: '45s' },
          { name: 'Barbell Curl', sets: 3, reps: '10-12', rest: '60s' },
          { name: 'Overhead Triceps Extension', sets: 3, reps: '12-15', rest: '60s' },
        ],
      },
      {
        day: 'Cuma', focus: 'Alt Vücut B — Bacak & Core', emoji: '⚡',
        image: '/images/workouts/legs.png',
        exercises: [
          { name: 'Leg Press', sets: 4, reps: '10-12', rest: '120s' },
          { name: 'Bulgarian Split Squat', sets: 3, reps: '10/bacak', rest: '90s' },
          { name: 'Leg Extension', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Lying Leg Curl', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Hip Thrust', sets: 3, reps: '10-12', rest: '75s' },
          { name: 'Seated Calf Raise', sets: 4, reps: '15-20', rest: '45s' },
        ],
      },
      {
        day: 'Cumartesi', focus: 'Dinlenme', emoji: '😴',
        exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }],
      },
      {
        day: 'Pazar', focus: 'Tam Dinlenme', emoji: '😴',
        exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }],
      },
    ],

    // ─── Phase 1 — Orta (Push / Pull / Legs + Upper / Lower) ──
    // Her ana kas 2×/hafta. Triceps push + upper günlerinde,
    // biceps pull + upper günlerinde → kollar artık haftada 2-3×.
    [
      {
        day: 'Pazartesi', focus: 'Push — Göğüs, Omuz & Triceps', emoji: '🔥',
        image: '/images/workouts/chest.png',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: '6-8', rest: '120s' },
          { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest: '90s' },
          { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', rest: '90s' },
          { name: 'Cable Crossover', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Lateral Raise', sets: 4, reps: '12-15', rest: '45s' },
          { name: 'Triceps Pushdown', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Overhead Triceps Extension', sets: 3, reps: '12-15', rest: '60s' },
        ],
      },
      {
        day: 'Salı', focus: 'Pull — Sırt & Biceps', emoji: '💪',
        image: '/images/workouts/back.png',
        exercises: [
          { name: 'Deadlift', sets: 4, reps: '5-6', rest: '180s' },
          { name: 'Pull-Ups', sets: 4, reps: '8-10', rest: '120s' },
          { name: 'Barbell Row', sets: 4, reps: '8-10', rest: '90s' },
          { name: 'Seated Cable Row', sets: 3, reps: '10-12', rest: '75s' },
          { name: 'Face Pull', sets: 3, reps: '15-20', rest: '45s' },
          { name: 'Barbell Curl', sets: 3, reps: '10-12', rest: '60s' },
          { name: 'Hammer Curl', sets: 3, reps: '12-15', rest: '45s' },
        ],
      },
      {
        day: 'Çarşamba', focus: 'Bacak — Quad & Hamstring', emoji: '🦵',
        image: '/images/workouts/legs.png',
        exercises: [
          { name: 'Squat', sets: 4, reps: '6-8', rest: '150s' },
          { name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest: '120s' },
          { name: 'Leg Press', sets: 3, reps: '12-15', rest: '90s' },
          { name: 'Leg Extension', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Lying Leg Curl', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Calf Raise', sets: 4, reps: '15-20', rest: '45s' },
        ],
      },
      {
        day: 'Perşembe', focus: 'Dinlenme', emoji: '😴',
        exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }],
      },
      {
        day: 'Cuma', focus: 'Üst Vücut — Göğüs, Sırt & Omuz', emoji: '⚡',
        image: '/images/workouts/shoulders.png',
        exercises: [
          { name: 'Incline Barbell Press', sets: 4, reps: '8-10', rest: '90s' },
          { name: 'Barbell Row', sets: 4, reps: '8-10', rest: '90s' },
          { name: 'Lat Pulldown', sets: 3, reps: '10-12', rest: '75s' },
          { name: 'Arnold Press', sets: 3, reps: '10-12', rest: '75s' },
          { name: 'Lateral Raise', sets: 3, reps: '12-15', rest: '45s' },
          { name: 'Incline Dumbbell Curl', sets: 3, reps: '10-12', rest: '45s' },
          { name: 'Rope Pushdown', sets: 3, reps: '12-15', rest: '45s' },
        ],
      },
      {
        day: 'Cumartesi', focus: 'Alt Vücut — Bacak & Kalça', emoji: '🦵',
        image: '/images/workouts/legs.png',
        exercises: [
          { name: 'Front Squat', sets: 4, reps: '8-10', rest: '120s' },
          { name: 'Hip Thrust', sets: 4, reps: '10-12', rest: '90s' },
          { name: 'Bulgarian Split Squat', sets: 3, reps: '10/bacak', rest: '75s' },
          { name: 'Leg Curl', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Leg Extension', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Seated Calf Raise', sets: 4, reps: '15-20', rest: '45s' },
        ],
      },
      {
        day: 'Pazar', focus: 'Tam Dinlenme', emoji: '😴',
        exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }],
      },
    ],

    // ─── Phase 2 — İleri (Push/Pull/Legs ×2 — 6 gün) ──────
    // Yüksek hacim, kas grubu başına 2× frekans, süperset yoğunluğu.
    // A günleri güç/kalınlık, B günleri hipertrofi/detay odaklı.
    [
      {
        day: 'Pazartesi', focus: 'Push A — Göğüs & Triceps', emoji: '🔥',
        image: '/images/workouts/chest.png',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: '6-8', rest: '120s' },
          { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest: '90s' },
          { name: 'Weighted Dips', sets: 3, reps: '8-10', rest: '90s' },
          { name: 'Cable Crossover', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Lateral Raise', sets: 4, reps: '12-15', rest: '45s' },
          { name: 'Skull Crushers', sets: 3, reps: '10-12', rest: '60s' },
          { name: 'Rope Pushdown', sets: 3, reps: '12-15', rest: '45s' },
        ],
      },
      {
        day: 'Salı', focus: 'Pull A — Sırt Genişlik & Biceps', emoji: '💪',
        image: '/images/workouts/back.png',
        exercises: [
          { name: 'Weighted Pull-Up', sets: 4, reps: '6-8', rest: '120s' },
          { name: 'Barbell Row', sets: 4, reps: '8-10', rest: '90s' },
          { name: 'Lat Pulldown', sets: 3, reps: '10-12', rest: '75s' },
          { name: 'Face Pull', sets: 3, reps: '15-20', rest: '45s' },
          { name: 'Barbell Curl', sets: 3, reps: '8-10', rest: '60s' },
          { name: 'Incline Dumbbell Curl', sets: 3, reps: '10-12', rest: '45s' },
          { name: 'Hammer Curl', sets: 3, reps: '12-15', rest: '45s' },
        ],
      },
      {
        day: 'Çarşamba', focus: 'Bacak A — Quad Ağırlıklı', emoji: '🦵',
        image: '/images/workouts/legs.png',
        exercises: [
          { name: 'Squat', sets: 5, reps: '5-6', rest: '180s' },
          { name: 'Leg Press', sets: 4, reps: '10-12', rest: '90s' },
          { name: 'Hack Squat', sets: 3, reps: '10-12', rest: '75s' },
          { name: 'Leg Extension', sets: 3, reps: '15', rest: '60s' },
          { name: 'Lying Leg Curl', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Calf Raise', sets: 4, reps: '15-20', rest: '45s' },
        ],
      },
      {
        day: 'Perşembe', focus: 'Push B — Omuz & Triceps', emoji: '🔥',
        image: '/images/workouts/shoulders.png',
        exercises: [
          { name: 'OHP', sets: 4, reps: '6-8', rest: '120s' },
          { name: 'Incline Barbell Press', sets: 4, reps: '8-10', rest: '90s' },
          { name: 'Arnold Press', sets: 3, reps: '10-12', rest: '75s' },
          { name: 'Lateral Raise (21s Method)', sets: 4, reps: '7+7+7', rest: '45s' },
          { name: 'Cable Crossover', sets: 3, reps: '15', rest: '45s' },
          { name: 'Overhead Cable Extension', sets: 3, reps: '12-15', rest: '45s' },
          { name: 'Triceps Dip', sets: 3, reps: '12-15', rest: '45s' },
        ],
      },
      {
        day: 'Cuma', focus: 'Pull B — Sırt Kalınlık & Arka Omuz', emoji: '💪',
        image: '/images/workouts/back.png',
        exercises: [
          { name: 'Deadlift', sets: 4, reps: '5-6', rest: '180s' },
          { name: 'T-Bar Row', sets: 4, reps: '8-10', rest: '90s' },
          { name: 'Seated Cable Row', sets: 3, reps: '10-12', rest: '75s' },
          { name: 'Reverse Pec Deck', sets: 3, reps: '15', rest: '45s' },
          { name: 'Straight Arm Pulldown', sets: 3, reps: '12-15', rest: '45s' },
          { name: 'Preacher Curl', sets: 3, reps: '10-12', rest: '45s' },
          { name: 'Cable Curl', sets: 3, reps: '12-15', rest: '45s' },
        ],
      },
      {
        day: 'Cumartesi', focus: 'Bacak B — Hamstring & Kalça', emoji: '🦵',
        image: '/images/workouts/legs.png',
        exercises: [
          { name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest: '120s' },
          { name: 'Hip Thrust', sets: 4, reps: '10-12', rest: '90s' },
          { name: 'Bulgarian Split Squat', sets: 3, reps: '10/bacak', rest: '75s' },
          { name: 'Lying Leg Curl', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Leg Extension', sets: 3, reps: '15', rest: '60s' },
          { name: 'Seated Calf Raise', sets: 4, reps: '15-20', rest: '45s' },
        ],
      },
      {
        day: 'Pazar', focus: 'Tam Dinlenme', emoji: '😴',
        exercises: [
          { name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' },
          { name: '⚠️ Deload Notu: Her 4. haftada ağırlıkları %60\'a düşür, seti %50 azalt', sets: '-', reps: '-', rest: '-' },
        ],
      },
    ],

    // ─── Phase 3 — Usta (PPL ×2 + Periyodizasyon + Deload) ─
    // A günleri güç (düşük tekrar, RPE 8-9), B günleri hipertrofi
    // (süperset/dropset/giant set). 4. hafta deload zorunlu.
    [
      {
        day: 'Pazartesi', focus: 'Push A — Göğüs & Triceps (Güç)', emoji: '🏆',
        image: '/images/workouts/chest.png',
        exercises: [
          { name: 'Paused Bench Press (3s)', sets: 5, reps: '3-5', rest: '180s' },
          { name: 'Incline Barbell Press', sets: 4, reps: '6-8', rest: '120s' },
          { name: 'Weighted Dips', sets: 4, reps: '6-8', rest: '90s' },
          { name: 'Süperset: Lateral Raise + Cable Crossover', sets: 4, reps: '15 + 12', rest: '60s' },
          { name: 'Close Grip Bench Press', sets: 3, reps: '8-10', rest: '90s' },
          { name: 'Süperset: Skull Crushers + Rope Pushdown', sets: 3, reps: '10 + 15', rest: '60s' },
          { name: '⚠️ Deload Notu: 4. haftada ağırlıkları %60\'a düşür', sets: '-', reps: '-', rest: '-' },
        ],
      },
      {
        day: 'Salı', focus: 'Pull A — Sırt & Biceps (Güç)', emoji: '🏆',
        image: '/images/workouts/back.png',
        exercises: [
          { name: 'Deficit Deadlift', sets: 5, reps: '3-5', rest: '180s' },
          { name: 'Weighted Pull-Up', sets: 4, reps: '6-8', rest: '120s' },
          { name: 'Pendlay Row', sets: 4, reps: '6-8', rest: '90s' },
          { name: 'Süperset: Seal Row + Face Pull', sets: 3, reps: '10 + 20', rest: '60s' },
          { name: 'Süperset: Barbell Curl + Hammer Curl', sets: 4, reps: '8 + 12', rest: '60s' },
          { name: 'Bayesian Curl', sets: 3, reps: '12-15', rest: '45s' },
          { name: '⚠️ Deload Notu: 4. haftada toplam seti %50 azalt', sets: '-', reps: '-', rest: '-' },
        ],
      },
      {
        day: 'Çarşamba', focus: 'Bacak A — Güç & Quad', emoji: '🏆',
        image: '/images/workouts/legs.png',
        exercises: [
          { name: 'Back Squat (RPE 9)', sets: 5, reps: '3-5', rest: '180s' },
          { name: 'Romanian Deadlift', sets: 4, reps: '6-8', rest: '120s' },
          { name: 'Hack Squat', sets: 3, reps: '10-12', rest: '90s' },
          { name: 'Süperset: Leg Extension + Lying Leg Curl', sets: 3, reps: '15 + 15', rest: '60s' },
          { name: 'Standing Single Leg Calf Raise', sets: 4, reps: '12-15', rest: '45s' },
          { name: '⚠️ Deload Notu: 4. haftada squat ağırlığı max %65', sets: '-', reps: '-', rest: '-' },
        ],
      },
      {
        day: 'Perşembe', focus: 'Push B — Omuz & Triceps (Hipertrofi)', emoji: '🏆',
        image: '/images/workouts/shoulders.png',
        exercises: [
          { name: 'OHP', sets: 4, reps: '6-8', rest: '120s' },
          { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest: '90s' },
          { name: 'Süperset: Arnold Press + Lateral Raise', sets: 4, reps: '10 + 15', rest: '60s' },
          { name: 'Cable Crossover (Dropset)', sets: 3, reps: '12-10-8', rest: '60s' },
          { name: 'Süperset: Overhead Cable Extension + Triceps Dip', sets: 3, reps: '12 + 15', rest: '45s' },
          { name: 'JM Press', sets: 3, reps: '8-10', rest: '60s' },
        ],
      },
      {
        day: 'Cuma', focus: 'Pull B — Sırt Detay & Arka Omuz (Hipertrofi)', emoji: '🏆',
        image: '/images/workouts/back.png',
        exercises: [
          { name: 'Chest-Supported Row', sets: 4, reps: '8-10', rest: '90s' },
          { name: 'Lat Pulldown', sets: 4, reps: '10-12', rest: '75s' },
          { name: 'Süperset: Meadows Row + Reverse Pec Deck', sets: 3, reps: '10 + 15', rest: '60s' },
          { name: 'Straight Arm Pulldown', sets: 3, reps: '12-15', rest: '45s' },
          { name: 'Süperset: Preacher Curl + Cable Curl', sets: 3, reps: '10 + 15', rest: '45s' },
          { name: 'Spider Curl', sets: 3, reps: '12', rest: '45s' },
        ],
      },
      {
        day: 'Cumartesi', focus: 'Bacak B — Hamstring & Kalça (Hipertrofi)', emoji: '🏆',
        image: '/images/workouts/legs.png',
        exercises: [
          { name: 'Front Squat', sets: 4, reps: '8-10', rest: '120s' },
          { name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest: '120s' },
          { name: 'Hip Thrust', sets: 4, reps: '8-10', rest: '90s' },
          { name: 'Bulgarian Split Squat', sets: 3, reps: '10/bacak', rest: '75s' },
          { name: 'Süperset: Leg Extension + Lying Leg Curl', sets: 3, reps: '15 + 15', rest: '75s' },
          { name: 'Seated Calf Raise', sets: 4, reps: '15-20', rest: '45s' },
          { name: '⚠️ Deload Notu: 4. haftada toplam hacmi %50 azalt', sets: '-', reps: '-', rest: '-' },
        ],
      },
      {
        day: 'Pazar', focus: 'Tam Dinlenme', emoji: '😴',
        exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }],
      },
    ],
  ],

  fat_loss: [
    // ─── Phase 0 — Foundation (Temel Yağ Yakım) ──────────
    [
      {
        day: 'Pazartesi', focus: 'Full Body HIIT', emoji: '🔥',
        image: '/images/workouts/chest.png',
        exercises: [
          { name: 'Burpees', sets: 4, reps: '15', rest: '30s' },
          { name: 'Kettlebell Swing', sets: 4, reps: '20', rest: '30s' },
          { name: 'Mountain Climbers', sets: 3, reps: '30s', rest: '15s' },
          { name: 'Box Jump', sets: 3, reps: '12', rest: '30s' },
          { name: 'Battle Ropes', sets: 3, reps: '30s', rest: '30s' },
        ],
      },
      {
        day: 'Salı', focus: 'Dinlenme', emoji: '😴',
        exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }],
      },
      {
        day: 'Çarşamba', focus: 'Üst Vücut + Kardiyo', emoji: '💪',
        image: '/images/workouts/back.png',
        exercises: [
          { name: 'Push-Up Variations', sets: 4, reps: '15', rest: '30s' },
          { name: 'Dumbbell Row', sets: 3, reps: '12', rest: '45s' },
          { name: 'Shoulder Press', sets: 3, reps: '12', rest: '45s' },
          { name: 'Cable Flyes', sets: 3, reps: '15', rest: '30s' },
          { name: 'Treadmill Sprint Intervals', sets: 1, reps: '15 dk', rest: '-' },
        ],
      },
      {
        day: 'Perşembe', focus: 'Dinlenme / Aktif Toparlanma', emoji: '🧘',
        exercises: [
          { name: 'Hafif Yürüyüş', sets: 1, reps: '30 dk', rest: '-' },
          { name: 'Foam Rolling', sets: 1, reps: '15 dk', rest: '-' },
        ],
      },
      {
        day: 'Cuma', focus: 'Alt Vücut Güç', emoji: '⚡',
        image: '/images/workouts/legs.png',
        exercises: [
          { name: 'Goblet Squat', sets: 4, reps: '15', rest: '45s' },
          { name: 'Jump Lunges', sets: 3, reps: '12/bacak', rest: '30s' },
          { name: 'Deadlift (Orta Ağırlık)', sets: 4, reps: '12', rest: '60s' },
          { name: 'Step-Ups', sets: 3, reps: '15/bacak', rest: '30s' },
          { name: 'Plank to Push-Up', sets: 3, reps: '12', rest: '30s' },
        ],
      },
      {
        day: 'Cumartesi', focus: 'Metabolik Conditioning', emoji: '🎯',
        image: '/images/workouts/shoulders.png',
        exercises: [
          { name: 'EMOM Circuit (10 dk)', sets: 1, reps: '-', rest: '-' },
          { name: 'Thrusters', sets: 3, reps: '15', rest: '30s' },
          { name: 'Rowing Machine', sets: 4, reps: '500m', rest: '60s' },
          { name: 'TRX Rows', sets: 3, reps: '15', rest: '30s' },
          { name: 'Ab Wheel Rollout', sets: 3, reps: '12', rest: '30s' },
        ],
      },
      {
        day: 'Pazar', focus: 'Tam Dinlenme', emoji: '😴',
        exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }],
      },
    ],

    // ─── Phase 1 — Advanced HIIT + Güç ────────────────────
    [
      {
        day: 'Pazartesi', focus: 'Üst Vücut HIIT + Güç', emoji: '🔥',
        image: '/images/workouts/chest.png',
        exercises: [
          { name: 'Dumbbell Bench Press', sets: 4, reps: '10-12', rest: '45s' },
          { name: 'Renegade Row', sets: 3, reps: '10/taraf', rest: '30s' },
          { name: 'Push-Up + Plyo Push-Up Combo', sets: 3, reps: '8+5', rest: '45s' },
          { name: 'Arnold Press', sets: 3, reps: '12', rest: '45s' },
          { name: 'Battle Ropes (Tabata)', sets: 8, reps: '20s iş / 10s dinl.', rest: '-' },
          { name: 'Triceps Dip', sets: 3, reps: '12-15', rest: '30s' },
        ],
      },
      {
        day: 'Salı', focus: 'Alt Vücut HIIT + Güç', emoji: '🦵',
        image: '/images/workouts/legs.png',
        exercises: [
          { name: 'Barbell Squat', sets: 4, reps: '10', rest: '60s' },
          { name: 'Jump Squat', sets: 3, reps: '12', rest: '30s' },
          { name: 'Walking Dumbbell Lunge', sets: 3, reps: '12/bacak', rest: '45s' },
          { name: 'Kettlebell Swing', sets: 4, reps: '20', rest: '30s' },
          { name: 'Box Jump', sets: 3, reps: '10', rest: '30s' },
          { name: 'Sprint İntervalleri (Koşu Bandı)', sets: 8, reps: '30s sprint / 30s yürü', rest: '-' },
        ],
      },
      {
        day: 'Çarşamba', focus: 'Dinlenme / Aktif Toparlanma', emoji: '🧘',
        exercises: [
          { name: 'Hafif Tempo Yürüyüş', sets: 1, reps: '40 dk', rest: '-' },
          { name: 'Yoga / Esneme', sets: 1, reps: '20 dk', rest: '-' },
        ],
      },
      {
        day: 'Perşembe', focus: 'Full Body Metabolik', emoji: '⚡',
        image: '/images/workouts/shoulders.png',
        exercises: [
          { name: 'Clean & Press', sets: 4, reps: '8', rest: '60s' },
          { name: 'Devil Press', sets: 3, reps: '10', rest: '45s' },
          { name: 'Burpee to Pull-Up', sets: 3, reps: '8', rest: '45s' },
          { name: 'Sled Push', sets: 4, reps: '20m', rest: '60s' },
          { name: 'Hanging Leg Raise', sets: 3, reps: '15', rest: '30s' },
        ],
      },
      {
        day: 'Cuma', focus: 'Push-Pull Kardiyo', emoji: '💪',
        image: '/images/workouts/back.png',
        exercises: [
          { name: 'Bench Press (Tempo: 3-0-1)', sets: 3, reps: '12', rest: '45s' },
          { name: 'Barbell Row (Tempo: 3-0-1)', sets: 3, reps: '12', rest: '45s' },
          { name: 'Dumbbell Shoulder Press', sets: 3, reps: '12', rest: '30s' },
          { name: 'Cable Row', sets: 3, reps: '15', rest: '30s' },
          { name: 'Assault Bike Intervals', sets: 6, reps: '30s max / 30s yavaş', rest: '-' },
        ],
      },
      {
        day: 'Cumartesi', focus: 'HIIT Kardiyo Finisher', emoji: '🎯',
        image: '/images/workouts/chest.png',
        exercises: [
          { name: 'Rowing Machine', sets: 4, reps: '500m', rest: '90s' },
          { name: 'Burpee Broad Jump', sets: 3, reps: '10', rest: '30s' },
          { name: 'Medicine Ball Slam', sets: 3, reps: '15', rest: '30s' },
          { name: 'Ski Erg Intervals', sets: 5, reps: '200m', rest: '45s' },
          { name: 'Plank Variations', sets: 3, reps: '45s', rest: '15s' },
        ],
      },
      {
        day: 'Pazar', focus: 'Tam Dinlenme', emoji: '😴',
        exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }],
      },
    ],

    // ─── Phase 2 — Circuit Training (Devre Antrenmanı) ────
    [
      {
        day: 'Pazartesi', focus: 'Üst Vücut Circuit', emoji: '🔥',
        image: '/images/workouts/chest.png',
        exercises: [
          { name: 'Devre (3 tur) — Push-Up', sets: 3, reps: '15', rest: '0s' },
          { name: 'Devre — Dumbbell Row', sets: 3, reps: '12', rest: '0s' },
          { name: 'Devre — Shoulder Press', sets: 3, reps: '12', rest: '0s' },
          { name: 'Devre — Bicep Curl', sets: 3, reps: '15', rest: '0s' },
          { name: 'Devre — Triceps Dip', sets: 3, reps: '12', rest: '0s' },
          { name: '↻ Turlar arası dinlenme: 90s', sets: '-', reps: '-', rest: '90s' },
        ],
      },
      {
        day: 'Salı', focus: 'Alt Vücut Circuit', emoji: '🦵',
        image: '/images/workouts/legs.png',
        exercises: [
          { name: 'Devre (3 tur) — Squat', sets: 3, reps: '15', rest: '0s' },
          { name: 'Devre — Lunge', sets: 3, reps: '12/bacak', rest: '0s' },
          { name: 'Devre — Romanian Deadlift', sets: 3, reps: '12', rest: '0s' },
          { name: 'Devre — Calf Raise', sets: 3, reps: '20', rest: '0s' },
          { name: 'Devre — Glute Bridge', sets: 3, reps: '15', rest: '0s' },
          { name: '↻ Turlar arası dinlenme: 90s', sets: '-', reps: '-', rest: '90s' },
        ],
      },
      {
        day: 'Çarşamba', focus: 'Dinlenme / Aktif Toparlanma', emoji: '🧘',
        exercises: [
          { name: 'Hafif Yüzme veya Bisiklet', sets: 1, reps: '30 dk', rest: '-' },
          { name: 'Stretching Routine', sets: 1, reps: '15 dk', rest: '-' },
        ],
      },
      {
        day: 'Perşembe', focus: 'Full Body Circuit', emoji: '⚡',
        image: '/images/workouts/shoulders.png',
        exercises: [
          { name: 'Devre (4 tur) — Thruster', sets: 4, reps: '10', rest: '0s' },
          { name: 'Devre — Pull-Up / Assisted', sets: 4, reps: '8', rest: '0s' },
          { name: 'Devre — Kettlebell Swing', sets: 4, reps: '15', rest: '0s' },
          { name: 'Devre — Mountain Climber', sets: 4, reps: '30s', rest: '0s' },
          { name: 'Devre — Plank Hold', sets: 4, reps: '30s', rest: '0s' },
          { name: '↻ Turlar arası dinlenme: 120s', sets: '-', reps: '-', rest: '120s' },
        ],
      },
      {
        day: 'Cuma', focus: 'Kardiyo + Core Circuit', emoji: '💪',
        image: '/images/workouts/back.png',
        exercises: [
          { name: 'Devre (3 tur) — Burpee', sets: 3, reps: '10', rest: '0s' },
          { name: 'Devre — Russian Twist', sets: 3, reps: '20', rest: '0s' },
          { name: 'Devre — Jump Rope', sets: 3, reps: '60s', rest: '0s' },
          { name: 'Devre — V-Up', sets: 3, reps: '12', rest: '0s' },
          { name: 'Devre — Bear Crawl', sets: 3, reps: '20m', rest: '0s' },
          { name: '↻ Turlar arası dinlenme: 90s', sets: '-', reps: '-', rest: '90s' },
        ],
      },
      {
        day: 'Cumartesi', focus: 'AMRAP Challenge', emoji: '🎯',
        image: '/images/workouts/chest.png',
        exercises: [
          { name: 'AMRAP 20dk — Wall Ball (9kg)', sets: 1, reps: '15/tur', rest: '-' },
          { name: 'AMRAP — Box Jump', sets: 1, reps: '10/tur', rest: '-' },
          { name: 'AMRAP — Ring Row / TRX Row', sets: 1, reps: '12/tur', rest: '-' },
          { name: 'AMRAP — Dumbbell Snatch', sets: 1, reps: '8/kol', rest: '-' },
          { name: 'AMRAP — Sit-Up', sets: 1, reps: '15/tur', rest: '-' },
          { name: '📝 Toplam tur sayısını kaydet!', sets: '-', reps: '-', rest: '-' },
        ],
      },
      {
        day: 'Pazar', focus: 'Tam Dinlenme', emoji: '😴',
        exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }],
      },
    ],

    // ─── Phase 3 — Hybrid Peak (Her Şey Bir Arada) ────────
    [
      {
        day: 'Pazartesi', focus: 'Güç + Kardiyo — Üst', emoji: '🏆',
        image: '/images/workouts/chest.png',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: '8', rest: '60s' },
          { name: '→ ardından Assault Bike Sprint', sets: 4, reps: '30s', rest: '30s' },
          { name: 'Weighted Pull-Up', sets: 4, reps: '6-8', rest: '60s' },
          { name: '→ ardından Rowing Sprint', sets: 4, reps: '200m', rest: '30s' },
          { name: 'Süperset: OHP + Lateral Raise', sets: 3, reps: '8 + 15', rest: '45s' },
          { name: 'Finisher: 100 Push-Up Challenge (min sürede)', sets: 1, reps: '100', rest: '-' },
        ],
      },
      {
        day: 'Salı', focus: 'Güç + Kardiyo — Alt', emoji: '🏆',
        image: '/images/workouts/legs.png',
        exercises: [
          { name: 'Back Squat', sets: 4, reps: '8', rest: '75s' },
          { name: '→ ardından Box Jump', sets: 4, reps: '8', rest: '30s' },
          { name: 'Romanian Deadlift', sets: 4, reps: '10', rest: '60s' },
          { name: '→ ardından Kettlebell Swing', sets: 4, reps: '15', rest: '30s' },
          { name: 'Süperset: Leg Press + Jump Squat', sets: 3, reps: '12 + 8', rest: '60s' },
          { name: 'Finisher: Sled Push + Farmer Walk', sets: 3, reps: '30m + 40m', rest: '90s' },
        ],
      },
      {
        day: 'Çarşamba', focus: 'Dinlenme / Aktif Toparlanma', emoji: '🧘',
        exercises: [
          { name: 'Hafif Yüzme', sets: 1, reps: '20 dk', rest: '-' },
          { name: 'Mobilite Çalışması', sets: 1, reps: '20 dk', rest: '-' },
          { name: 'Soğuk / Sıcak Kontrast', sets: 1, reps: '10 dk', rest: '-' },
        ],
      },
      {
        day: 'Perşembe', focus: 'Metabolik Devre + Core', emoji: '⚡',
        image: '/images/workouts/shoulders.png',
        exercises: [
          { name: 'EMOM 16dk (4 tur) — Clean & Press x5', sets: 4, reps: '5', rest: '-' },
          { name: 'EMOM — Devil Press x5', sets: 4, reps: '5', rest: '-' },
          { name: 'EMOM — Burpee x8', sets: 4, reps: '8', rest: '-' },
          { name: 'EMOM — Toes to Bar x10', sets: 4, reps: '10', rest: '-' },
          { name: 'Finisher: Plank Ladder (30s→45s→60s→45s→30s)', sets: 5, reps: 'artan', rest: '15s' },
        ],
      },
      {
        day: 'Cuma', focus: 'Full Body Hybrid', emoji: '💪',
        image: '/images/workouts/back.png',
        exercises: [
          { name: 'Süperset: Front Squat + Chin-Up', sets: 4, reps: '8 + 8', rest: '75s' },
          { name: 'Süperset: DB Bench Press + Pendlay Row', sets: 4, reps: '10 + 10', rest: '60s' },
          { name: 'Tabata: Battle Ropes (4dk)', sets: 8, reps: '20s iş / 10s dinl.', rest: '-' },
          { name: 'Süperset: Turkish Get-Up + Ab Wheel', sets: 3, reps: '3/taraf + 10', rest: '60s' },
          { name: 'Finisher: 2000m Row (zaman tut)', sets: 1, reps: '2000m', rest: '-' },
        ],
      },
      {
        day: 'Cumartesi', focus: 'Conditioning Testi', emoji: '🎯',
        image: '/images/workouts/chest.png',
        exercises: [
          { name: '"Filthy Fifty" WOD (modifiye):', sets: '-', reps: '-', rest: '-' },
          { name: 'Box Jump x30', sets: 1, reps: '30', rest: '-' },
          { name: 'Push-Up x30', sets: 1, reps: '30', rest: '-' },
          { name: 'Kettlebell Swing x30', sets: 1, reps: '30', rest: '-' },
          { name: 'Walking Lunge x30', sets: 1, reps: '30', rest: '-' },
          { name: 'Burpee x20', sets: 1, reps: '20', rest: '-' },
          { name: '📝 Toplam süreyi kaydet — her hafta kıyasla!', sets: '-', reps: '-', rest: '-' },
        ],
      },
      {
        day: 'Pazar', focus: 'Tam Dinlenme', emoji: '😴',
        exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }],
      },
    ],
  ],

  // ═══════════════════════════════════════════════════════════
  // MEDİTASYON — 4 Faz
  // ═══════════════════════════════════════════════════════════
  meditation: [
    // ─── Phase 0 — Temel: Nefes & Farkındalık ──────────────
    [
      { day: 'Pazartesi', focus: 'Nefes Meditasyonu', emoji: '🧘', exercises: [
        { name: 'Derin Nefes (4-7-8 Tekniği)', sets: 3, reps: '5 dk', rest: '30s' },
        { name: 'Karın Nefesi', sets: 3, reps: '5 dk', rest: '30s' },
        { name: 'Mindfulness Oturma', sets: 1, reps: '10 dk', rest: '-' },
      ] },
      { day: 'Salı', focus: 'Vücut Tarama', emoji: '✨', exercises: [
        { name: 'Body Scan Meditation', sets: 1, reps: '15 dk', rest: '-' },
        { name: 'Progresif Kas Gevşetme', sets: 1, reps: '10 dk', rest: '-' },
      ] },
      { day: 'Çarşamba', focus: 'Farkındalık', emoji: '🌿', exercises: [
        { name: 'Yürüyüş Meditasyonu', sets: 1, reps: '20 dk', rest: '-' },
        { name: 'Mindful Eating Pratiği', sets: 1, reps: '15 dk', rest: '-' },
      ] },
      { day: 'Perşembe', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Serbest Gün', sets: '-', reps: '-', rest: '-' }] },
      { day: 'Cuma', focus: 'Mantra Meditasyon', emoji: '🕉️', exercises: [
        { name: 'Om Chanting', sets: 3, reps: '5 dk', rest: '30s' },
        { name: 'Mantra Tekrarı', sets: 1, reps: '15 dk', rest: '-' },
        { name: 'Sessizlik Meditasyonu', sets: 1, reps: '10 dk', rest: '-' },
      ] },
      { day: 'Cumartesi', focus: 'Görselleştirme', emoji: '🌈', exercises: [
        { name: 'Guided Visualization', sets: 1, reps: '20 dk', rest: '-' },
        { name: 'Şükran Meditasyonu', sets: 1, reps: '10 dk', rest: '-' },
      ] },
      { day: 'Pazar', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Serbest Gün', sets: '-', reps: '-', rest: '-' }] },
    ],
    // ─── Phase 1 — Orta: Loving-Kindness & Chakra ──────────
    [
      { day: 'Pazartesi', focus: 'Metta (Sevgi-Şefkat)', emoji: '💗', exercises: [
        { name: 'Loving-Kindness Meditasyon', sets: 1, reps: '20 dk', rest: '-' },
        { name: 'Şefkat Nefesi', sets: 3, reps: '5 dk', rest: '30s' },
        { name: 'Kendini Bağışlama Pratiği', sets: 1, reps: '10 dk', rest: '-' },
      ] },
      { day: 'Salı', focus: 'Chakra Dengeleme', emoji: '🔮', exercises: [
        { name: 'Root Chakra Meditasyon', sets: 1, reps: '10 dk', rest: '-' },
        { name: 'Heart Chakra Açılım', sets: 1, reps: '10 dk', rest: '-' },
        { name: 'Third Eye Odaklanma', sets: 1, reps: '10 dk', rest: '-' },
      ] },
      { day: 'Çarşamba', focus: 'Nefes Teknikleri', emoji: '🌬️', exercises: [
        { name: 'Alternate Nostril (Nadi Shodhana)', sets: 5, reps: '3 dk', rest: '15s' },
        { name: 'Kapalabhati Pranayama', sets: 3, reps: '30 nefes', rest: '30s' },
        { name: 'Ujjayi Nefes', sets: 1, reps: '10 dk', rest: '-' },
      ] },
      { day: 'Perşembe', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Serbest Gün', sets: '-', reps: '-', rest: '-' }] },
      { day: 'Cuma', focus: 'Derinleşen Farkındalık', emoji: '🧠', exercises: [
        { name: 'Open Awareness Meditation', sets: 1, reps: '20 dk', rest: '-' },
        { name: 'Non-Judgmental Observation', sets: 1, reps: '15 dk', rest: '-' },
      ] },
      { day: 'Cumartesi', focus: 'Ses & Titreşim', emoji: '🎵', exercises: [
        { name: 'Singing Bowl Meditasyon', sets: 1, reps: '15 dk', rest: '-' },
        { name: 'Binaural Beats Dinleme', sets: 1, reps: '20 dk', rest: '-' },
      ] },
      { day: 'Pazar', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Serbest Gün', sets: '-', reps: '-', rest: '-' }] },
    ],
    // ─── Phase 2 — İleri: Zen, Vipassana ───────────────────
    [
      { day: 'Pazartesi', focus: 'Vipassana Insight', emoji: '👁️', exercises: [
        { name: 'Anicca (Geçicilik) Meditasyonu', sets: 1, reps: '25 dk', rest: '-' },
        { name: 'Vedana (His) Gözlemi', sets: 1, reps: '15 dk', rest: '-' },
      ] },
      { day: 'Salı', focus: 'Zen Zazen', emoji: '⛩️', exercises: [
        { name: 'Shikantaza (Sadece Oturma)', sets: 1, reps: '30 dk', rest: '-' },
        { name: 'Kinhin (Yürüyüş Zen)', sets: 1, reps: '15 dk', rest: '-' },
      ] },
      { day: 'Çarşamba', focus: 'İleri Pranayama', emoji: '🌬️', exercises: [
        { name: 'Bhramari (Arı Nefesi)', sets: 5, reps: '3 dk', rest: '15s' },
        { name: 'Sitali (Soğutucu Nefes)', sets: 3, reps: '3 dk', rest: '15s' },
        { name: 'Wim Hof Nefes Tekniği', sets: 3, reps: '30 nefes + tutma', rest: '60s' },
      ] },
      { day: 'Perşembe', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Serbest Gün', sets: '-', reps: '-', rest: '-' }] },
      { day: 'Cuma', focus: 'Yoga Nidra', emoji: '🌙', exercises: [
        { name: 'Yoga Nidra (Bilinçli Uyku)', sets: 1, reps: '40 dk', rest: '-' },
      ] },
      { day: 'Cumartesi', focus: 'Kozmik Meditasyon', emoji: '🌌', exercises: [
        { name: 'Tonglen (Alma-Verme)', sets: 1, reps: '20 dk', rest: '-' },
        { name: 'Boşluk Meditasyonu', sets: 1, reps: '20 dk', rest: '-' },
      ] },
      { day: 'Pazar', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Serbest Gün', sets: '-', reps: '-', rest: '-' }] },
    ],
    // ─── Phase 3 — Usta: Uzun Oturumlar, Retreat ──────────
    [
      { day: 'Pazartesi', focus: 'Derin Oturum', emoji: '🏔️', exercises: [
        { name: 'Sessiz Oturum (Vipassana Tarzı)', sets: 1, reps: '45 dk', rest: '-' },
        { name: 'Walking Meditation', sets: 1, reps: '15 dk', rest: '-' },
      ] },
      { day: 'Salı', focus: 'Transandantal', emoji: '🌀', exercises: [
        { name: 'TM Tekniği (Mantra Tabanlı)', sets: 2, reps: '20 dk', rest: '5 dk' },
        { name: 'Sessizlik Taahhüdü', sets: 1, reps: '60 dk', rest: '-' },
      ] },
      { day: 'Çarşamba', focus: 'Bütünleşik Pratik', emoji: '🌟', exercises: [
        { name: 'Pranayama → Meditasyon → Yoga Nidra', sets: 1, reps: '60 dk', rest: '-' },
      ] },
      { day: 'Perşembe', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Serbest Gün', sets: '-', reps: '-', rest: '-' }] },
      { day: 'Cuma', focus: 'Koan / Sorgulama', emoji: '❓', exercises: [
        { name: 'Zen Koan Meditasyonu', sets: 1, reps: '30 dk', rest: '-' },
        { name: 'Self-Inquiry (Ben Kimim?)', sets: 1, reps: '20 dk', rest: '-' },
      ] },
      { day: 'Cumartesi', focus: 'Mini Retreat', emoji: '🏕️', exercises: [
        { name: 'Sabah: Sessiz Oturum', sets: 1, reps: '30 dk', rest: '-' },
        { name: 'Öğle: Mindful Yemek + Yürüyüş', sets: 1, reps: '45 dk', rest: '-' },
        { name: 'Akşam: Metta + Yoga Nidra', sets: 1, reps: '45 dk', rest: '-' },
      ] },
      { day: 'Pazar', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Serbest Gün', sets: '-', reps: '-', rest: '-' }] },
    ],
  ],

  // ═══════════════════════════════════════════════════════════
  // YOGA — 4 Faz
  // ═══════════════════════════════════════════════════════════
  yoga: [
    // ─── Phase 0 — Temel: Asana Temelleri ──────────────────
    [
      { day: 'Pazartesi', focus: 'Güneşe Selam & Temel', emoji: '☀️', exercises: [
        { name: 'Surya Namaskar A', sets: 5, reps: '1 akış', rest: '30s' },
        { name: 'Warrior I (Virabhadrasana I)', sets: 2, reps: '30s/taraf', rest: '15s' },
        { name: 'Warrior II', sets: 2, reps: '30s/taraf', rest: '15s' },
        { name: 'Tree Pose (Vrksasana)', sets: 2, reps: '30s/taraf', rest: '15s' },
        { name: 'Downward Dog', sets: 3, reps: '45s', rest: '15s' },
        { name: 'Savasana', sets: 1, reps: '5 dk', rest: '-' },
      ] },
      { day: 'Salı', focus: 'Esneklik & Açıcılar', emoji: '🌊', exercises: [
        { name: 'Cat-Cow Stretch', sets: 3, reps: '10 tekrar', rest: '15s' },
        { name: 'Pigeon Pose', sets: 2, reps: '1 dk/taraf', rest: '15s' },
        { name: 'Seated Forward Fold', sets: 3, reps: '45s', rest: '15s' },
        { name: 'Supine Twist', sets: 2, reps: '30s/taraf', rest: '15s' },
        { name: 'Happy Baby', sets: 2, reps: '45s', rest: '15s' },
      ] },
      { day: 'Çarşamba', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
      { day: 'Perşembe', focus: 'Güç Yogası', emoji: '💪', exercises: [
        { name: 'Chair Pose (Utkatasana)', sets: 3, reps: '30s', rest: '15s' },
        { name: 'Plank Pose', sets: 3, reps: '30s', rest: '15s' },
        { name: 'Chaturanga', sets: 3, reps: '8', rest: '30s' },
        { name: 'Boat Pose (Navasana)', sets: 3, reps: '30s', rest: '15s' },
        { name: 'Crow Pose Prep', sets: 3, reps: '15s', rest: '30s' },
      ] },
      { day: 'Cuma', focus: 'Restoratif Yoga', emoji: '🌸', exercises: [
        { name: 'Child Pose (Balasana)', sets: 3, reps: '1 dk', rest: '15s' },
        { name: 'Legs Up The Wall', sets: 1, reps: '5 dk', rest: '-' },
        { name: 'Supported Bridge', sets: 2, reps: '2 dk', rest: '30s' },
        { name: 'Reclining Butterfly', sets: 1, reps: '3 dk', rest: '-' },
      ] },
      { day: 'Cumartesi', focus: 'Vinyasa Akış', emoji: '🔥', exercises: [
        { name: 'Surya Namaskar B', sets: 5, reps: '1 akış', rest: '30s' },
        { name: 'Warrior III', sets: 2, reps: '30s/taraf', rest: '15s' },
        { name: 'Half Moon', sets: 2, reps: '30s/taraf', rest: '15s' },
        { name: 'Triangle Pose', sets: 2, reps: '30s/taraf', rest: '15s' },
        { name: 'Standing Split', sets: 2, reps: '20s/taraf', rest: '15s' },
      ] },
      { day: 'Pazar', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
    ],
    // ─── Phase 1 — Orta: Kol Dengeleri & İnversiyon Hazırlık
    [
      { day: 'Pazartesi', focus: 'Kol Dengeleri', emoji: '🤸', exercises: [
        { name: 'Crow Pose (Bakasana)', sets: 5, reps: '15s', rest: '30s' },
        { name: 'Side Crow Prep', sets: 3, reps: '10s/taraf', rest: '30s' },
        { name: 'Firefly Pose Prep', sets: 3, reps: '10s', rest: '30s' },
        { name: 'Eight Angle Pose Prep', sets: 3, reps: '10s/taraf', rest: '30s' },
      ] },
      { day: 'Salı', focus: 'Derin Esneklik', emoji: '🧘', exercises: [
        { name: 'Yin Yoga — Dragon Pose', sets: 2, reps: '3 dk/taraf', rest: '15s' },
        { name: 'Yin Yoga — Butterfly', sets: 1, reps: '5 dk', rest: '-' },
        { name: 'Yin Yoga — Seal', sets: 1, reps: '5 dk', rest: '-' },
        { name: 'Yin Yoga — Twisted Root', sets: 2, reps: '3 dk/taraf', rest: '15s' },
      ] },
      { day: 'Çarşamba', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
      { day: 'Perşembe', focus: 'İnversiyon Hazırlık', emoji: '🙃', exercises: [
        { name: 'Dolphin Pose', sets: 5, reps: '30s', rest: '30s' },
        { name: 'Forearm Stand — Duvarda', sets: 5, reps: '20s', rest: '45s' },
        { name: 'Headstand Prep (Sirsasana)', sets: 3, reps: '15s', rest: '45s' },
        { name: 'Shoulder Stand (Sarvangasana)', sets: 3, reps: '30s', rest: '30s' },
      ] },
      { day: 'Cuma', focus: 'Power Vinyasa', emoji: '⚡', exercises: [
        { name: 'Sun Salutation C', sets: 5, reps: '1 akış', rest: '20s' },
        { name: 'Extended Side Angle', sets: 2, reps: '30s/taraf', rest: '15s' },
        { name: 'Revolved Triangle', sets: 2, reps: '30s/taraf', rest: '15s' },
        { name: 'Dancer Pose (Natarajasana)', sets: 2, reps: '20s/taraf', rest: '15s' },
        { name: 'Eagle Pose', sets: 2, reps: '30s/taraf', rest: '15s' },
      ] },
      { day: 'Cumartesi', focus: 'Pranayama & Meditasyon', emoji: '🌬️', exercises: [
        { name: 'Nadi Shodhana', sets: 5, reps: '3 dk', rest: '15s' },
        { name: 'Kapalabhati', sets: 3, reps: '30 nefes', rest: '30s' },
        { name: 'Seated Meditation', sets: 1, reps: '15 dk', rest: '-' },
      ] },
      { day: 'Pazar', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
    ],
    // ─── Phase 2 — İleri: İnversiyonlar & Derin Backbend ───
    [
      { day: 'Pazartesi', focus: 'Headstand & Handstand', emoji: '🤸', exercises: [
        { name: 'Sirsasana (Headstand)', sets: 3, reps: '1 dk', rest: '60s' },
        { name: 'Pincha Mayurasana (Forearm Stand)', sets: 5, reps: '20s', rest: '60s' },
        { name: 'Handstand — Kick-Up', sets: 5, reps: '10s', rest: '60s' },
        { name: 'Scorpion Pose Prep', sets: 3, reps: '10s', rest: '60s' },
      ] },
      { day: 'Salı', focus: 'Derin Backbend', emoji: '🌉', exercises: [
        { name: 'Wheel Pose (Urdhva Dhanurasana)', sets: 3, reps: '30s', rest: '45s' },
        { name: 'King Pigeon (Eka Pada)', sets: 2, reps: '30s/taraf', rest: '30s' },
        { name: 'Camel Pose (Ustrasana)', sets: 3, reps: '30s', rest: '30s' },
        { name: 'Bow Pose (Dhanurasana)', sets: 3, reps: '30s', rest: '30s' },
      ] },
      { day: 'Çarşamba', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
      { day: 'Perşembe', focus: 'Arm Balance Master', emoji: '💪', exercises: [
        { name: 'Flying Crow', sets: 5, reps: '10s', rest: '45s' },
        { name: 'Astavakrasana (Eight Angle)', sets: 3, reps: '15s/taraf', rest: '45s' },
        { name: 'Firefly (Tittibhasana)', sets: 3, reps: '15s', rest: '45s' },
        { name: 'Side Crow', sets: 3, reps: '15s/taraf', rest: '45s' },
      ] },
      { day: 'Cuma', focus: 'Ashtanga Primary', emoji: '🔥', exercises: [
        { name: 'Ashtanga Primary Series (Kısa)', sets: 1, reps: '60 dk', rest: '-' },
      ] },
      { day: 'Cumartesi', focus: 'Yin & Restore', emoji: '🌸', exercises: [
        { name: 'Yin — Saddle', sets: 1, reps: '5 dk', rest: '-' },
        { name: 'Yin — Caterpillar', sets: 1, reps: '5 dk', rest: '-' },
        { name: 'Yin — Sphinx', sets: 1, reps: '5 dk', rest: '-' },
        { name: 'Yoga Nidra', sets: 1, reps: '20 dk', rest: '-' },
      ] },
      { day: 'Pazar', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
    ],
    // ─── Phase 3 — Usta: Kompleks Diziler & Pranayama ──────
    [
      { day: 'Pazartesi', focus: 'Full Ashtanga', emoji: '🏆', exercises: [
        { name: 'Ashtanga Primary + Intermediate', sets: 1, reps: '90 dk', rest: '-' },
      ] },
      { day: 'Salı', focus: 'İleri İnversiyon', emoji: '🤸', exercises: [
        { name: 'Free Handstand', sets: 5, reps: '30s', rest: '60s' },
        { name: 'Scorpion Pose', sets: 3, reps: '15s', rest: '60s' },
        { name: 'Peacock Pose (Mayurasana)', sets: 3, reps: '15s', rest: '45s' },
        { name: 'Flying Pigeon', sets: 3, reps: '10s/taraf', rest: '45s' },
      ] },
      { day: 'Çarşamba', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
      { day: 'Perşembe', focus: 'İleri Pranayama', emoji: '🌬️', exercises: [
        { name: 'Kumbhaka (Nefes Tutma)', sets: 5, reps: '3 dk', rest: '30s' },
        { name: 'Surya Bhedana', sets: 3, reps: '5 dk', rest: '15s' },
        { name: 'Bandha Çalışması (Mula, Uddiyana)', sets: 3, reps: '3 dk', rest: '15s' },
        { name: 'Meditasyon Oturumu', sets: 1, reps: '30 dk', rest: '-' },
      ] },
      { day: 'Cuma', focus: 'Yaratıcı Akış', emoji: '🎨', exercises: [
        { name: 'Serbest Vinyasa Flow', sets: 1, reps: '45 dk', rest: '-' },
        { name: 'Handstand Geçişler', sets: 5, reps: '3 geçiş', rest: '45s' },
      ] },
      { day: 'Cumartesi', focus: 'Restore & Reflect', emoji: '🌸', exercises: [
        { name: 'Yin Yoga Derin Seri', sets: 1, reps: '45 dk', rest: '-' },
        { name: 'Yoga Nidra', sets: 1, reps: '30 dk', rest: '-' },
      ] },
      { day: 'Pazar', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
    ],
  ],

  // ═══════════════════════════════════════════════════════════
  // PİLATES — 4 Faz (Mat)
  // ═══════════════════════════════════════════════════════════
  pilates: [
    // ─── Phase 0 — Temel: Mat Pilates Başlangıç ───────────
    [
      { day: 'Pazartesi', focus: 'Core & Temel', emoji: '🎯', exercises: [
        { name: 'The Hundred', sets: 3, reps: '10 nefes', rest: '30s' },
        { name: 'Roll Up', sets: 3, reps: '8', rest: '30s' },
        { name: 'Single Leg Circle', sets: 2, reps: '8/taraf', rest: '15s' },
        { name: 'Rolling Like a Ball', sets: 3, reps: '10', rest: '15s' },
        { name: 'Single Leg Stretch', sets: 3, reps: '10/taraf', rest: '15s' },
      ] },
      { day: 'Salı', focus: 'Alt Vücut', emoji: '🦵', exercises: [
        { name: 'Pelvic Curl', sets: 3, reps: '10', rest: '30s' },
        { name: 'Side Leg Lift Series', sets: 3, reps: '12/taraf', rest: '15s' },
        { name: 'Clam Shell', sets: 3, reps: '15/taraf', rest: '15s' },
        { name: 'Inner Thigh Lift', sets: 3, reps: '12/taraf', rest: '15s' },
        { name: 'Bridge Variations', sets: 3, reps: '10', rest: '30s' },
      ] },
      { day: 'Çarşamba', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
      { day: 'Perşembe', focus: 'Üst Vücut & Sırt', emoji: '💪', exercises: [
        { name: 'Swimming', sets: 3, reps: '10 nefes', rest: '30s' },
        { name: 'Swan Dive Prep', sets: 3, reps: '8', rest: '30s' },
        { name: 'Arm Circles (Hafif Ağırlık)', sets: 3, reps: '12', rest: '15s' },
        { name: 'Push-Up (Pilates)', sets: 3, reps: '8', rest: '30s' },
        { name: 'Back Extension', sets: 3, reps: '10', rest: '30s' },
      ] },
      { day: 'Cuma', focus: 'Tam Vücut Akış', emoji: '⚡', exercises: [
        { name: 'Teaser Prep', sets: 3, reps: '8', rest: '30s' },
        { name: 'Criss Cross', sets: 3, reps: '10/taraf', rest: '15s' },
        { name: 'Double Leg Stretch', sets: 3, reps: '10', rest: '30s' },
        { name: 'Spine Stretch Forward', sets: 3, reps: '8', rest: '15s' },
        { name: 'Saw', sets: 3, reps: '8/taraf', rest: '15s' },
      ] },
      { day: 'Cumartesi', focus: 'Esneklik & Toparlanma', emoji: '🌸', exercises: [
        { name: 'Mermaid Stretch', sets: 2, reps: '30s/taraf', rest: '15s' },
        { name: 'Spine Twist', sets: 2, reps: '8/taraf', rest: '15s' },
        { name: 'Foam Roller Sırt', sets: 1, reps: '5 dk', rest: '-' },
        { name: 'Hip Flexor Stretch', sets: 2, reps: '30s/taraf', rest: '15s' },
      ] },
      { day: 'Pazar', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
    ],
    // ─── Phase 1 — Orta: Zorlayıcı Mat ────────────────────
    [
      { day: 'Pazartesi', focus: 'İleri Core', emoji: '🎯', exercises: [
        { name: 'Teaser (Full)', sets: 3, reps: '8', rest: '30s' },
        { name: 'Jackknife', sets: 3, reps: '6', rest: '30s' },
        { name: 'Hip Circles', sets: 3, reps: '6/yön', rest: '15s' },
        { name: 'Corkscrew', sets: 3, reps: '6/yön', rest: '15s' },
        { name: 'Neck Pull', sets: 3, reps: '8', rest: '30s' },
      ] },
      { day: 'Salı', focus: 'Lateral & Rotasyon', emoji: '🔄', exercises: [
        { name: 'Side Bend', sets: 3, reps: '8/taraf', rest: '15s' },
        { name: 'Twist (Spine Twist Supine)', sets: 3, reps: '8/taraf', rest: '15s' },
        { name: 'Thread the Needle', sets: 3, reps: '8/taraf', rest: '15s' },
        { name: 'Side Plank Pilates', sets: 3, reps: '20s/taraf', rest: '30s' },
      ] },
      { day: 'Çarşamba', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
      { day: 'Perşembe', focus: 'Props ile Pilates', emoji: '🏐', exercises: [
        { name: 'Magic Circle — Inner Thigh', sets: 3, reps: '15', rest: '15s' },
        { name: 'Magic Circle — Chest Press', sets: 3, reps: '12', rest: '15s' },
        { name: 'Resistance Band Roll Up', sets: 3, reps: '10', rest: '30s' },
        { name: 'Ball Between Knees Bridge', sets: 3, reps: '12', rest: '30s' },
      ] },
      { day: 'Cuma', focus: 'Tam Vücut Challenge', emoji: '⚡', exercises: [
        { name: 'Control Balance', sets: 3, reps: '6/taraf', rest: '30s' },
        { name: 'Boomerang', sets: 3, reps: '6', rest: '30s' },
        { name: 'Seal', sets: 3, reps: '10', rest: '15s' },
        { name: 'Rocker with Open Legs', sets: 3, reps: '8', rest: '30s' },
      ] },
      { day: 'Cumartesi', focus: 'Mobility & Stretch', emoji: '🌸', exercises: [
        { name: 'Roll Down (Standing)', sets: 3, reps: '6', rest: '15s' },
        { name: 'Figure 4 Stretch', sets: 2, reps: '1 dk/taraf', rest: '15s' },
        { name: 'Thoracic Spine Rotation', sets: 3, reps: '8/taraf', rest: '15s' },
        { name: 'Neck & Shoulder Release', sets: 1, reps: '5 dk', rest: '-' },
      ] },
      { day: 'Pazar', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
    ],
    // ─── Phase 2 — İleri: Full Mat Repertoire ──────────────
    [
      { day: 'Pazartesi', focus: 'Klasik Mat Seri', emoji: '🎯', exercises: [
        { name: 'Hundred → Roll Up → Rollover', sets: 1, reps: 'Akış', rest: '-' },
        { name: 'Leg Circle → Rolling → Series of 5', sets: 1, reps: 'Akış', rest: '-' },
        { name: 'Spine Stretch → Open Leg Rocker', sets: 1, reps: 'Akış', rest: '-' },
        { name: 'Corkscrew → Saw → Swan Dive', sets: 1, reps: 'Akış', rest: '-' },
      ] },
      { day: 'Salı', focus: 'Side Kick Serisi', emoji: '🦵', exercises: [
        { name: 'Side Kick Front-Back', sets: 3, reps: '10/taraf', rest: '15s' },
        { name: 'Side Kick Up-Down', sets: 3, reps: '10/taraf', rest: '15s' },
        { name: 'Side Kick Circles', sets: 3, reps: '8/taraf', rest: '15s' },
        { name: 'Inner Thigh Presses', sets: 3, reps: '12/taraf', rest: '15s' },
        { name: 'Hot Potato', sets: 3, reps: '8/taraf', rest: '15s' },
      ] },
      { day: 'Çarşamba', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
      { day: 'Perşembe', focus: 'İleri Sırt & Extension', emoji: '🌉', exercises: [
        { name: 'Swan Dive (Full)', sets: 3, reps: '6', rest: '45s' },
        { name: 'Swimming (İleri)', sets: 3, reps: '20 nefes', rest: '30s' },
        { name: 'Rocking', sets: 3, reps: '8', rest: '30s' },
        { name: 'Shoulder Bridge', sets: 3, reps: '8/taraf', rest: '30s' },
      ] },
      { day: 'Cuma', focus: 'Inversions & Challenge', emoji: '🤸', exercises: [
        { name: 'Scissors (Üst Pozisyon)', sets: 3, reps: '8/taraf', rest: '30s' },
        { name: 'Bicycle (Üst Pozisyon)', sets: 3, reps: '8/taraf', rest: '30s' },
        { name: 'Jackknife', sets: 3, reps: '6', rest: '45s' },
        { name: 'Teaser 1-2-3', sets: 3, reps: '4', rest: '30s' },
      ] },
      { day: 'Cumartesi', focus: 'Restoratif', emoji: '🌸', exercises: [
        { name: 'Wall Roll Down', sets: 3, reps: '6', rest: '15s' },
        { name: 'Constructive Rest', sets: 1, reps: '10 dk', rest: '-' },
        { name: 'Full Body Stretch Serisi', sets: 1, reps: '10 dk', rest: '-' },
      ] },
      { day: 'Pazar', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
    ],
    // ─── Phase 3 — Usta: Koreografi & Master Class ─────────
    [
      { day: 'Pazartesi', focus: 'Full Mat (45 dk)', emoji: '🏆', exercises: [
        { name: 'Joseph Pilates Orijinal 34 Hareket', sets: 1, reps: '45 dk akış', rest: '-' },
      ] },
      { day: 'Salı', focus: 'İleri Props', emoji: '🏐', exercises: [
        { name: 'Magic Circle Full Body Serisi', sets: 1, reps: '20 dk', rest: '-' },
        { name: 'Resistance Band Complex', sets: 1, reps: '15 dk', rest: '-' },
        { name: 'Foam Roller Challenge', sets: 1, reps: '15 dk', rest: '-' },
      ] },
      { day: 'Çarşamba', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
      { day: 'Perşembe', focus: 'Kontrol & Denge', emoji: '⚖️', exercises: [
        { name: 'Star', sets: 3, reps: '15s/taraf', rest: '30s' },
        { name: 'Twist', sets: 3, reps: '8/taraf', rest: '30s' },
        { name: 'Snake/Twist', sets: 3, reps: '6/taraf', rest: '30s' },
        { name: 'Push-Up → Pike → Teaser Geçiş', sets: 3, reps: '4 geçiş', rest: '45s' },
      ] },
      { day: 'Cuma', focus: 'Koreografik Akış', emoji: '💃', exercises: [
        { name: 'Mat Koreografi (Müzikli)', sets: 1, reps: '30 dk', rest: '-' },
        { name: 'Serbest Hareket Çalışması', sets: 1, reps: '15 dk', rest: '-' },
      ] },
      { day: 'Cumartesi', focus: 'Mindful Movement', emoji: '🌸', exercises: [
        { name: 'Pilates + Yoga Fusion', sets: 1, reps: '30 dk', rest: '-' },
        { name: 'Body Awareness Meditasyon', sets: 1, reps: '15 dk', rest: '-' },
      ] },
      { day: 'Pazar', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
    ],
  ],

  // ═══════════════════════════════════════════════════════════
  // REFORMER — 4 Faz
  // ═══════════════════════════════════════════════════════════
  reformer: [
    // ─── Phase 0 — Temel: Reformer Başlangıç ──────────────
    [
      { day: 'Pazartesi', focus: 'Reformer Temeller', emoji: '🔧', exercises: [
        { name: 'Footwork (Paralel)', sets: 3, reps: '10', rest: '30s' },
        { name: 'Footwork (V Pozisyon)', sets: 3, reps: '10', rest: '30s' },
        { name: 'Leg Circles (Kayışlı)', sets: 3, reps: '8/taraf', rest: '15s' },
        { name: 'Short Spine', sets: 3, reps: '6', rest: '30s' },
        { name: 'Coordination', sets: 3, reps: '8', rest: '30s' },
      ] },
      { day: 'Salı', focus: 'Kol & Omuz', emoji: '💪', exercises: [
        { name: 'Arms Pulling Straps', sets: 3, reps: '10', rest: '30s' },
        { name: 'Arms T-Shape', sets: 3, reps: '10', rest: '30s' },
        { name: 'Bicep Curls (Reformer)', sets: 3, reps: '12', rest: '15s' },
        { name: 'Chest Expansion', sets: 3, reps: '10', rest: '30s' },
        { name: 'Rowing Series', sets: 3, reps: '8', rest: '30s' },
      ] },
      { day: 'Çarşamba', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
      { day: 'Perşembe', focus: 'Bacak & Kalça', emoji: '🦵', exercises: [
        { name: 'Leg Press (Single Leg)', sets: 3, reps: '10/taraf', rest: '30s' },
        { name: 'Standing Lunge', sets: 3, reps: '10/taraf', rest: '30s' },
        { name: 'Side Splits', sets: 2, reps: '8', rest: '30s' },
        { name: 'Scooter', sets: 3, reps: '10/taraf', rest: '30s' },
        { name: 'Eve\'s Lunge', sets: 2, reps: '8/taraf', rest: '30s' },
      ] },
      { day: 'Cuma', focus: 'Core & Tam Vücut', emoji: '🎯', exercises: [
        { name: 'Long Stretch', sets: 3, reps: '8', rest: '30s' },
        { name: 'Elephant', sets: 3, reps: '10', rest: '30s' },
        { name: 'Stomach Massage Series', sets: 3, reps: '8', rest: '30s' },
        { name: 'Snake/Twist', sets: 2, reps: '6', rest: '30s' },
        { name: 'Control Balance', sets: 2, reps: '6', rest: '30s' },
      ] },
      { day: 'Cumartesi', focus: 'Esneklik', emoji: '🌸', exercises: [
        { name: 'Hip Stretch Series', sets: 2, reps: '30s/taraf', rest: '15s' },
        { name: 'Knee Stretch Series', sets: 3, reps: '10', rest: '30s' },
        { name: 'Hamstring Stretch', sets: 2, reps: '30s/taraf', rest: '15s' },
        { name: 'Mermaid (Reformer)', sets: 2, reps: '6/taraf', rest: '15s' },
      ] },
      { day: 'Pazar', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
    ],
    // ─── Phase 1 — Orta: Artan Yay & İleri Hareketler ─────
    [
      { day: 'Pazartesi', focus: 'İleri Footwork & Legs', emoji: '🦵', exercises: [
        { name: 'Single Leg Footwork', sets: 3, reps: '10/taraf', rest: '30s' },
        { name: 'Running on Reformer', sets: 3, reps: '20', rest: '30s' },
        { name: 'Leg Circles (Ağır Yay)', sets: 3, reps: '8/taraf', rest: '15s' },
        { name: 'Frog', sets: 3, reps: '10', rest: '15s' },
        { name: 'Long Spine', sets: 3, reps: '6', rest: '45s' },
      ] },
      { day: 'Salı', focus: 'İleri Arms & Back', emoji: '💪', exercises: [
        { name: 'Pulling Straps II', sets: 3, reps: '10', rest: '30s' },
        { name: 'Backstroke', sets: 3, reps: '8', rest: '30s' },
        { name: 'Rowing — Shaving', sets: 3, reps: '10', rest: '15s' },
        { name: 'Rowing — Hug a Tree', sets: 3, reps: '10', rest: '15s' },
        { name: 'Reverse Chest Expansion', sets: 3, reps: '8', rest: '30s' },
      ] },
      { day: 'Çarşamba', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
      { day: 'Perşembe', focus: 'Box Çalışmaları', emoji: '📦', exercises: [
        { name: 'Short Box — Round Back', sets: 3, reps: '8', rest: '30s' },
        { name: 'Short Box — Flat Back', sets: 3, reps: '8', rest: '30s' },
        { name: 'Short Box — Side Reach', sets: 3, reps: '8/taraf', rest: '15s' },
        { name: 'Short Box — Twist', sets: 3, reps: '8/taraf', rest: '15s' },
        { name: 'Long Box — Pulling Straps', sets: 3, reps: '10', rest: '30s' },
      ] },
      { day: 'Cuma', focus: 'Tam Vücut Flow', emoji: '⚡', exercises: [
        { name: 'Stomach Massage — Round', sets: 3, reps: '8', rest: '15s' },
        { name: 'Stomach Massage — Hands Back', sets: 3, reps: '8', rest: '15s' },
        { name: 'Stomach Massage — Reach', sets: 3, reps: '8', rest: '15s' },
        { name: 'Semi Circle', sets: 3, reps: '6/yön', rest: '30s' },
      ] },
      { day: 'Cumartesi', focus: 'Stretch & Restore', emoji: '🌸', exercises: [
        { name: 'Front Splits', sets: 2, reps: '30s/taraf', rest: '15s' },
        { name: 'Russian Splits', sets: 2, reps: '30s', rest: '30s' },
        { name: 'Mermaid (İleri)', sets: 2, reps: '8/taraf', rest: '15s' },
      ] },
      { day: 'Pazar', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
    ],
    // ─── Phase 2 — İleri: Jump Board & Full Repertoire ─────
    [
      { day: 'Pazartesi', focus: 'Jump Board Kardiyo', emoji: '🦘', exercises: [
        { name: 'Basic Jumps (Paralel)', sets: 3, reps: '20', rest: '30s' },
        { name: 'Jumps (First Position)', sets: 3, reps: '20', rest: '30s' },
        { name: 'Alternating Jumps', sets: 3, reps: '20', rest: '30s' },
        { name: 'Scissors Jumps', sets: 3, reps: '16', rest: '30s' },
        { name: 'Single Leg Jumps', sets: 3, reps: '10/taraf', rest: '30s' },
      ] },
      { day: 'Salı', focus: 'İleri Kol & Sırt', emoji: '💪', exercises: [
        { name: 'Long Stretch Series', sets: 3, reps: '8', rest: '45s' },
        { name: 'Up Stretch', sets: 3, reps: '6', rest: '45s' },
        { name: 'Arabesque', sets: 3, reps: '6/taraf', rest: '30s' },
        { name: 'Balance Control Front', sets: 3, reps: '6', rest: '45s' },
      ] },
      { day: 'Çarşamba', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
      { day: 'Perşembe', focus: 'Inversions & Challenge', emoji: '🤸', exercises: [
        { name: 'Headstand on Reformer', sets: 3, reps: '15s', rest: '60s' },
        { name: 'Control Balance (İleri)', sets: 3, reps: '6/taraf', rest: '45s' },
        { name: 'Star on Reformer', sets: 3, reps: '6/taraf', rest: '45s' },
        { name: 'Snake (Full)', sets: 3, reps: '6/taraf', rest: '45s' },
      ] },
      { day: 'Cuma', focus: 'Tam Vücut Master', emoji: '🎯', exercises: [
        { name: 'Full Reformer Flow (45 dk)', sets: 1, reps: '45 dk', rest: '-' },
      ] },
      { day: 'Cumartesi', focus: 'Toparlanma', emoji: '🌸', exercises: [
        { name: 'Leg Spring Series', sets: 1, reps: '15 dk', rest: '-' },
        { name: 'Arm Spring Series', sets: 1, reps: '15 dk', rest: '-' },
        { name: 'Stretch Serisi', sets: 1, reps: '10 dk', rest: '-' },
      ] },
      { day: 'Pazar', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
    ],
    // ─── Phase 3 — Usta: Koreografi & Tower ────────────────
    [
      { day: 'Pazartesi', focus: 'Master Reformer', emoji: '🏆', exercises: [
        { name: 'Full Classical Repertoire', sets: 1, reps: '50 dk', rest: '-' },
      ] },
      { day: 'Salı', focus: 'Tower / Cadillac', emoji: '🗼', exercises: [
        { name: 'Roll Back Bar', sets: 3, reps: '8', rest: '30s' },
        { name: 'Leg Springs (İleri)', sets: 3, reps: '10/taraf', rest: '15s' },
        { name: 'Push Through Bar — Front', sets: 3, reps: '8', rest: '30s' },
        { name: 'Push Through Bar — Back', sets: 3, reps: '8', rest: '30s' },
        { name: 'Hanging Pull-Ups', sets: 3, reps: '6', rest: '45s' },
      ] },
      { day: 'Çarşamba', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
      { day: 'Perşembe', focus: 'Jump Board İleri', emoji: '🦘', exercises: [
        { name: 'Plyometric Jumps', sets: 3, reps: '15', rest: '30s' },
        { name: 'Tuck Jumps', sets: 3, reps: '12', rest: '30s' },
        { name: 'Split Jumps', sets: 3, reps: '10/taraf', rest: '30s' },
        { name: 'Lateral Jumps', sets: 3, reps: '12', rest: '30s' },
        { name: 'Single Leg Plyos', sets: 3, reps: '8/taraf', rest: '45s' },
      ] },
      { day: 'Cuma', focus: 'Wunda Chair', emoji: '🪑', exercises: [
        { name: 'Pike on Chair', sets: 3, reps: '8', rest: '30s' },
        { name: 'Teaser on Chair', sets: 3, reps: '6', rest: '30s' },
        { name: 'Going Up Front', sets: 3, reps: '8/taraf', rest: '30s' },
        { name: 'Swan on Chair', sets: 3, reps: '6', rest: '45s' },
        { name: 'Horseback', sets: 3, reps: '8', rest: '30s' },
      ] },
      { day: 'Cumartesi', focus: 'Mindful Movement', emoji: '🌸', exercises: [
        { name: 'Reformer + Mat Fusion', sets: 1, reps: '30 dk', rest: '-' },
        { name: 'Nefes & Meditasyon', sets: 1, reps: '15 dk', rest: '-' },
      ] },
      { day: 'Pazar', focus: 'Dinlenme', emoji: '😴', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] },
    ],
  ],
};

// ── Bütçe çarpanı ────────────────────────────────────────
const budgetMultipliers = {
  economy: 0.72,
  moderate: 1.0,
  premium: 1.18,
};

const ECONOMY_FOOD_SWAPS = {
  tr: [
    [/somon|levrek|palamut|ton balık/iu, 'Mercimek + nohut bowl'],
    [/dana bonfile|köfte/iu, 'Tavuk but veya kuru fasulye'],
    [/whey protein|protein bar|protein shake/iu, 'Yoğurt + yulaf'],
    [/kinoa/iu, 'Bulgur veya pirinç'],
    [/avokado/iu, 'Zeytinyağlı mevsim salatası'],
  ],
  en: [
    [/salmon|tuna|sea bass|mackerel/iu, 'Lentil and chickpea bowl'],
    [/beef|steak|meatball/iu, 'Chicken thighs or beans'],
    [/whey protein|protein bar|protein shake/iu, 'Yogurt and oats'],
    [/quinoa/iu, 'Brown rice'],
    [/avocado/iu, 'Seasonal salad with olive oil'],
  ],
  es: [
    [/salmón|atún|lubina|caballa/iu, 'Bowl de lentejas y garbanzos'],
    [/ternera|bistec|albóndiga/iu, 'Pollo o alubias'],
    [/proteína whey|barra de proteína|batido de proteína/iu, 'Yogur con avena'],
    [/quinoa/iu, 'Arroz integral'],
    [/aguacate/iu, 'Ensalada de temporada con aceite de oliva'],
  ],
};

function applyEconomyFoodSwap(item, lang) {
  const swaps = ECONOMY_FOOD_SWAPS[lang] || ECONOMY_FOOD_SWAPS.tr;
  const match = swaps.find(([pattern]) => pattern.test(item));
  return match ? match[1] : item;
}

function applyBudgetToMeals(meals, budget, lang) {
  const mult = budgetMultipliers[budget] || 1.0;
  return meals.map((m) => ({
    ...m,
    items: budget === 'economy' ? m.items.map((item) => applyEconomyFoodSwap(item, lang)) : m.items,
    price: Math.round((m.price || 0) * mult),
    budgetAdjusted: budget === 'economy',
  }));
}

function parseClock(value) {
  const [hours, minutes] = String(value || '00:00').split(':').map(Number);
  return (hours * 60 + minutes) % 1440;
}

function formatClock(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function getScheduleOffset(workSchedule) {
  const schedule = (Array.isArray(workSchedule) ? workSchedule : [workSchedule])
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (/night|gece|noche/.test(schedule)) return 240;
  if (/early|sabah|morning|mañana/.test(schedule)) return -60;
  if (/late|akşam|evening|tarde/.test(schedule)) return 120;
  return 0;
}

function applyMealTiming(meals, workSchedule) {
  const offset = getScheduleOffset(workSchedule);
  if (!offset) return meals;
  return meals.map((meal) => ({
    ...meal,
    time: formatClock(parseClock(meal.time) + offset),
    scheduleAdjusted: true,
  }));
}

// ── Ana Fonksiyon ────────────────────────────────────────
// ── Haftalık gün sayısı ve bölgesel odak ─────────────────
function exerciseTargetsArea(exercise, areaKey) {
  const area = FOCUS_AREAS[areaKey];
  if (!area || !exercise?.name) return false;
  const mapped = EXERCISE_MUSCLE_MAP[exercise.name];
  if (mapped && mapped.some((muscle) => area.muscles.includes(muscle))) return true;
  const labels = Array.isArray(exercise.muscles) ? exercise.muscles.join(' ').toLowerCase() : '';
  return area.keywords.some((keyword) => labels.includes(keyword));
}

function dayAllowsArea(day, areaKey) {
  const area = FOCUS_AREAS[areaKey];
  const category = getFocusMuscleCategory(day.focus || '');
  if (['full_body', 'hiit'].includes(category)) return true;
  const allowed = FOCUS_ALLOWED_MUSCLES[category] || [];
  return area.muscles.some((muscle) => allowed.includes(muscle));
}

function countAreaSets(workoutSplit, areaKey) {
  return workoutSplit.reduce((total, day) => {
    if (isRestLikeDay(day)) return total;
    return total + (day.exercises || []).reduce((sum, exercise) => {
      const sets = Number(exercise.sets);
      return exerciseTargetsArea(exercise, areaKey) && Number.isFinite(sets) ? sum + sets : sum;
    }, 0);
  }, 0);
}

/**
 * Adds a capped amount of extra volume for the member's priority regions:
 * one extra set on up to two existing exercises per compatible day, and one
 * accessory exercise on up to two days per week. Never exceeds WEEKLY_SET_CAP.
 */
export function applyFocusEmphasis(workoutSplit, focusAreas, environment) {
  const areas = normalizeFocusAreas(focusAreas);
  if (areas.length === 0) return workoutSplit;
  const envKey = ['home_basic', 'home_bodyweight'].includes(environment) ? environment : 'gym';

  return areas.reduce((split, areaKey) => {
    const baseSets = countAreaSets(split, areaKey);
    let budget = baseSets >= WEEKLY_SET_CAP ? 0 : Math.min(MAX_ADDED_SETS, WEEKLY_SET_CAP - baseSets);
    if (budget <= 0) return split;
    const pool = FOCUS_AREAS[areaKey].accessories[envKey] || FOCUS_AREAS[areaKey].accessories.home_bodyweight;
    let accessoriesAdded = 0;
    let poolIndex = 0;

    return split.map((day) => {
      if (budget <= 0 || isRestLikeDay(day) || !Array.isArray(day.exercises) || !dayAllowsArea(day, areaKey)) return day;
      const exercises = day.exercises.map((exercise) => ({ ...exercise }));
      // Accessory first so the region gets a dedicated movement before extra sets.
      if (accessoriesAdded < 2 && budget >= 2) {
        const accessory = pool[poolIndex % pool.length];
        poolIndex += 1;
        if (!exercises.some((exercise) => exercise.name === accessory.name)) {
          exercises.push({ ...accessory, focusArea: areaKey });
          accessoriesAdded += 1;
          budget -= accessory.sets;
        }
      }
      let bumped = 0;
      for (const exercise of exercises) {
        if (bumped >= 1 || budget <= 0) break;
        const sets = Number(exercise.sets);
        if (exercise.focusArea || !exerciseTargetsArea(exercise, areaKey) || !Number.isFinite(sets) || sets >= 5) continue;
        exercise.sets = sets + 1;
        exercise.focusBoost = areaKey;
        bumped += 1;
        budget -= 1;
      }
      return { ...day, exercises, focusAreas: [...(day.focusAreas || []), areaKey] };
    });
  }, workoutSplit);
}

/**
 * Trims a phase template to the number of training days the member can do,
 * keeping the most diverse set of sessions and spreading them over the week.
 */
export function applyTrainingDays(workoutSplit, requestedDays) {
  const days = normalizeTrainingDays(requestedDays);
  if (!days) return workoutSplit;
  const training = workoutSplit.filter((day) => !isRestLikeDay(day));
  if (training.length <= days) return workoutSplit;

  const chosen = [];
  const seenCategories = new Set();
  for (const day of training) {
    const category = getFocusMuscleCategory(day.focus || '');
    if (chosen.length < days && !seenCategories.has(category)) {
      chosen.push(day);
      seenCategories.add(category);
    }
  }
  for (const day of training) {
    if (chosen.length >= days) break;
    if (!chosen.includes(day)) chosen.push(day);
  }
  const ordered = training.filter((day) => chosen.includes(day));
  const restTemplate = workoutSplit.find(isRestLikeDay) || {};
  const slots = WEEK_SLOTS[days];

  return WEEKDAY_NAMES.map((dayName, index) => {
    const slot = slots.indexOf(index);
    if (slot >= 0) return { ...ordered[slot], day: dayName };
    return {
      ...restTemplate,
      day: dayName,
      focus: 'Dinlenme',
      emoji: '😴',
      exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }],
    };
  });
}

function buildThreeDayStrengthWeek() {
  const sessions = [
    ['Leg Press', 'Bench Press', 'Seated Cable Row', 'Romanian Deadlift', 'Standing Calf Raise'],
    ['Goblet Squat', 'Dumbbell Shoulder Press', 'Lat Pulldown', 'Hip Thrust', 'Leg Curl'],
    ['Reverse Lunge', 'Incline Dumbbell Press', 'Seated Cable Row', 'Romanian Deadlift', 'Lateral Raise'],
  ];
  return WEEKDAY_NAMES.map((day, index) => {
    const slot = WEEK_SLOTS[3].indexOf(index);
    if (slot < 0) return { day, focus: 'Dinlenme', exercises: [{ name: 'Tam Dinlenme', sets: '-', reps: '-', rest: '-' }] };
    return {
      day, focus: `Full Body ${['A', 'B', 'C'][slot]}`,
      exercises: sessions[slot].map((name) => ({ name, sets: 3, reps: '8-12', rest: '90s' })),
    };
  });
}

export function normalizeTrainingEnvironment(primaryGoal, environment) {
  if (primaryGoal === 'reformer') {
    return ['studio', 'home_reformer'].includes(environment) ? environment : 'studio';
  }
  if (['yoga', 'pilates', 'meditation'].includes(primaryGoal)) return 'home_bodyweight';
  return ['gym', 'home_bodyweight', 'home_basic'].includes(environment) ? environment : 'gym';
}

export function generatePlan(userMetrics, phase = 0, lang = 'tr') {
  const {
    name, age: rawAge, gender, height: rawHeight, weight: rawWeight,
    bodyFatPercentage: rawBF, experience, activityLevel,
    primaryGoal, workSchedule, budget,
    healthConditions = [], allergies = [], trainingEnvironment: rawTrainingEnvironment,
    focusAreas: rawFocusAreas = [], trainingDaysPerWeek: rawTrainingDays = null,
  } = userMetrics;
  const trainingEnvironment = normalizeTrainingEnvironment(primaryGoal, rawTrainingEnvironment);
  const focusAreas = ['muscle', 'fat_loss'].includes(primaryGoal) ? normalizeFocusAreas(rawFocusAreas) : [];
  const trainingDaysPerWeek = normalizeTrainingDays(rawTrainingDays);

  // ── Input Validation — NaN/Infinity koruması ──
  const age = Math.max(14, Math.min(80, Number(rawAge) || 25));
  const height = Math.max(100, Math.min(250, Number(rawHeight) || 175));
  const weight = Math.max(30, Math.min(300, Number(rawWeight) || 75));
  const parsedBodyFat = Number(rawBF);
  const bodyFatPercentage = Number.isFinite(parsedBodyFat) && parsedBodyFat >= 3 && parsedBodyFat <= 60
    ? parsedBodyFat
    : null;

  // Faz sınırlarını kontrol et + otomatik faz seçimi
  const maxPhase = (workoutPhases[primaryGoal] || workoutPhases.muscle).length - 1;
  // phase === 0 ve ilk oluşturma ise deneyim seviyesine göre otomatik faz seç
  const autoPhase = phase === 0 ? getAutoPhase(experience, maxPhase) : phase;
  const requestedPhase = Math.max(0, Math.min(autoPhase, maxPhase));
  const requiresMedicalClearance = healthConditions.includes('heart_condition');
  const safePhase = requiresMedicalClearance ? Math.min(requestedPhase, 0) : requestedPhase;

  const bmr = calculateBMR(weight, bodyFatPercentage, age || 25, height || 175, gender || 'male');
  const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

  let baseCalories = Math.round(tdee);
  if (age >= 18 && primaryGoal === 'muscle') {
    baseCalories = Math.round(tdee + Math.min(250, tdee * 0.08));
  } else if (age >= 18 && primaryGoal === 'fat_loss') {
    baseCalories = Math.round(tdee - Math.min(500, tdee * 0.15));
  }

  const isHomeStrengthPlan = ['muscle', 'fat_loss'].includes(primaryGoal)
    && ['home_bodyweight', 'home_basic'].includes(trainingEnvironment);
  const templateSplit = isHomeStrengthPlan
    ? buildHomeWorkoutProgram(primaryGoal, trainingEnvironment, safePhase)
    : (workoutPhases[primaryGoal] || workoutPhases.muscle)[safePhase];
  const rawSplit = trainingDaysPerWeek === 3 && !isHomeStrengthPlan && ['muscle', 'fat_loss'].includes(primaryGoal)
    ? buildThreeDayStrengthWeek()
    : applyTrainingDays(templateSplit, trainingDaysPerWeek);
  const templateTrainingDays = templateSplit.filter((day) => !isRestLikeDay(day)).length;

  // Inject core finisher + cardio note into each training day
  let trainingDayCounter = 0;
  let workoutSplit = rawSplit.map((day) => {
    const f = day.focus?.toLowerCase() ?? '';
    const rest = /(^|\s|\/)(dinlenme|rest|off|descanso)(\s|$|\/)/i.test(f);
    if (rest) return { ...day };

    const enriched = {
      ...day,
      image: getWorkoutDayImage(primaryGoal, day.image),
    };

    // ── Deneyim seviyesine göre egzersiz ayarlama ──
    enriched.exercises = applyExperienceModifiers(
      day.exercises ? [...day.exercises] : [],
      experience,
      primaryGoal
    );

    // Core Finisher — rotate through 4 categories (skip for yoga/pilates/meditation/reformer)
    if (!SKIP_CORE_GOALS.has(primaryGoal)) {
      const coreIdx = trainingDayCounter % CORE_POOL.length;
      enriched.coreFinisher = CORE_POOL[coreIdx];
      enriched.coreCategory = (CORE_CATEGORY_LABELS[lang] || CORE_CATEGORY_LABELS.tr)[coreIdx];
    }

    // Cardio Note
    const cardio = getCardioNote(primaryGoal, trainingDayCounter, lang);
    if (cardio) enriched.cardioNote = cardio;

    trainingDayCounter++;
    return enriched;
  });

  workoutSplit = applyFocusEmphasis(workoutSplit, focusAreas, trainingEnvironment);
  // Apply health condition exercise filters, including new focus accessories.
  if (!isHomeStrengthPlan && healthConditions.length > 0 && !healthConditions.includes('none')) {
    workoutSplit.forEach((day) => {
      if (!day.exercises) return;
      day.exercises = day.exercises.map((ex) => {
        for (const condition of healthConditions) {
          const filter = HEALTH_EXERCISE_FILTERS[condition];
          if (!filter) continue;
          const replacement = getHealthExerciseReplacement(ex.name, filter);
          if (replacement !== undefined) return replacement;
        }
        return ex;
      }).filter(Boolean);
    });
  }
  workoutSplit = applyMedicalIntensityGuard(workoutSplit, healthConditions, lang);
  workoutSplit = applyHomeHealthGuard(workoutSplit, healthConditions, trainingEnvironment);

  // ── Egzersiz-Focus doğrulaması ──
  // Her günün egzersizlerinin focus alanıyla uyumlu olmasını garanti et
  if (!isHomeStrengthPlan) workoutSplit = validateAndFixExercises(workoutSplit);
  workoutSplit = enhanceWorkoutQuality(workoutSplit, primaryGoal, safePhase);
  workoutSplit = applyHomeCoreEnvironment(workoutSplit, trainingEnvironment);
  workoutSplit = applyHomeHealthGuard(workoutSplit, healthConditions, trainingEnvironment);

  let equipmentViolations = findHomeEquipmentViolations(workoutSplit, trainingEnvironment);
  if (equipmentViolations.length > 0) {
    console.error('[PlanGenerator] Home equipment validation failed', equipmentViolations);
    workoutSplit = applyTrainingDays(buildHomeWorkoutProgram(primaryGoal, trainingEnvironment, safePhase), trainingDaysPerWeek);
    workoutSplit = enhanceWorkoutQuality(workoutSplit, primaryGoal, safePhase);
    workoutSplit = applyHomeCoreEnvironment(workoutSplit, trainingEnvironment);
    workoutSplit = applyHomeHealthGuard(workoutSplit, healthConditions, trainingEnvironment);
    equipmentViolations = findHomeEquipmentViolations(workoutSplit, trainingEnvironment);
  }

  const mealTypes = workoutSplit.map((day) => getDayMealType(day.focus));
  const dailyCalorieTargets = buildDailyCalorieTargets(baseCalories, mealTypes);

  // Her gün için özel beslenme planı oluştur
  let dailyNutrition = workoutSplit.map((day, dayIndex) => {
    const mealType = getDayMealType(day.focus);
    const dayCalories = dailyCalorieTargets[dayIndex];
    const dayMacros = calculateMacros(dayCalories, primaryGoal, weight);
    const templates = getMealTemplates(lang);
    const template = templates[mealType] || templates.rest;
    const rawMeals = template.meals(dayMacros, dayCalories);
    const budgetMeals = applyBudgetToMeals(rawMeals, budget, lang);
    const meals = applyMealTiming(budgetMeals, workSchedule);
    const totalPrice = meals.reduce((sum, m) => sum + (m.price || 0), 0);

    return {
      day: day.day,
      focus: day.focus,
      emoji: day.emoji,
      mealType,
      mealLabel: template.label,
      calories: dayCalories,
      macros: dayMacros,
      meals,
      totalPrice,
    };
  });

  // Apply food allergy and dietary-preference filters to every meal.
  if (allergies.length > 0 && !allergies.includes('none')) {
    dailyNutrition.forEach((dayNut) => {
      if (!dayNut.meals) return;
      dayNut.meals.forEach((meal) => {
        if (!meal.items) return;
        const removedAllergens = allergies.filter((allergy) =>
          allergy !== 'none' && meal.items.some((item) => itemMatchesAllergy(item, allergy)),
        );
        meal.items = personalizeMealItems(meal.items, { allergies, lang });
        if (removedAllergens.length > 0) {
          meal.allergyAdjusted = true;
          meal.removedAllergens = Array.from(new Set([...(meal.removedAllergens || []), ...removedAllergens]));
        }
      });
    });
  }

  dailyNutrition = calculateNutritionDays(dailyNutrition, { lang, allergies, budget });
  const allergyViolations = findMealAllergyViolations(dailyNutrition, allergies);

  return {
    // Kullanıcı profili
    userName: name || 'User',
    userAge: age,
    userGender: gender,
    userHeight: height,
    userWeight: weight,
    userBodyFat: bodyFatPercentage,
    userExperience: experience,
    userActivityLevel: activityLevel,
    userBudget: budget,
    userWorkSchedule: workSchedule,
    trainingEnvironment,
    primaryGoal,
    focusAreas,
    trainingDaysPerWeek,
    trainingDays: workoutSplit.filter((day) => !isRestLikeDay(day)).length,
    // Faz bilgisi
    phase: safePhase,
    planQuality: {
      ...buildPlanQualitySummary(primaryGoal, safePhase),
      equipmentLabel: {
        tr: { gym: 'Salon ekipmanı', home_basic: 'Dambıl + direnç bandı', home_bodyweight: 'Ekipmansız ev', studio: 'Stüdyo reformer cihazı', home_reformer: 'Ev reformer cihazı' },
        en: { gym: 'Gym equipment', home_basic: 'Dumbbells + resistance band', home_bodyweight: 'No-equipment home', studio: 'Studio reformer machine', home_reformer: 'Home reformer machine' },
        es: { gym: 'Equipo de gimnasio', home_basic: 'Mancuernas + banda', home_bodyweight: 'Casa sin equipo', studio: 'Máquina reformer de estudio', home_reformer: 'Máquina reformer en casa' },
      }[lang]?.[trainingEnvironment] || trainingEnvironment,
      requiresMedicalClearance,
      medicalNotice: requiresMedicalClearance
        ? {
          tr: 'Kalp veya dolaşım sistemiyle ilgili durumlarda programa başlamadan önce sağlık uzmanı onayı gerekir.',
          en: 'Medical clearance is required before starting this plan with a heart or circulatory condition.',
          es: 'Se requiere autorización médica antes de iniciar este plan si existe una afección cardíaca o circulatoria.',
        }[lang]
        : null,
    },
    // Hesaplanan değerler
    dailyCalories: baseCalories,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    bmi: parseFloat((weight / ((height / 100) ** 2)).toFixed(1)),
    macros: calculateMacros(baseCalories, primaryGoal, weight),
    macroPercentages: (() => {
      const macros = calculateMacros(baseCalories, primaryGoal, weight);
      const macroCalories = macros.protein * 4 + macros.carbs * 4 + macros.fat * 9;
      return {
        protein: Math.round((macros.protein * 4 * 100) / macroCalories),
        carbs: Math.round((macros.carbs * 4 * 100) / macroCalories),
        fat: Math.round((macros.fat * 9 * 100) / macroCalories),
      };
    })(),
    dailyNutrition,
    workoutSplit,
    healthConditions,
    allergies,
    personalization: {
      calorieMethod: bodyFatPercentage === null ? 'mifflin_st_jeor' : 'katch_mcardle',
      weeklyAverageCalories: Math.round(dailyCalorieTargets.reduce((sum, calories) => sum + calories, 0) / dailyCalorieTargets.length),
      budgetAdjusted: budget === 'economy',
      scheduleAdjusted: getScheduleOffset(workSchedule) !== 0,
      requiresMedicalClearance,
      requestedPhase,
      appliedPhase: safePhase,
      trainingEnvironment,
      environmentAdjusted: ['home_bodyweight', 'home_basic'].includes(trainingEnvironment),
      focusAreasApplied: focusAreas,
      trainingDaysRequested: trainingDaysPerWeek,
      trainingDaysAdjusted: Boolean(trainingDaysPerWeek) && trainingDaysPerWeek < templateTrainingDays,
      equipmentValidated: equipmentViolations.length === 0
        && (primaryGoal !== 'reformer' || ['studio', 'home_reformer'].includes(trainingEnvironment)),
      allergyValidated: allergyViolations.length === 0,
    },
    goal: {
      tr: { muscle: 'Kas Gelişimi', fat_loss: 'Yağ Yakımı', meditation: 'Meditasyon', yoga: 'Yoga', pilates: 'Pilates', reformer: 'Reformer' },
      en: { muscle: 'Muscle Growth', fat_loss: 'Fat Loss', meditation: 'Meditation', yoga: 'Yoga', pilates: 'Pilates', reformer: 'Reformer' },
      es: { muscle: 'Crecimiento Muscular', fat_loss: 'Quema de Grasa', meditation: 'Meditación', yoga: 'Yoga', pilates: 'Pilates', reformer: 'Reformer' },
    }[lang]?.[primaryGoal] || { muscle: 'Muscle Growth', fat_loss: 'Fat Loss', meditation: 'Meditation', yoga: 'Yoga', pilates: 'Pilates', reformer: 'Reformer' }[primaryGoal] || 'Muscle Growth',
    lang,
    planVersion: PLAN_VERSION,
    createdAt: new Date().toISOString(),
  };
}

// ── Gün Adları ve Focus Lokalizasyonu ────────────────────
const dayNameMap = {
  tr: { 'Pazartesi': 'Pazartesi', 'Salı': 'Salı', 'Çarşamba': 'Çarşamba', 'Perşembe': 'Perşembe', 'Cuma': 'Cuma', 'Cumartesi': 'Cumartesi', 'Pazar': 'Pazar' },
  en: { 'Pazartesi': 'Monday', 'Salı': 'Tuesday', 'Çarşamba': 'Wednesday', 'Perşembe': 'Thursday', 'Cuma': 'Friday', 'Cumartesi': 'Saturday', 'Pazar': 'Sunday' },
  es: { 'Pazartesi': 'Lunes', 'Salı': 'Martes', 'Çarşamba': 'Miércoles', 'Perşembe': 'Jueves', 'Cuma': 'Viernes', 'Cumartesi': 'Sábado', 'Pazar': 'Domingo' },
};

const focusMap = {
  tr: {
    // ── Muscle ──
    'Göğüs & Triceps': 'Göğüs & Triceps', 'Göğüs & Ön Omuz': 'Göğüs & Ön Omuz',
    'Sırt & Biceps': 'Sırt & Biceps', 'Sırt & Arka Omuz': 'Sırt & Arka Omuz',
    'Omuz & Trapez': 'Omuz & Trapez', 'Omuz & Kol': 'Omuz & Kol',
    'Bacak & Core': 'Bacak & Core', 'Bacak & Kalça': 'Bacak & Kalça',
    'Push — Göğüs & Omuz & Triceps': 'Push — Göğüs & Omuz & Triceps',
    'Pull — Sırt & Biceps': 'Pull — Sırt & Biceps',
    'Bacak — Quad Dominant': 'Bacak — Quad Dominant',
    'Üst Vücut — Push & Pull Mix': 'Üst Vücut — Push & Pull Mix',
    'Bacak — Hamstring & Kalça': 'Bacak — Hamstring & Kalça',
    'Göğüs & Triceps — Güç Odaklı': 'Göğüs & Triceps — Güç Odaklı',
    'Sırt & Biceps — Hacim Odaklı': 'Sırt & Biceps — Hacim Odaklı',
    'Bacak — Güç & Patlayıcılık': 'Bacak — Güç & Patlayıcılık',
    'Omuz & Kol — Hipertrofi': 'Omuz & Kol — Hipertrofi',
    'Full Body — Zayıf Nokta Günü': 'Full Body — Zayıf Nokta Günü',
    // ── Fat Loss ──
    'Full Body HIIT': 'Full Body HIIT',
    'Üst Vücut + Kardiyo': 'Üst Vücut + Kardiyo',
    'Alt Vücut Güç': 'Alt Vücut Güç',
    'Metabolik Conditioning': 'Metabolik Conditioning',
    'Üst Vücut HIIT + Güç': 'Üst Vücut HIIT + Güç',
    'Alt Vücut HIIT + Güç': 'Alt Vücut HIIT + Güç',
    'Full Body Metabolik': 'Full Body Metabolik',
    'Push-Pull Kardiyo': 'Push-Pull Kardiyo',
    'HIIT Kardiyo Finisher': 'HIIT Kardiyo Finisher',
    'Üst Vücut Circuit': 'Üst Vücut Circuit',
    'Alt Vücut Circuit': 'Alt Vücut Circuit',
    'Full Body Circuit': 'Full Body Circuit',
    'Kardiyo + Core Circuit': 'Kardiyo + Core Circuit',
    'AMRAP Challenge': 'AMRAP Challenge',
    'Güç + Kardiyo — Üst': 'Güç + Kardiyo — Üst',
    'Güç + Kardiyo — Alt': 'Güç + Kardiyo — Alt',
    'Metabolik Devre + Core': 'Metabolik Devre + Core',
    'Full Body Hybrid': 'Full Body Hybrid',
    'Conditioning Testi': 'Conditioning Testi',
    // ── Shared / Common ──
    'Dinlenme': 'Dinlenme', 'Tam Dinlenme': 'Tam Dinlenme',
    'Dinlenme / Aktif Toparlanma': 'Dinlenme / Aktif Toparlanma',
    'Aktif Toparlanma': 'Aktif Toparlanma',
    'HIIT / Kardiyo': 'HIIT / Kardiyo',
    'Üst Vücut (Push)': 'Üst Vücut (Push)', 'Üst Vücut (Pull)': 'Üst Vücut (Pull)',
    'Alt Vücut + Kardiyo': 'Alt Vücut + Kardiyo',
    'Full Body': 'Full Body', 'Full Body + Core': 'Full Body + Core',
    // ── Meditation ──
    'Nefes Meditasyonu': 'Nefes Meditasyonu',
    'Vücut Tarama': 'Vücut Tarama',
    'Farkındalık': 'Farkındalık',
    'Mantra Meditasyon': 'Mantra Meditasyon',
    'Görselleştirme': 'Görselleştirme',
    'Metta (Sevgi-Şefkat)': 'Metta (Sevgi-Şefkat)',
    'Chakra Dengeleme': 'Chakra Dengeleme',
    'Nefes Teknikleri': 'Nefes Teknikleri',
    'Derinleşen Farkındalık': 'Derinleşen Farkındalık',
    'Ses & Titreşim': 'Ses & Titreşim',
    'Vipassana Insight': 'Vipassana Insight',
    'Zen Zazen': 'Zen Zazen',
    'İleri Pranayama': 'İleri Pranayama',
    'Yoga Nidra': 'Yoga Nidra',
    'Kozmik Meditasyon': 'Kozmik Meditasyon',
    'Derin Oturum': 'Derin Oturum',
    'Transandantal': 'Transandantal',
    'Bütünleşik Pratik': 'Bütünleşik Pratik',
    'Koan / Sorgulama': 'Koan / Sorgulama',
    'Mini Retreat': 'Mini Retreat',
    // ── Yoga ──
    'Güneşe Selam & Temel': 'Güneşe Selam & Temel',
    'Esneklik & Açıcılar': 'Esneklik & Açıcılar',
    'Güç Yogası': 'Güç Yogası',
    'Restoratif Yoga': 'Restoratif Yoga',
    'Vinyasa Akış': 'Vinyasa Akış',
    'Kol Dengeleri': 'Kol Dengeleri',
    'Derin Esneklik': 'Derin Esneklik',
    'İnversiyon Hazırlık': 'İnversiyon Hazırlık',
    'Power Vinyasa': 'Power Vinyasa',
    'Pranayama & Meditasyon': 'Pranayama & Meditasyon',
    'Headstand & Handstand': 'Headstand & Handstand',
    'Derin Backbend': 'Derin Backbend',
    'Arm Balance Master': 'Arm Balance Master',
    'Ashtanga Primary': 'Ashtanga Primary',
    'Yin & Restore': 'Yin & Restore',
    'Full Ashtanga': 'Full Ashtanga',
    'İleri İnversiyon': 'İleri İnversiyon',
    'Yaratıcı Akış': 'Yaratıcı Akış',
    'Restore & Reflect': 'Restore & Reflect',
    // ── Pilates ──
    'Core & Temel': 'Core & Temel',
    'Alt Vücut': 'Alt Vücut',
    'Üst Vücut & Sırt': 'Üst Vücut & Sırt',
    'Tam Vücut Akış': 'Tam Vücut Akış',
    'Esneklik & Toparlanma': 'Esneklik & Toparlanma',
    'İleri Core': 'İleri Core',
    'Lateral & Rotasyon': 'Lateral & Rotasyon',
    'Props ile Pilates': 'Props ile Pilates',
    'Tam Vücut Challenge': 'Tam Vücut Challenge',
    'Mobility & Stretch': 'Mobility & Stretch',
    'Klasik Mat Seri': 'Klasik Mat Seri',
    'Side Kick Serisi': 'Side Kick Serisi',
    'İleri Sırt & Extension': 'İleri Sırt & Extension',
    'Inversions & Challenge': 'Inversions & Challenge',
    'Restoratif': 'Restoratif',
    'Full Mat (45 dk)': 'Full Mat (45 dk)',
    'İleri Props': 'İleri Props',
    'Kontrol & Denge': 'Kontrol & Denge',
    'Koreografik Akış': 'Koreografik Akış',
    'Mindful Movement': 'Mindful Movement',
    // ── Reformer ──
    'Reformer Temeller': 'Reformer Temeller',
    'Kol & Omuz': 'Kol & Omuz',
    'Core & Tam Vücut': 'Core & Tam Vücut',
    'Esneklik': 'Esneklik',
    'İleri Footwork & Legs': 'İleri Footwork & Legs',
    'İleri Arms & Back': 'İleri Arms & Back',
    'Box Çalışmaları': 'Box Çalışmaları',
    'Tam Vücut Flow': 'Tam Vücut Flow',
    'Stretch & Restore': 'Stretch & Restore',
    'Jump Board Kardiyo': 'Jump Board Kardiyo',
    'İleri Kol & Sırt': 'İleri Kol & Sırt',
    'Tam Vücut Master': 'Tam Vücut Master',
    'Toparlanma': 'Toparlanma',
    'Master Reformer': 'Master Reformer',
    'Tower / Cadillac': 'Tower / Cadillac',
    'Jump Board İleri': 'Jump Board İleri',
    'Wunda Chair': 'Wunda Chair',
  },
  en: {
    // ── Muscle ──
    'Göğüs & Triceps': 'Chest & Triceps', 'Göğüs & Ön Omuz': 'Chest & Front Delt',
    'Sırt & Biceps': 'Back & Biceps', 'Sırt & Arka Omuz': 'Back & Rear Delt',
    'Omuz & Trapez': 'Shoulders & Traps', 'Omuz & Kol': 'Shoulders & Arms',
    'Bacak & Core': 'Legs & Core', 'Bacak & Kalça': 'Legs & Glutes',
    'Push — Göğüs & Omuz & Triceps': 'Push — Chest & Shoulders & Triceps',
    'Bacak — Quad Dominant': 'Legs — Quad Dominant',
    'Üst Vücut — Push & Pull Mix': 'Upper Body — Push & Pull Mix',
    'Bacak — Hamstring & Kalça': 'Legs — Hamstring & Glutes',
    'Göğüs & Triceps — Güç Odaklı': 'Chest & Triceps — Strength Focus',
    'Sırt & Biceps — Hacim Odaklı': 'Back & Biceps — Volume Focus',
    'Bacak — Güç & Patlayıcılık': 'Legs — Strength & Power',
    'Omuz & Kol — Hipertrofi': 'Shoulders & Arms — Hypertrophy',
    'Full Body — Zayıf Nokta Günü': 'Full Body — Weak Point Day',
    // ── Muscle (v10 — Upper/Lower & Push/Pull/Legs) ──
    'Üst Vücut A — Göğüs, Omuz & Triceps': 'Upper Body A — Chest, Shoulders & Triceps',
    'Alt Vücut A — Bacak & Kalça': 'Lower Body A — Legs & Glutes',
    'Üst Vücut B — Sırt, Omuz & Biceps': 'Upper Body B — Back, Shoulders & Biceps',
    'Alt Vücut B — Bacak & Core': 'Lower Body B — Legs & Core',
    'Push — Göğüs, Omuz & Triceps': 'Push — Chest, Shoulders & Triceps',
    'Pull — Sırt & Biceps': 'Pull — Back & Biceps',
    'Bacak — Quad & Hamstring': 'Legs — Quads & Hamstrings',
    'Üst Vücut — Göğüs, Sırt & Omuz': 'Upper Body — Chest, Back & Shoulders',
    'Alt Vücut — Bacak & Kalça': 'Lower Body — Legs & Glutes',
    'Push A — Göğüs & Triceps': 'Push A — Chest & Triceps',
    'Pull A — Sırt Genişlik & Biceps': 'Pull A — Back Width & Biceps',
    'Bacak A — Quad Ağırlıklı': 'Legs A — Quad Focus',
    'Push B — Omuz & Triceps': 'Push B — Shoulders & Triceps',
    'Pull B — Sırt Kalınlık & Arka Omuz': 'Pull B — Back Thickness & Rear Delts',
    'Bacak B — Hamstring & Kalça': 'Legs B — Hamstrings & Glutes',
    'Push A — Göğüs & Triceps (Güç)': 'Push A — Chest & Triceps (Strength)',
    'Pull A — Sırt & Biceps (Güç)': 'Pull A — Back & Biceps (Strength)',
    'Bacak A — Güç & Quad': 'Legs A — Strength & Quads',
    'Push B — Omuz & Triceps (Hipertrofi)': 'Push B — Shoulders & Triceps (Hypertrophy)',
    'Pull B — Sırt Detay & Arka Omuz (Hipertrofi)': 'Pull B — Back Detail & Rear Delts (Hypertrophy)',
    'Bacak B — Hamstring & Kalça (Hipertrofi)': 'Legs B — Hamstrings & Glutes (Hypertrophy)',
    // ── Fat Loss ──
    'Full Body HIIT': 'Full Body HIIT',
    'Üst Vücut + Kardiyo': 'Upper Body + Cardio',
    'Alt Vücut Güç': 'Lower Body Strength',
    'Metabolik Conditioning': 'Metabolic Conditioning',
    'Üst Vücut HIIT + Güç': 'Upper Body HIIT + Strength',
    'Alt Vücut HIIT + Güç': 'Lower Body HIIT + Strength',
    'Full Body Metabolik': 'Full Body Metabolic',
    'Push-Pull Kardiyo': 'Push-Pull Cardio',
    'HIIT Kardiyo Finisher': 'HIIT Cardio Finisher',
    'Üst Vücut Circuit': 'Upper Body Circuit',
    'Alt Vücut Circuit': 'Lower Body Circuit',
    'Full Body Circuit': 'Full Body Circuit',
    'Kardiyo + Core Circuit': 'Cardio + Core Circuit',
    'AMRAP Challenge': 'AMRAP Challenge',
    'Güç + Kardiyo — Üst': 'Strength + Cardio — Upper',
    'Güç + Kardiyo — Alt': 'Strength + Cardio — Lower',
    'Metabolik Devre + Core': 'Metabolic Circuit + Core',
    'Full Body Hybrid': 'Full Body Hybrid',
    'Conditioning Testi': 'Conditioning Test',
    // ── Shared / Common ──
    'Dinlenme': 'Rest', 'Tam Dinlenme': 'Full Rest',
    'Dinlenme / Aktif Toparlanma': 'Rest / Active Recovery',
    'Aktif Toparlanma': 'Active Recovery',
    'HIIT / Kardiyo': 'HIIT / Cardio',
    'Üst Vücut (Push)': 'Upper Body (Push)', 'Üst Vücut (Pull)': 'Upper Body (Pull)',
    'Alt Vücut + Kardiyo': 'Lower Body + Cardio',
    'Full Body': 'Full Body', 'Full Body + Core': 'Full Body + Core',
    // ── Meditation ──
    'Nefes Meditasyonu': 'Breath Meditation',
    'Vücut Tarama': 'Body Scan',
    'Farkındalık': 'Mindfulness',
    'Mantra Meditasyon': 'Mantra Meditation',
    'Görselleştirme': 'Visualization',
    'Metta (Sevgi-Şefkat)': 'Metta (Loving-Kindness)',
    'Chakra Dengeleme': 'Chakra Balancing',
    'Nefes Teknikleri': 'Breathing Techniques',
    'Derinleşen Farkındalık': 'Deepening Awareness',
    'Ses & Titreşim': 'Sound & Vibration',
    'Vipassana Insight': 'Vipassana Insight',
    'Zen Zazen': 'Zen Zazen',
    'İleri Pranayama': 'Advanced Pranayama',
    'Yoga Nidra': 'Yoga Nidra',
    'Kozmik Meditasyon': 'Cosmic Meditation',
    'Derin Oturum': 'Deep Session',
    'Transandantal': 'Transcendental',
    'Bütünleşik Pratik': 'Integrated Practice',
    'Koan / Sorgulama': 'Koan / Inquiry',
    'Mini Retreat': 'Mini Retreat',
    // ── Yoga ──
    'Güneşe Selam & Temel': 'Sun Salutation & Basics',
    'Esneklik & Açıcılar': 'Flexibility & Openers',
    'Güç Yogası': 'Power Yoga',
    'Restoratif Yoga': 'Restorative Yoga',
    'Vinyasa Akış': 'Vinyasa Flow',
    'Kol Dengeleri': 'Arm Balances',
    'Derin Esneklik': 'Deep Flexibility',
    'İnversiyon Hazırlık': 'Inversion Prep',
    'Power Vinyasa': 'Power Vinyasa',
    'Pranayama & Meditasyon': 'Pranayama & Meditation',
    'Headstand & Handstand': 'Headstand & Handstand',
    'Derin Backbend': 'Deep Backbend',
    'Arm Balance Master': 'Arm Balance Master',
    'Ashtanga Primary': 'Ashtanga Primary',
    'Yin & Restore': 'Yin & Restore',
    'Full Ashtanga': 'Full Ashtanga',
    'İleri İnversiyon': 'Advanced Inversions',
    'Yaratıcı Akış': 'Creative Flow',
    'Restore & Reflect': 'Restore & Reflect',
    // ── Pilates ──
    'Core & Temel': 'Core & Basics',
    'Alt Vücut': 'Lower Body',
    'Üst Vücut & Sırt': 'Upper Body & Back',
    'Tam Vücut Akış': 'Full Body Flow',
    'Esneklik & Toparlanma': 'Flexibility & Recovery',
    'İleri Core': 'Advanced Core',
    'Lateral & Rotasyon': 'Lateral & Rotation',
    'Props ile Pilates': 'Pilates with Props',
    'Tam Vücut Challenge': 'Full Body Challenge',
    'Mobility & Stretch': 'Mobility & Stretch',
    'Klasik Mat Seri': 'Classic Mat Series',
    'Side Kick Serisi': 'Side Kick Series',
    'İleri Sırt & Extension': 'Advanced Back & Extension',
    'Inversions & Challenge': 'Inversions & Challenge',
    'Restoratif': 'Restorative',
    'Full Mat (45 dk)': 'Full Mat (45 min)',
    'İleri Props': 'Advanced Props',
    'Kontrol & Denge': 'Control & Balance',
    'Koreografik Akış': 'Choreographic Flow',
    'Mindful Movement': 'Mindful Movement',
    // ── Reformer ──
    'Reformer Temeller': 'Reformer Basics',
    'Kol & Omuz': 'Arms & Shoulders',
    'Core & Tam Vücut': 'Core & Full Body',
    'Esneklik': 'Flexibility',
    'İleri Footwork & Legs': 'Advanced Footwork & Legs',
    'İleri Arms & Back': 'Advanced Arms & Back',
    'Box Çalışmaları': 'Box Work',
    'Tam Vücut Flow': 'Full Body Flow',
    'Stretch & Restore': 'Stretch & Restore',
    'Jump Board Kardiyo': 'Jump Board Cardio',
    'İleri Kol & Sırt': 'Advanced Arms & Back',
    'Tam Vücut Master': 'Full Body Master',
    'Toparlanma': 'Recovery',
    'Master Reformer': 'Master Reformer',
    'Tower / Cadillac': 'Tower / Cadillac',
    'Jump Board İleri': 'Advanced Jump Board',
    'Wunda Chair': 'Wunda Chair',
  },
  es: {
    // ── Muscle ──
    'Göğüs & Triceps': 'Pecho & Tríceps', 'Göğüs & Ön Omuz': 'Pecho & Hombro Ant.',
    'Sırt & Biceps': 'Espalda & Bíceps', 'Sırt & Arka Omuz': 'Espalda & Hombro Post.',
    'Omuz & Trapez': 'Hombros & Trapecios', 'Omuz & Kol': 'Hombros & Brazos',
    'Bacak & Core': 'Piernas & Core', 'Bacak & Kalça': 'Piernas & Glúteos',
    'Push — Göğüs & Omuz & Triceps': 'Push — Pecho & Hombros & Tríceps',
    'Bacak — Quad Dominant': 'Piernas — Cuádriceps Dominante',
    'Üst Vücut — Push & Pull Mix': 'Tren Superior — Push & Pull Mix',
    'Bacak — Hamstring & Kalça': 'Piernas — Isquiotibiales & Glúteos',
    'Göğüs & Triceps — Güç Odaklı': 'Pecho & Tríceps — Enfoque Fuerza',
    'Sırt & Biceps — Hacim Odaklı': 'Espalda & Bíceps — Enfoque Volumen',
    'Bacak — Güç & Patlayıcılık': 'Piernas — Fuerza & Potencia',
    'Omuz & Kol — Hipertrofi': 'Hombros & Brazos — Hipertrofia',
    'Full Body — Zayıf Nokta Günü': 'Cuerpo Completo — Día de Puntos Débiles',
    // ── Muscle (v10 — Upper/Lower & Push/Pull/Legs) ──
    'Üst Vücut A — Göğüs, Omuz & Triceps': 'Tren Superior A — Pecho, Hombros & Tríceps',
    'Alt Vücut A — Bacak & Kalça': 'Tren Inferior A — Piernas & Glúteos',
    'Üst Vücut B — Sırt, Omuz & Biceps': 'Tren Superior B — Espalda, Hombros & Bíceps',
    'Alt Vücut B — Bacak & Core': 'Tren Inferior B — Piernas & Core',
    'Push — Göğüs, Omuz & Triceps': 'Push — Pecho, Hombros & Tríceps',
    'Pull — Sırt & Biceps': 'Pull — Espalda & Bíceps',
    'Bacak — Quad & Hamstring': 'Piernas — Cuádriceps & Isquiotibiales',
    'Üst Vücut — Göğüs, Sırt & Omuz': 'Tren Superior — Pecho, Espalda & Hombros',
    'Alt Vücut — Bacak & Kalça': 'Tren Inferior — Piernas & Glúteos',
    'Push A — Göğüs & Triceps': 'Push A — Pecho & Tríceps',
    'Pull A — Sırt Genişlik & Biceps': 'Pull A — Amplitud de Espalda & Bíceps',
    'Bacak A — Quad Ağırlıklı': 'Piernas A — Enfoque Cuádriceps',
    'Push B — Omuz & Triceps': 'Push B — Hombros & Tríceps',
    'Pull B — Sırt Kalınlık & Arka Omuz': 'Pull B — Grosor de Espalda & Deltoides Post.',
    'Bacak B — Hamstring & Kalça': 'Piernas B — Isquiotibiales & Glúteos',
    'Push A — Göğüs & Triceps (Güç)': 'Push A — Pecho & Tríceps (Fuerza)',
    'Pull A — Sırt & Biceps (Güç)': 'Pull A — Espalda & Bíceps (Fuerza)',
    'Bacak A — Güç & Quad': 'Piernas A — Fuerza & Cuádriceps',
    'Push B — Omuz & Triceps (Hipertrofi)': 'Push B — Hombros & Tríceps (Hipertrofia)',
    'Pull B — Sırt Detay & Arka Omuz (Hipertrofi)': 'Pull B — Detalle de Espalda & Deltoides Post. (Hipertrofia)',
    'Bacak B — Hamstring & Kalça (Hipertrofi)': 'Piernas B — Isquiotibiales & Glúteos (Hipertrofia)',
    // ── Fat Loss ──
    'Full Body HIIT': 'HIIT Cuerpo Completo',
    'Üst Vücut + Kardiyo': 'Tren Superior + Cardio',
    'Alt Vücut Güç': 'Fuerza Tren Inferior',
    'Metabolik Conditioning': 'Acondicionamiento Metabólico',
    'Üst Vücut HIIT + Güç': 'Tren Superior HIIT + Fuerza',
    'Alt Vücut HIIT + Güç': 'Tren Inferior HIIT + Fuerza',
    'Full Body Metabolik': 'Metabólico Cuerpo Completo',
    'Push-Pull Kardiyo': 'Push-Pull Cardio',
    'HIIT Kardiyo Finisher': 'HIIT Cardio Finalizador',
    'Üst Vücut Circuit': 'Circuito Tren Superior',
    'Alt Vücut Circuit': 'Circuito Tren Inferior',
    'Full Body Circuit': 'Circuito Cuerpo Completo',
    'Kardiyo + Core Circuit': 'Cardio + Circuito Core',
    'AMRAP Challenge': 'Desafío AMRAP',
    'Güç + Kardiyo — Üst': 'Fuerza + Cardio — Superior',
    'Güç + Kardiyo — Alt': 'Fuerza + Cardio — Inferior',
    'Metabolik Devre + Core': 'Circuito Metabólico + Core',
    'Full Body Hybrid': 'Híbrido Cuerpo Completo',
    'Conditioning Testi': 'Test de Acondicionamiento',
    // ── Shared / Common ──
    'Dinlenme': 'Descanso', 'Tam Dinlenme': 'Descanso Total',
    'Dinlenme / Aktif Toparlanma': 'Descanso / Recuperación Activa',
    'Aktif Toparlanma': 'Recuperación Activa',
    'HIIT / Kardiyo': 'HIIT / Cardio',
    'Üst Vücut (Push)': 'Tren Superior (Push)', 'Üst Vücut (Pull)': 'Tren Superior (Pull)',
    'Alt Vücut + Kardiyo': 'Tren Inferior + Cardio',
    'Full Body': 'Cuerpo Completo', 'Full Body + Core': 'Cuerpo Completo + Core',
    // ── Meditation ──
    'Nefes Meditasyonu': 'Meditación de Respiración',
    'Vücut Tarama': 'Escaneo Corporal',
    'Farkındalık': 'Conciencia Plena',
    'Mantra Meditasyon': 'Meditación Mantra',
    'Görselleştirme': 'Visualización',
    'Metta (Sevgi-Şefkat)': 'Metta (Amor-Compasión)',
    'Chakra Dengeleme': 'Equilibrio de Chakras',
    'Nefes Teknikleri': 'Técnicas de Respiración',
    'Derinleşen Farkındalık': 'Conciencia Profunda',
    'Ses & Titreşim': 'Sonido & Vibración',
    'Vipassana Insight': 'Vipassana Insight',
    'Zen Zazen': 'Zen Zazen',
    'İleri Pranayama': 'Pranayama Avanzado',
    'Yoga Nidra': 'Yoga Nidra',
    'Kozmik Meditasyon': 'Meditación Cósmica',
    'Derin Oturum': 'Sesión Profunda',
    'Transandantal': 'Trascendental',
    'Bütünleşik Pratik': 'Práctica Integrada',
    'Koan / Sorgulama': 'Koan / Indagación',
    'Mini Retreat': 'Mini Retiro',
    // ── Yoga ──
    'Güneşe Selam & Temel': 'Saludo al Sol & Básicos',
    'Esneklik & Açıcılar': 'Flexibilidad & Aperturas',
    'Güç Yogası': 'Yoga de Fuerza',
    'Restoratif Yoga': 'Yoga Restaurativo',
    'Vinyasa Akış': 'Flujo Vinyasa',
    'Kol Dengeleri': 'Equilibrios de Brazos',
    'Derin Esneklik': 'Flexibilidad Profunda',
    'İnversiyon Hazırlık': 'Preparación de Inversiones',
    'Power Vinyasa': 'Power Vinyasa',
    'Pranayama & Meditasyon': 'Pranayama & Meditación',
    'Headstand & Handstand': 'Headstand & Handstand',
    'Derin Backbend': 'Extensión Profunda',
    'Arm Balance Master': 'Maestría en Equilibrios',
    'Ashtanga Primary': 'Ashtanga Primaria',
    'Yin & Restore': 'Yin & Restauración',
    'Full Ashtanga': 'Ashtanga Completo',
    'İleri İnversiyon': 'Inversiones Avanzadas',
    'Yaratıcı Akış': 'Flujo Creativo',
    'Restore & Reflect': 'Restaurar & Reflexionar',
    // ── Pilates ──
    'Core & Temel': 'Core & Básicos',
    'Alt Vücut': 'Tren Inferior',
    'Üst Vücut & Sırt': 'Tren Superior & Espalda',
    'Tam Vücut Akış': 'Flujo Cuerpo Completo',
    'Esneklik & Toparlanma': 'Flexibilidad & Recuperación',
    'İleri Core': 'Core Avanzado',
    'Lateral & Rotasyon': 'Lateral & Rotación',
    'Props ile Pilates': 'Pilates con Accesorios',
    'Tam Vücut Challenge': 'Desafío Cuerpo Completo',
    'Mobility & Stretch': 'Movilidad & Estiramiento',
    'Klasik Mat Seri': 'Serie Mat Clásica',
    'Side Kick Serisi': 'Serie de Patada Lateral',
    'İleri Sırt & Extension': 'Espalda & Extensión Avanzada',
    'Inversions & Challenge': 'Inversiones & Desafío',
    'Restoratif': 'Restaurativo',
    'Full Mat (45 dk)': 'Mat Completo (45 min)',
    'İleri Props': 'Accesorios Avanzados',
    'Kontrol & Denge': 'Control & Equilibrio',
    'Koreografik Akış': 'Flujo Coreográfico',
    'Mindful Movement': 'Movimiento Consciente',
    // ── Reformer ──
    'Reformer Temeller': 'Fundamentos de Reformer',
    'Kol & Omuz': 'Brazos & Hombros',
    'Core & Tam Vücut': 'Core & Cuerpo Completo',
    'Esneklik': 'Flexibilidad',
    'İleri Footwork & Legs': 'Footwork & Piernas Avanzado',
    'İleri Arms & Back': 'Brazos & Espalda Avanzado',
    'Box Çalışmaları': 'Trabajo de Caja',
    'Tam Vücut Flow': 'Flujo Cuerpo Completo',
    'Stretch & Restore': 'Estiramiento & Restauración',
    'Jump Board Kardiyo': 'Cardio con Jump Board',
    'İleri Kol & Sırt': 'Brazos & Espalda Avanzado',
    'Tam Vücut Master': 'Maestro Cuerpo Completo',
    'Toparlanma': 'Recuperación',
    'Master Reformer': 'Reformer Maestro',
    'Tower / Cadillac': 'Torre / Cadillac',
    'Jump Board İleri': 'Jump Board Avanzado',
    'Wunda Chair': 'Silla Wunda',
  },
};

const restExerciseMap = {
  tr: 'Tam Dinlenme',
  en: 'Full Rest',
  es: 'Descanso Total',
};

// ── Egzersiz içi Türkçe parçaların lokalizasyonu (TR dışı diller) ──
const supersetPrefixMap = { en: 'Superset:', es: 'Superserie:' };

const deloadNoteMap = {
  en: {
    '⚠️ Deload Notu: Her 4. haftada ağırlıkları %60\'a düşür, seti %50 azalt': '⚠️ Deload Note: Every 4th week — drop weights to 60% and cut sets by 50%',
    '⚠️ Deload Notu: 4. haftada ağırlıkları %60\'a düşür': '⚠️ Deload Note: Week 4 — drop weights to 60%',
    '⚠️ Deload Notu: 4. haftada toplam seti %50 azalt': '⚠️ Deload Note: Week 4 — cut total sets by 50%',
    '⚠️ Deload Notu: 4. haftada squat ağırlığı max %65': '⚠️ Deload Note: Week 4 — squat weight max 65%',
    '⚠️ Deload Notu: 4. haftada toplam hacmi %50 azalt': '⚠️ Deload Note: Week 4 — cut total volume by 50%',
  },
  es: {
    '⚠️ Deload Notu: Her 4. haftada ağırlıkları %60\'a düşür, seti %50 azalt': '⚠️ Nota de Descarga: Cada 4ª semana — baja los pesos al 60% y reduce las series 50%',
    '⚠️ Deload Notu: 4. haftada ağırlıkları %60\'a düşür': '⚠️ Nota de Descarga: Semana 4 — baja los pesos al 60%',
    '⚠️ Deload Notu: 4. haftada toplam seti %50 azalt': '⚠️ Nota de Descarga: Semana 4 — reduce el total de series 50%',
    '⚠️ Deload Notu: 4. haftada squat ağırlığı max %65': '⚠️ Nota de Descarga: Semana 4 — peso de sentadilla máx 65%',
    '⚠️ Deload Notu: 4. haftada toplam hacmi %50 azalt': '⚠️ Nota de Descarga: Semana 4 — reduce el volumen total 50%',
  },
};

// Tekrar (reps) alanındaki Türkçe kısaltmalar: 10/bacak, 3/taraf, 8/kol, 30 dk
const repsTokenMap = {
  en: [[/bacak/g, 'leg'], [/taraf/g, 'side'], [/\bkol\b/g, 'arm'], [/\bdk\b/g, 'min'], [/\bsn\b/g, 's'], [/hızlı/g, 'fast'], [/rahat/g, 'easy'], [/\/tip\b/g, '/letter']],
  es: [[/bacak/g, 'pierna'], [/taraf/g, 'lado'], [/\bkol\b/g, 'brazo'], [/\bdk\b/g, 'min'], [/\bsn\b/g, 's'], [/hızlı/g, 'rápido'], [/rahat/g, 'suave'], [/\/tip\b/g, '/letra']],
};

// ── Home program localization ──────────────────────────
// Home (no-equipment / basic-equipment) programs are authored in Turkish in
// homeWorkoutPrograms.js. These maps translate their exercise names and day
// focus labels so English and Spanish members never see Turkish text.
const homeExerciseNameMap = {
  en: {
    'Kontrollü Vücut Ağırlığı Squat': 'Controlled Bodyweight Squat',
    'Eğimli Şınav': 'Incline Push-Up',
    'Yüzüstü Lat Çekiş': 'Prone Lat Pulldown',
    'Destekli Geri Lunge': 'Supported Reverse Lunge',
    'Diz Üstü veya Standart Şınav': 'Knee or Standard Push-Up',
    'Tek Bacak Glute Bridge': 'Single-Leg Glute Bridge',
    'Pike Şınav': 'Pike Push-Up',
    'Tek Bacak Calf Raise': 'Single-Leg Calf Raise',
    'Standart Şınav': 'Standard Push-Up',
    'Dar Tutuş Diz Üstü Şınav': 'Close-Grip Knee Push-Up',
    'Tempo Şınav (3 sn iniş)': 'Tempo Push-Up (3 s lowering)',
    'Ayakları Yükseltilmiş Pike Şınav': 'Feet-Elevated Pike Push-Up',
    'Yüzüstü W İzometrik': 'Prone W Isometric Hold',
    'Tempo Squat (3 sn iniş)': 'Tempo Squat (3 s lowering)',
    'Geri Lunge': 'Reverse Lunge',
    'Destekli Tek Bacak Squat': 'Supported Single-Leg Squat',
    'Tek Bacak Hip Hinge': 'Single-Leg Hip Hinge',
    'Tek Kol Dumbbell Row': 'Single-Arm Dumbbell Row',
    'Şınav': 'Push-Up',
    'Dar Tutuş Dumbbell Floor Press': 'Close-Grip Dumbbell Floor Press',
    'Düşük Etkili Interval Yürüyüş': 'Low-Impact Interval Walk',
    'Tempolu Yürüyüş': 'Brisk Walk',
    'Tüm Vücut Mobilite Akışı': 'Full-Body Mobility Flow',
    '20-30 dk rahat yürüyüş (opsiyonel)': '20-30 min easy walk (optional)',
  },
  es: {
    'Kontrollü Vücut Ağırlığı Squat': 'Sentadilla Controlada con Peso Corporal',
    'Eğimli Şınav': 'Flexión Inclinada',
    'Yüzüstü Lat Çekiş': 'Jalón Dorsal Boca Abajo',
    'Glute Bridge': 'Puente de Glúteo',
    'Destekli Geri Lunge': 'Zancada Atrás con Apoyo',
    'Diz Üstü veya Standart Şınav': 'Flexión de Rodillas o Estándar',
    'Tek Bacak Glute Bridge': 'Puente de Glúteo a Una Pierna',
    'Pike Şınav': 'Flexión Pike',
    'Tek Bacak Calf Raise': 'Elevación de Talón a Una Pierna',
    'Side Plank': 'Plancha Lateral',
    'Standart Şınav': 'Flexión Estándar',
    'Dar Tutuş Diz Üstü Şınav': 'Flexión de Rodillas Agarre Cerrado',
    'Tempo Şınav (3 sn iniş)': 'Flexión con Tempo (3 s bajada)',
    'Ayakları Yükseltilmiş Pike Şınav': 'Flexión Pike con Pies Elevados',
    'Yüzüstü W İzometrik': 'W Isométrica Boca Abajo',
    'Tempo Squat (3 sn iniş)': 'Sentadilla con Tempo (3 s bajada)',
    'Geri Lunge': 'Zancada Atrás',
    'Destekli Tek Bacak Squat': 'Sentadilla a Una Pierna con Apoyo',
    'Tek Bacak Hip Hinge': 'Bisagra de Cadera a Una Pierna',
    'Glute Bridge March': 'Marcha en Puente de Glúteo',
    'Bent-Knee Calf Raise': 'Elevación de Talón con Rodilla Flexionada',
    'Goblet Squat': 'Sentadilla Goblet',
    'Dumbbell Floor Press': 'Press en el Suelo con Mancuernas',
    'Tek Kol Dumbbell Row': 'Remo con Mancuerna a Un Brazo',
    'Dumbbell Romanian Deadlift': 'Peso Muerto Rumano con Mancuernas',
    'Dumbbell Reverse Lunge': 'Zancada Atrás con Mancuernas',
    'Şınav': 'Flexión',
    'Resistance Band Row': 'Remo con Banda',
    'Dumbbell Glute Bridge': 'Puente de Glúteo con Mancuerna',
    'Dumbbell Split Squat': 'Sentadilla Búlgara con Mancuernas',
    'Dumbbell Shoulder Press': 'Press de Hombro con Mancuernas',
    'Resistance Band Pull-Apart': 'Apertura con Banda',
    'Suitcase March': 'Marcha Maleta',
    'Dumbbell Curl': 'Curl con Mancuernas',
    'Dar Tutuş Dumbbell Floor Press': 'Press en el Suelo Agarre Cerrado',
    'Dumbbell Lateral Raise': 'Elevación Lateral con Mancuernas',
    'Dumbbell Reverse Fly': 'Pájaro con Mancuernas',
    'Hammer Curl': 'Curl Martillo',
    'Dumbbell Overhead Triceps Extension': 'Extensión de Tríceps sobre la Cabeza',
    'Standing Calf Raise': 'Elevación de Talones de Pie',
    'Dumbbell Step-Up': 'Subida al Cajón con Mancuernas',
    'Resistance Band Hamstring Curl': 'Curl Femoral con Banda',
    'Düşük Etkili Interval Yürüyüş': 'Caminata por Intervalos de Bajo Impacto',
    'Tempolu Yürüyüş': 'Caminata Rápida',
    'Tüm Vücut Mobilite Akışı': 'Flujo de Movilidad de Cuerpo Completo',
    '20-30 dk rahat yürüyüş (opsiyonel)': '20-30 min de caminata suave (opcional)',
  },
};

const homeFocusMap = {
  en: {
    'Dinlenme / Rahat Yürüyüş': 'Rest / Easy Walk',
    'Tam Vücut A — Temel Kuvvet': 'Full Body A — Foundation Strength',
    'Tam Vücut B — Tek Taraflı Kontrol': 'Full Body B — Unilateral Control',
    'Tam Vücut C — Tempo ve Denge': 'Full Body C — Tempo and Balance',
    'Üst Vücut A — İtiş ve Sırt Kontrolü': 'Upper Body A — Push and Back Control',
    'Üst Vücut B — Tempo ve Postür': 'Upper Body B — Tempo and Posture',
    'Alt Vücut A — Squat ve Kalça': 'Lower Body A — Squat and Hips',
    'Alt Vücut B — Tek Taraflı Kuvvet': 'Lower Body B — Unilateral Strength',
    'Tam Vücut A — Dumbbell Temeli': 'Full Body A — Dumbbell Foundation',
    'Tam Vücut B — Denge ve Çekiş': 'Full Body B — Balance and Pull',
    'Tam Vücut C — Omuz ve Kalça': 'Full Body C — Shoulders and Hips',
    'Üst Vücut A — Yatay İtiş ve Çekiş': 'Upper Body A — Horizontal Push and Pull',
    'Üst Vücut B — Omuz ve Sırt': 'Upper Body B — Shoulders and Back',
    'Alt Vücut A — Squat Odaklı': 'Lower Body A — Squat Focus',
    'Alt Vücut B — Tek Taraflı ve Kalça': 'Lower Body B — Unilateral and Hips',
    'Tempolu Yürüyüş + Mobilite': 'Brisk Walk + Mobility',
    'Düşük Etkili Interval Yürüyüş': 'Low-Impact Interval Walk',
  },
  es: {
    'Dinlenme / Rahat Yürüyüş': 'Descanso / Caminata Suave',
    'Tam Vücut A — Temel Kuvvet': 'Cuerpo Completo A — Fuerza Base',
    'Tam Vücut B — Tek Taraflı Kontrol': 'Cuerpo Completo B — Control Unilateral',
    'Tam Vücut C — Tempo ve Denge': 'Cuerpo Completo C — Tempo y Equilibrio',
    'Üst Vücut A — İtiş ve Sırt Kontrolü': 'Tren Superior A — Empuje y Control de Espalda',
    'Üst Vücut B — Tempo ve Postür': 'Tren Superior B — Tempo y Postura',
    'Alt Vücut A — Squat ve Kalça': 'Tren Inferior A — Sentadilla y Cadera',
    'Alt Vücut B — Tek Taraflı Kuvvet': 'Tren Inferior B — Fuerza Unilateral',
    'Tam Vücut A — Dumbbell Temeli': 'Cuerpo Completo A — Base con Mancuernas',
    'Tam Vücut B — Denge ve Çekiş': 'Cuerpo Completo B — Equilibrio y Tracción',
    'Tam Vücut C — Omuz ve Kalça': 'Cuerpo Completo C — Hombros y Cadera',
    'Üst Vücut A — Yatay İtiş ve Çekiş': 'Tren Superior A — Empuje y Tracción Horizontal',
    'Üst Vücut B — Omuz ve Sırt': 'Tren Superior B — Hombros y Espalda',
    'Alt Vücut A — Squat Odaklı': 'Tren Inferior A — Enfoque en Sentadilla',
    'Alt Vücut B — Tek Taraflı ve Kalça': 'Tren Inferior B — Unilateral y Cadera',
    'Tempolu Yürüyüş + Mobilite': 'Caminata Rápida + Movilidad',
    'Düşük Etkili Interval Yürüyüş': 'Caminata por Intervalos de Bajo Impacto',
  },
};

const homeFocusSuffixMap = {
  en: { ' + Kas Koruma': ' + Muscle Retention' },
  es: { ' + Kas Koruma': ' + Mantener Músculo' },
};

function localizeHomeFocus(focus, lang) {
  if (typeof focus !== 'string' || lang === 'tr') return focus;
  const direct = homeFocusMap[lang]?.[focus];
  if (direct) return direct;
  for (const [suffix, translated] of Object.entries(homeFocusSuffixMap[lang] || {})) {
    if (focus.endsWith(suffix)) {
      const base = focus.slice(0, -suffix.length);
      const localizedBase = homeFocusMap[lang]?.[base];
      if (localizedBase) return `${localizedBase}${translated}`;
    }
  }
  return focus;
}

function localizeExerciseEntry(ex, lang) {
  if (!ex || lang === 'tr') return ex;
  let name = ex.name;
  let reps = ex.reps;
  if (typeof name === 'string') {
    const dl = deloadNoteMap[lang]?.[name];
    const home = homeExerciseNameMap[lang]?.[name];
    if (dl) {
      name = dl;
    } else if (home) {
      name = home;
    } else if (name.startsWith('Süperset:')) {
      name = name.replace('Süperset:', supersetPrefixMap[lang] || 'Superset:');
    }
  }
  if (typeof reps === 'string' && repsTokenMap[lang]) {
    for (const [re, tgt] of repsTokenMap[lang]) reps = reps.replace(re, tgt);
  }
  return { ...ex, name, reps };
}

export function localizePlan(plan, lang) {
  if (!plan || lang === 'tr') return plan; // workoutPhases are already in Turkish
  const dMap = dayNameMap[lang] || dayNameMap.en;
  const fMap = focusMap[lang] || focusMap.en;
  const restName = restExerciseMap[lang] || restExerciseMap.en;

  const localizeDay = (day) => ({
    ...day,
    day: dMap[day.day] || day.day,
    focus: fMap[day.focus] || localizeHomeFocus(day.focus, lang),
    exercises: day.exercises?.map(ex => {
      const loc = localizeExerciseEntry(ex, lang);
      return { ...loc, name: loc.name === 'Tam Dinlenme' ? restName : loc.name };
    }),
    coreFinisher: day.coreFinisher?.map(ex => localizeExerciseEntry(ex, lang)),
  });

  return {
    ...plan,
    workoutSplit: plan.workoutSplit?.map(localizeDay),
    dailyNutrition: plan.dailyNutrition?.map(dn => ({
      ...dn,
      day: dMap[dn.day] || dn.day,
      focus: fMap[dn.focus] || dn.focus,
    })),
  };
}

// ── Mevcut planı farklı fazla yeniden oluştur ────────────
export function regeneratePlanWithPhase(existingPlan, phase) {
  const goalMap = {
    // Turkish
    'Kas Gelişimi': 'muscle', 'Yağ Yakımı': 'fat_loss', 'Meditasyon': 'meditation',
    // English
    'Muscle Growth': 'muscle', 'Fat Loss': 'fat_loss', 'Meditation': 'meditation',
    // Spanish
    'Crecimiento Muscular': 'muscle', 'Quema de Grasa': 'fat_loss', 'Meditación': 'meditation',
    // Shared
    'Yoga': 'yoga', 'Pilates': 'pilates', 'Reformer': 'reformer',
  };
  const planLang = existingPlan.lang || 'tr';
  const userMetrics = {
    name: existingPlan.userName,
    age: existingPlan.userAge,
    gender: existingPlan.userGender,
    height: existingPlan.userHeight,
    weight: existingPlan.userWeight,
    bodyFatPercentage: existingPlan.userBodyFat,
    experience: existingPlan.userExperience,
    activityLevel: existingPlan.userActivityLevel || 'moderate',
    primaryGoal: goalMap[existingPlan.goal] || 'muscle',
    budget: existingPlan.userBudget,
    workSchedule: existingPlan.userWorkSchedule || [],
    trainingEnvironment: existingPlan.trainingEnvironment,
    healthConditions: existingPlan.healthConditions || [],
    allergies: existingPlan.allergies || [],
    focusAreas: existingPlan.focusAreas || [],
    trainingDaysPerWeek: existingPlan.trainingDaysPerWeek || null,
  };
  return generatePlan(userMetrics, phase, planLang);
}
