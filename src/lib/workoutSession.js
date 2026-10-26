// Guided workout session ("antrenman modu").
//
// Pure helpers: turn a plan day into a set-by-set session, remember the last
// performance per exercise, keep an unfinished session across reloads and
// convert the finished session into the existing workout_logs shape. The
// exercises JSON keeps its old structure ({ name, sets: [{ weight, reps,
// completed }] }) so reports, achievements and the coach view keep working.

export const SESSION_STORAGE_KEY = 'fullbalance_workout_session';
export const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;
export const MAX_SETS_PER_EXERCISE = 10;
export const MAX_WEIGHT_KG = 500;
export const MAX_REPS = 200;

const TIMED_PATTERN = /(\d+)\s*(s|sn|sec|seg|dk|min)\b/i;

function firstNumber(value) {
  const match = String(value ?? '').match(/\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(',', '.')) : null;
}

export function parseSetCount(value) {
  const count = Math.round(firstNumber(value) || 0);
  if (count < 1) return 1;
  return Math.min(count, MAX_SETS_PER_EXERCISE);
}

// "60s" → 60, "2 dk" → 120, "-" / "0s" → 0. Rest-day labels have no number.
export function parseRestSeconds(value) {
  const text = String(value ?? '').toLowerCase();
  const amount = firstNumber(text);
  if (!amount) return 0;
  const minutes = /\b(dk|min)/.test(text);
  return Math.min(Math.round(minutes ? amount * 60 : amount), 600);
}

// Reps like "8-10", "12/taraf" give a number to prefill; time based targets
// ("40s", "5 dk") are checked off instead of counted.
export function parseRepTarget(value) {
  const text = String(value ?? '').trim();
  if (TIMED_PATTERN.test(text)) return { timed: true, reps: null };
  const amount = firstNumber(text);
  if (!amount) return { timed: true, reps: null };
  return { timed: false, reps: Math.min(Math.round(amount), MAX_REPS) };
}

function normalizeName(name) {
  return String(name || '').toLocaleLowerCase('tr').trim();
}

// Latest logged set with real data for each exercise name, newest log first.
export function buildPreviousPerformance(logs = []) {
  const sorted = [...logs].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  const result = {};
  sorted.forEach((log) => {
    (log.exercises || []).forEach((exercise) => {
      const key = normalizeName(exercise.name);
      if (!key || result[key]) return;
      const sets = (exercise.sets || []).filter((set) => set?.completed && (Number(set.weight) > 0 || Number(set.reps) > 0));
      if (!sets.length) return;
      const best = sets.reduce((top, set) => (Number(set.weight) > Number(top.weight) ? set : top), sets[0]);
      result[key] = { weight: Number(best.weight) || 0, reps: Number(best.reps) || 0, date: log.date || null };
    });
  });
  return result;
}

function sessionExercise(exercise, section, previous, tracksLoad) {
  const target = parseRepTarget(exercise.reps);
  const last = previous[normalizeName(exercise.name)] || null;
  // Bodyweight and band work are counted in reps; only external loads get a kg field.
  const usesWeight = tracksLoad && !target.timed && !['none', 'resistance_band', 'stable_surface'].includes(exercise.equipment);
  return {
    name: exercise.name,
    ...(exercise.sourceName ? { sourceName: exercise.sourceName } : {}),
    section,
    targetSets: exercise.sets,
    targetReps: exercise.reps,
    rest: exercise.rest,
    restSec: parseRestSeconds(exercise.rest),
    timed: target.timed,
    usesWeight,
    equipment: exercise.equipment || null,
    previous: last,
    sets: Array.from({ length: parseSetCount(exercise.sets) }, () => ({
      reps: target.reps ?? (last?.reps || null),
      weight: usesWeight && last?.weight ? last.weight : null,
      done: false,
    })),
  };
}

export function buildSession(day, { logs = [], now = Date.now(), tracksLoad = true } = {}) {
  const previous = buildPreviousPerformance(logs);
  const exercises = [
    ...(day?.exercises || []).map((exercise) => sessionExercise(exercise, 'main', previous, tracksLoad)),
    ...(day?.coreFinisher || []).map((exercise) => sessionExercise(exercise, 'core', previous, tracksLoad)),
  ];
  return {
    version: 1,
    dayFocus: day?.focus || '',
    startedAt: new Date(now).toISOString(),
    exerciseIndex: 0,
    exercises,
  };
}

function clamp(value, max) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(number) || number < 0) return null;
  return Math.min(Math.round(number * 4) / 4, max);
}

export function updateSet(session, exerciseIndex, setIndex, patch) {
  const exercises = session.exercises.map((exercise, i) => {
    if (i !== exerciseIndex) return exercise;
    const sets = exercise.sets.map((set, j) => {
      if (j !== setIndex) return set;
      const next = { ...set, ...patch };
      if ('weight' in patch) next.weight = clamp(patch.weight, MAX_WEIGHT_KG);
      if ('reps' in patch) next.reps = clamp(patch.reps, MAX_REPS);
      return next;
    });
    return { ...exercise, sets };
  });
  return { ...session, exercises };
}

export function addSet(session, exerciseIndex) {
  const exercises = session.exercises.map((exercise, i) => {
    if (i !== exerciseIndex || exercise.sets.length >= MAX_SETS_PER_EXERCISE) return exercise;
    const last = exercise.sets[exercise.sets.length - 1] || {};
    return { ...exercise, sets: [...exercise.sets, { reps: last.reps ?? null, weight: last.weight ?? null, done: false }] };
  });
  return { ...session, exercises };
}

// When a set is checked, carry its numbers to the following unchecked sets so
// the member types each load once.
export function completeSet(session, exerciseIndex, setIndex) {
  const exercise = session.exercises[exerciseIndex];
  const set = exercise?.sets[setIndex];
  if (!set) return session;
  let next = updateSet(session, exerciseIndex, setIndex, { done: !set.done });
  if (!set.done) {
    exercise.sets.forEach((other, j) => {
      if (j > setIndex && !other.done) {
        next = updateSet(next, exerciseIndex, j, { weight: set.weight ?? other.weight, reps: set.reps ?? other.reps });
      }
    });
  }
  return next;
}

export function isExerciseDone(exercise) {
  return exercise.sets.length > 0 && exercise.sets.every((set) => set.done);
}

export function summarizeSession(session, now = Date.now()) {
  let setsDone = 0;
  let volume = 0;
  let exercisesDone = 0;
  session.exercises.forEach((exercise) => {
    const done = exercise.sets.filter((set) => set.done);
    if (done.length) exercisesDone += 1;
    setsDone += done.length;
    done.forEach((set) => { volume += (Number(set.weight) || 0) * (Number(set.reps) || 0); });
  });
  const totalSets = session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
  const minutes = Math.max(1, Math.round((now - new Date(session.startedAt).getTime()) / 60000));
  return { setsDone, totalSets, exercisesDone, totalExercises: session.exercises.length, volume: Math.round(volume), minutes: Math.min(minutes, 600) };
}

// Analytics only receives a coarse share of completed sets, never set data.
export function sessionProgressBucket({ setsDone, totalSets }) {
  if (!totalSets || setsDone <= 0) return 'none';
  const progress = setsDone / totalSets;
  if (progress < 0.25) return 'under_25';
  if (progress < 0.5) return '25_49';
  if (progress < 0.75) return '50_74';
  if (progress < 1) return '75_99';
  return 'all_sets';
}

export function findRecords(session, previous = {}) {
  return session.exercises
    .filter((exercise) => exercise.usesWeight)
    .map((exercise) => {
      const best = Math.max(0, ...exercise.sets.filter((set) => set.done).map((set) => Number(set.weight) || 0));
      const before = previous[normalizeName(exercise.name)]?.weight || 0;
      return best > 0 && before > 0 && best > before ? { name: exercise.name, weight: best, previous: before } : null;
    })
    .filter(Boolean);
}

export function sessionToLogEntry(session, date) {
  const exercises = session.exercises
    .filter((exercise) => exercise.sets.some((set) => set.done))
    .map((exercise) => {
      const sets = exercise.sets.map((set) => ({
        weight: Number(set.weight) || 0,
        reps: Number(set.reps) || 0,
        completed: Boolean(set.done),
      }));
      const topWeight = Math.max(0, ...sets.filter((set) => set.completed).map((set) => set.weight));
      return {
        name: exercise.name,
        ...(exercise.section === 'core' ? { section: 'core' } : {}),
        ...(exercise.timed ? { timed: true } : {}),
        ...(topWeight > 0 ? { weight: topWeight } : {}),
        sets,
      };
    });
  return { date, dayFocus: session.dayFocus, day_focus: session.dayFocus, exercises };
}

function storage() {
  try { return typeof window !== 'undefined' ? window.localStorage : null; } catch { return null; }
}

export function saveSessionDraft(session) {
  try { storage()?.setItem(SESSION_STORAGE_KEY, JSON.stringify(session)); } catch { /* storage full or blocked */ }
}

export function clearSessionDraft() {
  try { storage()?.removeItem(SESSION_STORAGE_KEY); } catch { /* blocked */ }
}

export function loadSessionDraft(now = Date.now()) {
  try {
    const raw = storage()?.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    const age = now - new Date(session?.startedAt).getTime();
    if (session?.version !== 1 || !Array.isArray(session.exercises) || !(age >= 0 && age < SESSION_MAX_AGE_MS)) {
      clearSessionDraft();
      return null;
    }
    return session;
  } catch {
    clearSessionDraft();
    return null;
  }
}
