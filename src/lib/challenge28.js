// 28-day start challenge: 12 workout days within 28 days, 3 per week.
// Progress comes from the member's own workout log dates, so nothing is
// counted that the member did not actually log.

export const CHALLENGE28 = Object.freeze({ id: 'start28', days: 28, target: 12, perWeek: 3 });

const dayNumber = (key) => Math.floor(Date.parse(`${key}T00:00:00Z`) / 86400000);
const isDateKey = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

/**
 * @param {{ startedAt?: string, completedAt?: string } | null | undefined} challenge
 * @param {Iterable<string>} workoutDates local YYYY-MM-DD workout days
 * @param {string} today local YYYY-MM-DD
 */
export function challengeStatus(challenge, workoutDates, today) {
  if (!challenge || !isDateKey(challenge.startedAt) || !isDateKey(today)) return { state: 'none' };
  const start = dayNumber(challenge.startedAt);
  const offset = dayNumber(today) - start;
  if (offset < 0) return { state: 'none' };

  const weeks = [0, 0, 0, 0];
  let done = 0;
  for (const date of new Set(workoutDates)) {
    if (!isDateKey(date)) continue;
    const index = dayNumber(date) - start;
    if (index < 0 || index >= CHALLENGE28.days) continue;
    done += 1;
    weeks[Math.floor(index / 7)] += 1;
  }

  const day = Math.min(offset + 1, CHALLENGE28.days);
  const currentWeek = Math.min(Math.floor(offset / 7), 3);
  const base = { day, done, weeks, currentWeek, leftThisWeek: Math.max(0, CHALLENGE28.perWeek - weeks[currentWeek]) };
  if (done >= CHALLENGE28.target || challenge.completedAt) return { ...base, state: 'completed' };
  if (offset >= CHALLENGE28.days) return { ...base, state: 'ended' };
  return { ...base, state: 'active' };
}
