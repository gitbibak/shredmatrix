const DEFAULT_TARGET_WATER = 8;

function safeDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function inLastDays(dateValue, days) {
  const date = safeDate(dateValue);
  if (!date) return false;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return date >= start;
}

function latestByDate(entries = []) {
  return [...entries]
    .filter((entry) => entry?.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))[0] || null;
}

function countUniqueDates(entries = [], days = 7) {
  return new Set(
    entries
      .filter((entry) => inLastDays(entry.date || entry.createdAt, days))
      .map((entry) => String(entry.date || entry.createdAt).slice(0, 10)),
  ).size;
}

function average(values) {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) return null;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

export function summarizeTrainerData({
  plan,
  workoutLogs = [],
  progressEntries = [],
  measurements = [],
  waterHistory = [],
  sleepEntries = [],
} = {}) {
  const latestProgress = latestByDate(progressEntries);
  const previousProgress = [...progressEntries]
    .filter((entry) => entry?.date && entry.date !== latestProgress?.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))[0] || null;
  const latestMeasurement = latestByDate(measurements);

  const waterLast7 = waterHistory.filter((entry) => inLastDays(entry.date, 7));
  const sleepLast7 = sleepEntries.filter((entry) => inLastDays(entry.date, 7));

  const workoutsLast7 = countUniqueDates(workoutLogs, 7);
  const workoutsLast30 = countUniqueDates(workoutLogs, 30);
  const waterAvg = average(waterLast7.map((entry) => Number(entry.glasses ?? entry.amount)));
  const waterTargetDays = waterLast7.filter((entry) => {
    const glasses = Number(entry.glasses ?? entry.amount ?? 0);
    return entry.target_met || entry.targetMet || glasses >= DEFAULT_TARGET_WATER;
  }).length;
  const sleepAvg = average(sleepLast7.map((entry) => Number(entry.hours)));

  const currentWeight = Number(latestProgress?.weight);
  const previousWeight = Number(previousProgress?.weight);
  const weightChange = Number.isFinite(currentWeight) && Number.isFinite(previousWeight)
    ? currentWeight - previousWeight
    : null;

  return {
    athleteName: plan?.userName || 'Athlete',
    goal: plan?.goal || plan?.primaryGoal || '-',
    calories: Number(plan?.dailyCalories) || null,
    macros: plan?.macros || {},
    workoutsLast7,
    workoutsLast30,
    waterAvg,
    waterTargetDays,
    sleepAvg,
    latestProgress,
    latestMeasurement,
    weightChange,
    trainingDaysPerWeek: plan?.workoutSplit?.filter((day) => !day.isRest).length || 0,
  };
}

function formatNumber(value, digits = 1) {
  if (!Number.isFinite(value)) return '-';
  return Number(value).toFixed(digits).replace(/\\.0$/, '');
}

export function formatTrainerReport(summary, labels = {}) {
  const l = {
    title: 'PT Progress Report',
    athlete: 'Athlete',
    goal: 'Goal',
    calories: 'Calories',
    macros: 'Macros',
    training: 'Training',
    workouts7: 'Workouts last 7 days',
    workouts30: 'Workouts last 30 days',
    water: 'Water',
    sleep: 'Sleep',
    latestWeight: 'Latest weight',
    bodyFat: 'Body fat',
    weightChange: 'Weight change',
    measurements: 'Measurements',
    generated: 'Generated',
    noData: 'No data',
    ...labels,
  };

  const protein = summary.macros?.protein;
  const carbs = summary.macros?.carbs;
  const fat = summary.macros?.fat;
  const measurement = summary.latestMeasurement;

  return [
    `${l.title}`,
    `${l.generated}: ${new Date().toISOString().slice(0, 10)}`,
    '',
    `${l.athlete}: ${summary.athleteName}`,
    `${l.goal}: ${summary.goal}`,
    `${l.calories}: ${summary.calories ? `${Math.round(summary.calories)} kcal` : '-'}`,
    `${l.macros}: P ${protein ?? '-'}g / C ${carbs ?? '-'}g / F ${fat ?? '-'}g`,
    '',
    `${l.training}: ${summary.trainingDaysPerWeek} days/week`,
    `${l.workouts7}: ${summary.workoutsLast7}`,
    `${l.workouts30}: ${summary.workoutsLast30}`,
    `${l.water}: ${summary.waterAvg == null ? l.noData : `${formatNumber(summary.waterAvg)} glasses/day (${summary.waterTargetDays}/7 target days)`}`,
    `${l.sleep}: ${summary.sleepAvg == null ? l.noData : `${formatNumber(summary.sleepAvg)} h/day`}`,
    '',
    `${l.latestWeight}: ${summary.latestProgress?.weight ? `${summary.latestProgress.weight} kg (${summary.latestProgress.date})` : l.noData}`,
    `${l.bodyFat}: ${summary.latestProgress?.bodyFat ?? summary.latestProgress?.body_fat ?? '-'}`,
    `${l.weightChange}: ${summary.weightChange == null ? '-' : `${formatNumber(summary.weightChange)} kg`}`,
    `${l.measurements}: ${measurement ? `chest ${measurement.chest ?? '-'} / waist ${measurement.waist ?? '-'} / hip ${measurement.hip ?? '-'} / arm ${measurement.arm ?? '-'} / leg ${measurement.leg ?? '-'}` : l.noData}`,
  ].join('\n');
}
