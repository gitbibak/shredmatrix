// Streak rules shared by the Today panel, the streak calendar and share cards.
//
// A streak counts consecutive *scheduled* training days that were completed.
// Rest days from the plan never break it, and a frozen day is treated as kept
// without adding to the count (the same rule Duolingo uses for streak freezes).

const MAX_LOOKBACK_DAYS = 400;

export function toDateStr(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateStr(value) {
  return new Date(`${value}T00:00:00`);
}

function startOfDay(date = new Date()) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Monday = 0 … Sunday = 6, matching plan.workoutSplit order. */
export function weekdayIndex(date) {
  return (date.getDay() + 6) % 7;
}

export function isRestDay(day) {
  if (!day) return true;
  const text = `${day.day || ''} ${day.focus || ''}`.toLowerCase();
  return Boolean(day.isRest || text.includes('dinlen') || text.includes('rest') || text.includes('descanso'));
}

/** Weekday indexes the plan marks as rest days. */
export function getRestDayIndexes(plan) {
  const split = Array.isArray(plan?.workoutSplit) ? plan.workoutSplit : [];
  const indexes = new Set();
  split.slice(0, 7).forEach((day, index) => {
    if (isRestDay(day)) indexes.add(index);
  });
  return indexes;
}

export function workoutDatesFromLogs(logs) {
  return new Set(
    (Array.isArray(logs) ? logs : [])
      .map((entry) => String(entry?.date || entry?.createdAt || entry?.created_at || '').slice(0, 10))
      .filter(Boolean),
  );
}

function dayStatus(dateStr, date, { workoutDates, frozenDates, restDayIndexes }) {
  if (workoutDates.has(dateStr)) return 'workout';
  if (frozenDates.has(dateStr)) return 'frozen';
  if (restDayIndexes.has(weekdayIndex(date))) return 'rest';
  return 'missed';
}

export function computeStreaks(workoutDates, options = {}) {
  const context = {
    workoutDates: workoutDates instanceof Set ? workoutDates : new Set(workoutDates || []),
    frozenDates: options.frozenDates instanceof Set ? options.frozenDates : new Set(options.frozenDates || []),
    restDayIndexes: options.restDayIndexes instanceof Set ? options.restDayIndexes : new Set(options.restDayIndexes || []),
  };
  if (context.workoutDates.size === 0) return { current: 0, longest: 0 };

  const today = startOfDay(options.today);
  const sorted = [...context.workoutDates].sort();
  const firstDate = parseDateStr(sorted[0]);

  // Current streak: today is still open, so an empty today never breaks it.
  let current = 0;
  const cursor = new Date(today);
  if (!context.workoutDates.has(toDateStr(cursor))) cursor.setDate(cursor.getDate() - 1);
  for (let i = 0; i < MAX_LOOKBACK_DAYS && cursor >= firstDate; i += 1) {
    const status = dayStatus(toDateStr(cursor), cursor, context);
    if (status === 'missed') break;
    if (status === 'workout') current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Longest streak: walk forward from the first workout to today.
  let longest = 0;
  let run = 0;
  const forward = new Date(firstDate);
  for (let i = 0; i < MAX_LOOKBACK_DAYS && forward <= today; i += 1) {
    const status = dayStatus(toDateStr(forward), forward, context);
    if (status === 'workout') run += 1;
    else if (status === 'missed' && !(toDateStr(forward) === toDateStr(today))) run = 0;
    longest = Math.max(longest, run);
    forward.setDate(forward.getDate() + 1);
  }

  return { current, longest: Math.max(longest, current) };
}

/**
 * The most recent missed scheduled day that broke an existing streak, if
 * freezing it would restore that streak. Returns null when nothing to fix.
 */
export function findFreezeCandidate(workoutDates, options = {}) {
  const context = {
    workoutDates: workoutDates instanceof Set ? workoutDates : new Set(workoutDates || []),
    frozenDates: options.frozenDates instanceof Set ? options.frozenDates : new Set(options.frozenDates || []),
    restDayIndexes: options.restDayIndexes instanceof Set ? options.restDayIndexes : new Set(options.restDayIndexes || []),
  };
  if (context.workoutDates.size === 0) return null;
  const lookback = options.lookbackDays || 7;
  const today = startOfDay(options.today);
  const cursor = new Date(today);
  cursor.setDate(cursor.getDate() - 1);

  for (let i = 0; i < lookback; i += 1) {
    const dateStr = toDateStr(cursor);
    const status = dayStatus(dateStr, cursor, context);
    if (status === 'workout') return null;
    if (status === 'missed') {
      // Only worth freezing when a streak existed right before the gap.
      const before = computeStreaks(context.workoutDates, {
        ...context,
        today: new Date(cursor.getTime() - 86400000),
      });
      // computeStreaks treats its "today" as open, so re-check the day itself.
      const prior = new Date(cursor);
      prior.setDate(prior.getDate() - 1);
      const priorStatus = dayStatus(toDateStr(prior), prior, context);
      return before.current > 0 && priorStatus !== 'missed' ? dateStr : null;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return null;
}

export function mondayOf(date) {
  const copy = startOfDay(date);
  copy.setDate(copy.getDate() - weekdayIndex(copy));
  return copy;
}

/**
 * One free freeze per calendar week, plus one bonus freeze for every friend
 * who joined through an invite and created a plan.
 */
export function computeFreezeAllowance({ freezes = [], activatedReferrals = 0, today = new Date() } = {}) {
  const weekStart = toDateStr(mondayOf(today));
  const list = Array.isArray(freezes) ? freezes : [];
  const weeklyUsed = list.some((entry) => entry?.source === 'weekly' && String(entry?.date || '') >= weekStart);
  const referralUsed = list.filter((entry) => entry?.source === 'referral').length;
  const bonus = Math.max(0, (Number(activatedReferrals) || 0) - referralUsed);
  const weekly = weeklyUsed ? 0 : 1;
  return {
    weekly,
    bonus,
    total: weekly + bonus,
    nextSource: weekly > 0 ? 'weekly' : bonus > 0 ? 'referral' : null,
  };
}
