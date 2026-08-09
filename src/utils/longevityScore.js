const DAY_MS = 86_400_000;

const PILLAR_WEIGHTS = {
  movement: 25,
  strength: 20,
  mobility: 15,
  recovery: 25,
  nutrition: 15,
};

const STRENGTH_PATTERN = /press|row|squat|deadlift|curl|raise|extension|pulldown|pull.?up|push.?up|dip|lunge|hip thrust|bench|fly|strength|kuvvet|güç|ağırlık/i;
const MOBILITY_PATTERN = /yoga|pilates|reformer|mobility|mobilite|stretch|esneme|flexibility|denge|balance/i;
const MINDFUL_PATTERN = /meditat|nefes|breath|mindful/i;

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function dateValue(entry) {
  const raw = entry?.date || entry?.createdAt || entry?.created_at;
  const parsed = raw ? new Date(`${String(raw).slice(0, 10)}T12:00:00`).getTime() : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function recentEntries(entries = [], days = 28, now = new Date()) {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const cutoff = end.getTime() - (days - 1) * DAY_MS;
  return entries.filter((entry) => {
    const value = dateValue(entry);
    return value != null && value >= cutoff && value <= end.getTime();
  });
}

function uniqueDays(entries) {
  return new Set(entries.map((entry) => String(entry.date || entry.createdAt || entry.created_at || '').slice(0, 10)).filter(Boolean)).size;
}

function sessionText(log) {
  const exercises = Array.isArray(log?.exercises)
    ? log.exercises.map((exercise) => typeof exercise === 'string' ? exercise : [exercise?.name, exercise?.category, exercise?.muscle].filter(Boolean).join(' '))
    : [];
  return [log?.day_focus, log?.focus, log?.notes, ...exercises].filter(Boolean).join(' ');
}

function normalizeGoal(plan = {}) {
  const value = String(plan.primaryGoal || plan.goal || '').toLocaleLowerCase('tr-TR');
  if (/muscle|kas/.test(value)) return 'muscle';
  if (/fat|yağ/.test(value)) return 'fat_loss';
  if (/meditat/.test(value)) return 'meditation';
  if (/reformer/.test(value)) return 'reformer';
  if (/pilates/.test(value)) return 'pilates';
  if (/yoga/.test(value)) return 'yoga';
  return 'general';
}

function localDateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function classifySession(log, goal) {
  const text = sessionText(log);
  const mobility = MOBILITY_PATTERN.test(text) || ['yoga', 'pilates', 'reformer'].includes(goal);
  const mindful = MINDFUL_PATTERN.test(text) || goal === 'meditation';
  const strength = STRENGTH_PATTERN.test(text)
    || (['muscle', 'fat_loss'].includes(goal) && !mobility && !mindful);
  return { mobility, mindful, strength };
}

function workoutTarget(plan = {}) {
  const splitDays = Array.isArray(plan.workoutSplit)
    ? plan.workoutSplit.filter((day) => !day?.isRest && Array.isArray(day?.exercises) && day.exercises.length > 0).length
    : 0;
  return clamp(Number(plan.trainingDays) || splitDays || 3, 2, 6);
}

function calculateSleepScore(entries) {
  const hours = entries.map((entry) => Number(entry.hours)).filter((value) => value > 0 && value <= 16);
  if (hours.length < 2) return null;

  const average = hours.reduce((sum, value) => sum + value, 0) / hours.length;
  const durationScore = average >= 7 && average <= 9
    ? 100
    : average < 7
      ? clamp(100 - (7 - average) * 25)
      : clamp(100 - (average - 9) * 20);
  const variance = hours.reduce((sum, value) => sum + (value - average) ** 2, 0) / hours.length;
  const consistencyScore = clamp(100 - Math.sqrt(variance) * 35);

  return Math.round(durationScore * 0.7 + consistencyScore * 0.3);
}

function recommendationFor({ available, scores, checkins, plan, now }) {
  const todayCheckin = [...checkins].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
  if (todayCheckin?.date === localDateKey(now) && Number(todayCheckin.energy) === 1) {
    return { key: 'recovery', target: 'nutrition' };
  }
  if (!available.recovery) return { key: 'logSleep', target: 'nutrition' };
  if (!available.nutrition) return { key: 'checkin', target: 'progress' };
  if (!available.movement || scores.movement < 55) return { key: 'movement', target: 'workout' };
  if (scores.strength < 55) return { key: 'strength', target: 'workout' };
  if (scores.mobility < 55) return { key: 'mobility', target: 'workout' };
  if (scores.recovery < 65) return { key: 'sleep', target: 'nutrition' };
  if (scores.nutrition < 65) return { key: 'nutrition', target: 'nutrition' };

  const conditions = plan?.healthConditions || [];
  return { key: conditions.includes('heart_condition') || conditions.includes('heart_blood_pressure') ? 'steady' : 'maintain', target: 'today' };
}

export function calculateLongevityBalance({
  workoutLogs = [],
  sleepEntries = [],
  checkins = [],
  plan = {},
  now = new Date(),
} = {}) {
  const goal = normalizeGoal(plan);
  const recentWorkouts = recentEntries(workoutLogs, 28, now);
  const recentSleep = recentEntries(sleepEntries, 14, now);
  const recentCheckins = recentEntries(checkins, 14, now);
  const classifications = recentWorkouts.map((log) => classifySession(log, goal));
  const observedWeeks = 4;
  const weeklySessions = uniqueDays(recentWorkouts) / observedWeeks;
  const strengthSessions = classifications.filter((item) => item.strength).length / observedWeeks;
  const mobilitySessions = classifications.filter((item) => item.mobility || item.mindful).length / observedWeeks;

  const scores = {
    movement: Math.round(clamp((weeklySessions / workoutTarget(plan)) * 100)),
    strength: Math.round(clamp((strengthSessions / 2) * 100)),
    mobility: Math.round(clamp((mobilitySessions / 2) * 100)),
    recovery: calculateSleepScore(recentSleep),
    nutrition: recentCheckins.length
      ? Math.round((recentCheckins.filter((entry) => entry.nutrition_aligned ?? entry.nutritionAligned).length / recentCheckins.length) * 100)
      : null,
  };

  const available = {
    movement: recentWorkouts.length > 0,
    strength: recentWorkouts.length > 0,
    mobility: recentWorkouts.length > 0,
    recovery: scores.recovery != null,
    nutrition: scores.nutrition != null,
  };
  const availableKeys = Object.keys(PILLAR_WEIGHTS).filter((key) => available[key]);
  const totalWeight = availableKeys.reduce((sum, key) => sum + PILLAR_WEIGHTS[key], 0);
  const score = availableKeys.length >= 3
    ? Math.round(availableKeys.reduce((sum, key) => sum + scores[key] * PILLAR_WEIGHTS[key], 0) / totalWeight)
    : null;

  return {
    score,
    status: score == null ? 'collecting' : score >= 80 ? 'strong' : score >= 60 ? 'balanced' : score >= 40 ? 'building' : 'starting',
    scores,
    available,
    dataPoints: recentWorkouts.length + recentSleep.length + recentCheckins.length,
    recommendation: recommendationFor({ available, scores, checkins: recentCheckins, plan, now }),
    disclaimer: 'habit_score',
  };
}

export { PILLAR_WEIGHTS };
