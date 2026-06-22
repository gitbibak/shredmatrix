// ─────────────────────────────────────────────────────────
// adaptiveEngine.js
// Intelligent analysis engine that monitors user fitness
// progress and recommends program phase changes.
// Pure JS — no React imports needed.
// ─────────────────────────────────────────────────────────

import {
  getProgress,
  getMeasurements,
  getCurrentPhase,
  getPlanCreatedAt,
  updatePhase,
} from '../lib/dataService';

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const PHASE_DURATION_WEEKS = 8;
const WEIGHT_THRESHOLD_KG = 0.5; // ±0.5 kg to count as gaining/losing
const MIN_ENTRIES_FOR_TREND = 6; // need at least 6 entries (3 recent + 3 previous)
const PLATEAU_WEEKS = 3;
const STAGNATION_WEEKS = 4;

// ─── Helpers ─────────────────────────────────────────────

/**
 * Calculate the arithmetic mean of an array of numbers.
 */
function mean(values) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Determine trend label from a numeric difference.
 * Positive threshold → 'gaining', negative → 'losing', else 'stable'.
 */
function trendLabel(diff, threshold = WEIGHT_THRESHOLD_KG) {
  if (diff > threshold) return 'gaining';
  if (diff < -threshold) return 'losing';
  return 'stable';
}

/**
 * Count how many consecutive recent weekly windows show a "stable" trend.
 * Used for plateau / stagnation duration checks.
 * Walks backward through sorted entries in weekly buckets.
 */
function countStableWeeks(entries, valueExtractor, threshold = WEIGHT_THRESHOLD_KG) {
  if (entries.length < 2) return 0;

  // Sort by date ascending
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Bucket entries into weeks (relative to the earliest entry)
  const origin = new Date(sorted[0].date).getTime();
  const weeks = {};
  sorted.forEach((e) => {
    const weekIdx = Math.floor((new Date(e.date).getTime() - origin) / MS_PER_WEEK);
    if (!weeks[weekIdx]) weeks[weekIdx] = [];
    weeks[weekIdx].push(valueExtractor(e));
  });

  const weekKeys = Object.keys(weeks)
    .map(Number)
    .sort((a, b) => a - b);

  if (weekKeys.length < 2) return 0;

  // Walk backwards and count consecutive stable weeks
  let stableCount = 0;
  for (let i = weekKeys.length - 1; i >= 1; i--) {
    const currentAvg = mean(weeks[weekKeys[i]]);
    const prevAvg = mean(weeks[weekKeys[i - 1]]);
    const diff = currentAvg - prevAvg;

    if (Math.abs(diff) <= threshold) {
      stableCount++;
    } else {
      break; // streak broken
    }
  }

  return stableCount;
}

// ─── Main Analysis ───────────────────────────────────────

/**
 * Analyze user fitness progress and recommend program changes.
 *
 * @param {Object} plan - The user's current training plan.
 * @param {string} plan.goal - 'Kas Gelişimi' (muscle) or 'Yağ Yakımı' (fat loss).
 * @returns {Object} Analysis result with change recommendation.
 */
export async function analyzeProgress(plan) {
  // --- Read data via dataService (Supabase + localStorage fallback) ---
  const progressEntries = await getProgress();                    // {date, weight, bodyFat}
  const measureEntries = await getMeasurements();                 // {date, chest, waist, hip, arm, leg}
  const planCreated = await getPlanCreatedAt();
  const currentPhase = await getCurrentPhase();

  // --- Calculate program age in weeks ---
  const startDate = planCreated ? new Date(planCreated) : new Date();
  const programAgeWeeks = Math.floor((Date.now() - startDate.getTime()) / MS_PER_WEEK);

  // --- Phase timing ---
  // Each phase lasts 8 weeks; calculate weeks remaining in current phase
  const weeksIntoPhase = programAgeWeeks % PHASE_DURATION_WEEKS;
  const phaseWeeksLeft = PHASE_DURATION_WEEKS - weeksIntoPhase;

  // --- Weight trend (last 3 vs previous 3 entries) ---
  const sortedProgress = [...progressEntries].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  let weightTrend = 'stable';
  let weightChange = 0;
  let fatChange = 0;

  if (sortedProgress.length >= MIN_ENTRIES_FOR_TREND) {
    const recent3 = sortedProgress.slice(-3);
    const prev3 = sortedProgress.slice(-6, -3);

    const recentWeightAvg = mean(recent3.map((e) => Number(e.weight) || 0));
    const prevWeightAvg = mean(prev3.map((e) => Number(e.weight) || 0));
    weightChange = +(recentWeightAvg - prevWeightAvg).toFixed(2);
    weightTrend = trendLabel(weightChange);

    const recentFatAvg = mean(recent3.map((e) => Number(e.bodyFat) || 0));
    const prevFatAvg = mean(prev3.map((e) => Number(e.bodyFat) || 0));
    fatChange = +(recentFatAvg - prevFatAvg).toFixed(2);
  }

  // --- Measurement trend (chest + arm average, last 3 vs previous 3) ---
  const sortedMeasures = [...measureEntries].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  let measureTrend = 'stable';
  let measureChange = 0;

  if (sortedMeasures.length >= MIN_ENTRIES_FOR_TREND) {
    const recent3 = sortedMeasures.slice(-3);
    const prev3 = sortedMeasures.slice(-6, -3);

    const recentAvg = mean(
      recent3.map((e) => (Number(e.chest) || 0) + (Number(e.arm) || 0))
    );
    const prevAvg = mean(
      prev3.map((e) => (Number(e.chest) || 0) + (Number(e.arm) || 0))
    );
    measureChange = +(recentAvg - prevAvg).toFixed(2);
    measureTrend = trendLabel(measureChange);
  }

  // --- Determine goal type ---
  const isMuscleGoal = plan?.goal === 'Kas Gelişimi';
  const isWellnessGoal = ['Meditasyon', 'Yoga', 'Pilates', 'Reformer'].includes(plan?.goal);
  const plateauThreshold = isWellnessGoal ? 6 : PLATEAU_WEEKS;

  // --- Decide if program change is needed ---
  let shouldChange = false;
  let reason = 'none';

  // Count consecutive stable weeks for plateau / stagnation detection
  const weightStableWeeks = countStableWeeks(
    sortedProgress,
    (e) => Number(e.weight) || 0
  );

  const measureStableWeeks = countStableWeeks(
    sortedMeasures,
    (e) => (Number(e.chest) || 0) + (Number(e.arm) || 0)
  );

  // Rule 5: Muscle goal — both weight AND measurements stable for 3+ weeks → plateau
  if (
    isMuscleGoal &&
    weightTrend === 'stable' &&
    measureTrend === 'stable' &&
    weightStableWeeks >= plateauThreshold
  ) {
    shouldChange = true;
    reason = 'plateau';
  }

  // Rule 6: Fat loss / other goals — weight stable for threshold weeks → plateau
  if (
    !isMuscleGoal &&
    weightTrend === 'stable' &&
    weightStableWeeks >= plateauThreshold &&
    reason === 'none'
  ) {
    shouldChange = true;
    reason = 'plateau';
  }

  // Rule 7: Time-based phase expiry
  if (programAgeWeeks >= (currentPhase + 1) * PHASE_DURATION_WEEKS && reason === 'none') {
    shouldChange = true;
    reason = 'time';
  }

  // Rule 8: All measurements stagnant for 4+ weeks → stagnation
  if (
    sortedMeasures.length > 0 &&
    measureStableWeeks >= STAGNATION_WEEKS &&
    reason === 'none'
  ) {
    shouldChange = true;
    reason = 'stagnation';
  }

  // Rule 9: Suggested next phase (capped at 3)
  const suggestedPhase = Math.min(currentPhase + 1, 3);

  // --- Build summary ---
  const summary = {
    weightChange,   // kg difference: last 3 avg vs previous 3 avg
    fatChange,      // body fat % difference
    measureChange,  // chest+arm cm difference
  };

  return {
    shouldChange,
    reason,
    currentPhase,
    suggestedPhase,
    programAgeWeeks,
    phaseWeeksLeft,
    weightTrend,
    measureTrend,
    summary,
  };
}

// ─── Phase Advancement ───────────────────────────────────

/**
 * Advance to a new training phase.
 * Resets the plan creation date so the new phase timer starts fresh.
 *
 * @param {number} newPhase - The phase number to advance to (0-3).
 */
export async function advancePhase(newPhase) {
  await updatePhase(newPhase);
}
