/**
 * Explainable Full Balance score (0-100).
 *
 * Only observed, non-sensitive wellness actions are scored. Missing categories
 * are excluded from the weighted average so a user is never penalized for data
 * they have not provided.
 */

const DAY_MS = 86_400_000;
const PRIMARY_CATEGORIES = ['activity', 'nutrition', 'recovery', 'consistency'];
const CATEGORY_WEIGHTS = {
  activity: 0.35,
  nutrition: 0.25,
  recovery: 0.25,
  consistency: 0.15,
  hydration: 0.1,
  mindfulness: 0.1,
};

function clamp(value, min = 0, max = 100) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

function getDateKey(value, timeZone) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function dateKeysEndingAt(referenceDate, days, timeZone) {
  const endKey = getDateKey(referenceDate, timeZone);
  if (!endKey) return [];
  const [year, month, day] = endKey.split('-').map(Number);
  const anchor = Date.UTC(year, month - 1, day, 12);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(anchor - ((days - 1 - index) * DAY_MS));
    return date.toISOString().slice(0, 10);
  });
}

function entriesInWindow(entries, windowKeys, timeZone) {
  const allowed = new Set(windowKeys);
  return (Array.isArray(entries) ? entries : [])
    .map((entry) => ({ entry, dateKey: getDateKey(entry?.date || entry?.created_at || entry?.createdAt, timeZone) }))
    .filter(({ dateKey }) => dateKey && allowed.has(dateKey));
}

function uniqueDays(entries) {
  return new Set(entries.map(({ dateKey }) => dateKey)).size;
}

function scoreActivity(workouts, weeklyTarget) {
  if (workouts.length === 0) return null;
  const target = Math.max(1, Math.min(7, Math.round(Number(weeklyTarget) || 4)));
  return Math.round(clamp((uniqueDays(workouts) / target) * 100));
}

function scoreNutrition(checkins) {
  const valid = checkins.filter(({ entry }) => typeof entry?.nutrition_aligned === 'boolean');
  if (valid.length === 0) return null;
  const aligned = valid.filter(({ entry }) => entry.nutrition_aligned).length;
  return Math.round(clamp((aligned / valid.length) * 100));
}

function sleepQuality(hours) {
  const value = Number(hours);
  if (!Number.isFinite(value) || value <= 0 || value > 24) return null;
  if (value >= 7 && value <= 9) return 100;
  if ((value >= 6 && value < 7) || (value > 9 && value <= 10)) return 75;
  if ((value >= 5 && value < 6) || (value > 10 && value <= 11)) return 45;
  return 20;
}

function scoreRecovery(sleepEntries, checkins) {
  const sleepScores = sleepEntries
    .map(({ entry }) => sleepQuality(entry?.hours))
    .filter((value) => value != null);
  const energyScores = checkins
    .map(({ entry }) => Number(entry?.energy))
    .filter((value) => [1, 2, 3].includes(value))
    .map((value) => ({ 1: 35, 2: 70, 3: 100 })[value]);

  if (sleepScores.length === 0 && energyScores.length === 0) return null;
  const sleepAverage = sleepScores.length
    ? sleepScores.reduce((sum, value) => sum + value, 0) / sleepScores.length
    : null;
  const energyAverage = energyScores.length
    ? energyScores.reduce((sum, value) => sum + value, 0) / energyScores.length
    : null;
  if (sleepAverage == null) return Math.round(energyAverage);
  if (energyAverage == null) return Math.round(sleepAverage);
  return Math.round((sleepAverage * 0.7) + (energyAverage * 0.3));
}

function scoreConsistency(allEntries, windowLength) {
  const observedDays = uniqueDays(allEntries);
  if (observedDays < 2) return null;
  return Math.round(clamp((observedDays / Math.max(1, windowLength)) * 100));
}

function scoreHydration(waterEntries, targetGlasses) {
  const valid = waterEntries.filter(({ entry }) => Number.isFinite(Number(entry?.glasses ?? entry?.amount)));
  if (valid.length === 0) return null;
  const target = Math.max(1, Number(targetGlasses) || 8);
  const average = valid.reduce((sum, { entry }) => {
    const ratio = entry?.target_met === true
      ? 1
      : clamp(Number(entry?.glasses ?? entry?.amount) / target, 0, 1);
    return sum + ratio;
  }, 0) / valid.length;
  return Math.round(average * 100);
}

function isMindfulnessLog(log, goalType) {
  if (goalType === 'meditation') return true;
  const exercises = Array.isArray(log?.exercises) ? log.exercises : [];
  const text = [log?.day_focus, log?.focus, log?.notes, ...exercises]
    .filter(Boolean)
    .map((value) => typeof value === 'string' ? value : value?.name)
    .filter(Boolean)
    .join(' ');
  return /meditat|mindful|nefes|breath|farkındalık|mantra|vücut tarama|body scan/i.test(text);
}

function scoreMindfulness(workouts, goalType, weeklyTarget) {
  const sessions = workouts.filter(({ entry }) => isMindfulnessLog(entry, goalType));
  if (sessions.length === 0) return null;
  const target = goalType === 'meditation'
    ? Math.max(1, Math.min(7, Math.round(Number(weeklyTarget) || 4)))
    : 3;
  return Math.round(clamp((uniqueDays(sessions) / target) * 100));
}

function weightedAverage(categoryScores) {
  const available = Object.entries(categoryScores).filter(([, value]) => value != null);
  const weightTotal = available.reduce((sum, [key]) => sum + CATEGORY_WEIGHTS[key], 0);
  if (weightTotal === 0) return null;
  return Math.round(available.reduce((sum, [key, value]) => (
    sum + (value * CATEGORY_WEIGHTS[key])
  ), 0) / weightTotal);
}

function rankedInsights(categoryScores) {
  const ranked = Object.entries(categoryScores)
    .filter(([, value]) => value != null)
    .map(([category, score]) => ({ category, score }))
    .sort((a, b) => b.score - a.score || a.category.localeCompare(b.category));
  return {
    strengths: ranked.filter(({ score }) => score >= 70).slice(0, 2),
    improvementAreas: [...ranked].reverse().filter(({ score }) => score < 70).slice(0, 2),
  };
}

const LEVELS = [
  { min: 0, max: 30, key: 'beginner', color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30' },
  { min: 31, max: 50, key: 'developing', color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30' },
  { min: 51, max: 70, key: 'consistent', color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30' },
  { min: 71, max: 85, key: 'strong', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  { min: 86, max: 100, key: 'elite', color: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30' },
];

export function getLevel(score) {
  const normalized = clamp(score);
  return LEVELS.find((level) => normalized >= level.min && normalized <= level.max) || LEVELS[0];
}

/**
 * @param {Object} data
 * @returns {import('./balanceScore').BalanceScoreResult}
 */
export function calculateBalanceScore({
  workoutLogs = [],
  waterHistory = [],
  sleepEntries = [],
  checkins = [],
  weeklyTarget = 4,
  targetGlasses = 8,
  goalType = 'unknown',
  referenceDate = new Date(),
  timeZone = 'UTC',
} = {}) {
  const windowKeys = dateKeysEndingAt(referenceDate, 7, timeZone);
  const workouts = entriesInWindow(workoutLogs, windowKeys, timeZone);
  const water = entriesInWindow(waterHistory, windowKeys, timeZone);
  const sleep = entriesInWindow(sleepEntries, windowKeys, timeZone);
  const wellbeing = entriesInWindow(checkins, windowKeys, timeZone);
  const allEntries = [...workouts, ...water, ...sleep, ...wellbeing];

  const categoryScores = {
    activity: scoreActivity(workouts, weeklyTarget),
    nutrition: scoreNutrition(wellbeing),
    recovery: scoreRecovery(sleep, wellbeing),
    consistency: scoreConsistency(allEntries, windowKeys.length),
    hydration: scoreHydration(water, targetGlasses),
    mindfulness: scoreMindfulness(workouts, goalType, weeklyTarget),
  };

  const availableCategories = Object.keys(categoryScores).filter((key) => categoryScores[key] != null);
  const missingCategories = Object.keys(categoryScores).filter((key) => categoryScores[key] == null);
  const availablePrimary = PRIMARY_CATEGORIES.filter((key) => categoryScores[key] != null);
  const signalCount = allEntries.length;
  const observedDays = uniqueDays(allEntries);
  const sufficient = availablePrimary.length >= 2 && signalCount >= 3 && observedDays >= 2;
  const calculatedScore = weightedAverage(categoryScores);
  const overallScore = sufficient ? calculatedScore : null;
  const insights = rankedInsights(categoryScores);
  const dataCompleteness = {
    percentage: Math.round((availablePrimary.length / PRIMARY_CATEGORIES.length) * 100),
    availableCategories,
    missingCategories,
    signalCount,
    sufficient,
  };

  return {
    overallScore,
    categoryScores,
    strengths: sufficient ? insights.strengths : [],
    improvementAreas: sufficient ? insights.improvementAreas : [],
    dataCompleteness,
    period: { start: windowKeys[0] || null, end: windowKeys.at(-1) || null },
    score: overallScore,
    breakdown: categoryScores,
    level: getLevel(overallScore ?? 0),
    trend: 'stable',
  };
}

export const MOODS = [
  { id: 'exhausted', emoji: '😴', intensity: 0.6, key: 'mood.exhausted' },
  { id: 'low', emoji: '😐', intensity: 0.85, key: 'mood.low' },
  { id: 'normal', emoji: '💪', intensity: 1.0, key: 'mood.normal' },
  { id: 'energetic', emoji: '🔥', intensity: 1.2, key: 'mood.energetic' },
  { id: 'zen', emoji: '🧘', intensity: 0.7, key: 'mood.zen' },
];

const MOOD_STORAGE_KEY = 'shredmatrix_mood';

export function saveMood(moodId) {
  const today = new Date().toISOString().split('T')[0];
  try {
    const history = JSON.parse(localStorage.getItem(MOOD_STORAGE_KEY) || '{}');
    history[today] = { mood: moodId, timestamp: Date.now() };
    localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(history));
  } catch { /* Optional local preference. */ }
}

export function getTodayMood() {
  const today = new Date().toISOString().split('T')[0];
  try {
    const history = JSON.parse(localStorage.getItem(MOOD_STORAGE_KEY) || '{}');
    return history[today]?.mood || null;
  } catch { return null; }
}

export function getMoodHistory(days = 30) {
  try {
    const history = JSON.parse(localStorage.getItem(MOOD_STORAGE_KEY) || '{}');
    return Object.entries(history)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, days);
  } catch { return []; }
}

export function getMoodIntensity(moodId) {
  const mood = MOODS.find((item) => item.id === moodId);
  return mood ? mood.intensity : 1;
}
