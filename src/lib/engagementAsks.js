// Frequency rules for asking members for support, reviews and ideas, so each
// ask lands at a good moment and the app never nags:
// - one kind of ask per session,
// - no support ask in the first 3 days after signup or within 30 days of a
//   1-3 star rating,
// - each kind has its own cooldown.
// State lives in localStorage per member; if storage is unavailable we ask
// nothing rather than risk repeating.

const DAY = 86400000;
const SESSION_KEY = 'fb_ask_session';
const stateKey = (userId) => `fb_asks:${userId}`;
const createdKey = (userId) => `fb_account_created:${userId}`;

export const ASK_RULES = Object.freeze({
  support: { minAccountDays: 3, cooldownDays: 14 },
  idea: { minAccountDays: 1, cooldownDays: 21 },
  review: { minAccountDays: 0, cooldownDays: 0 }, // the review prompts keep their own monthly limit
  founder_note: { minAccountDays: 0, cooldownDays: 0 }, // gated by note id instead
});
const LOW_RATING_SUPPORT_PAUSE_DAYS = 30;

// Workout counts that open the star-rating moment (1 = right after the first
// workout). A support ask never shares the screen with a rating ask.
export const RATING_MILESTONES = Object.freeze([1, 3, 10, 25, 50, 100]);

function readState(userId) {
  const raw = localStorage.getItem(stateKey(userId));
  return raw ? JSON.parse(raw) : { lastShown: {} };
}

function writeState(userId, state) {
  localStorage.setItem(stateKey(userId), JSON.stringify(state));
}

/** Remember when the account was created (the Today tab knows it). */
export function rememberAccountCreated(userId, createdAt) {
  if (!userId || !createdAt) return;
  try { localStorage.setItem(createdKey(userId), String(createdAt)); } catch { /* optional */ }
}

function accountAgeDays(userId, now) {
  const created = Date.parse(localStorage.getItem(createdKey(userId)) || '');
  return Number.isNaN(created) ? null : (now - created) / DAY;
}

/** Days since signup, or null when unknown on this device. */
export function accountAge({ userId, now = Date.now() } = {}) {
  if (!userId) return null;
  try { return accountAgeDays(userId, now); } catch { return null; }
}

// ignoreAccountAge: a member who just wrote a 4-5 star review has told us how
// they feel, so the new-account pause does not apply to that one moment.
export function canAsk(kind, { userId, now = Date.now(), ignoreAccountAge = false } = {}) {
  const rule = ASK_RULES[kind];
  if (!rule || !userId) return false;
  try {
    const sessionKind = sessionStorage.getItem(SESSION_KEY);
    if (sessionKind && sessionKind !== kind) return false;
    const age = accountAgeDays(userId, now);
    if (!ignoreAccountAge && rule.minAccountDays > 0 && (age === null || age < rule.minAccountDays)) return false;
    const state = readState(userId);
    const last = state.lastShown?.[kind] || 0;
    if (rule.cooldownDays > 0 && now - last < rule.cooldownDays * DAY && sessionKind !== kind) return false;
    if (kind === 'support' && state.lowRatingAt && now - state.lowRatingAt < LOW_RATING_SUPPORT_PAUSE_DAYS * DAY) return false;
    return true;
  } catch {
    return false;
  }
}

export function recordAsk(kind, { userId, now = Date.now() } = {}) {
  if (!userId) return;
  try {
    sessionStorage.setItem(SESSION_KEY, kind);
    const state = readState(userId);
    state.lastShown = { ...state.lastShown, [kind]: now };
    writeState(userId, state);
  } catch { /* storage unavailable: canAsk already returns false */ }
}

/** A 1-3 star rating pauses support asks; the member gets help, not a tip jar. */
export function recordRating(rating, { userId, now = Date.now() } = {}) {
  if (!userId || !(rating >= 1 && rating <= 3)) return;
  try {
    const state = readState(userId);
    writeState(userId, { ...state, lowRatingAt: now });
  } catch { /* optional */ }
}

export function hasSeen(key, { userId } = {}) {
  if (!userId) return true;
  try { return Boolean(readState(userId).seen?.[key]); } catch { return true; }
}

export function markSeen(key, { userId, now = Date.now() } = {}) {
  if (!userId) return;
  try {
    const state = readState(userId);
    writeState(userId, { ...state, seen: { ...state.seen, [key]: now } });
  } catch { /* optional */ }
}

/** True while a recent 1-3 star rating keeps support links hidden. */
export function supportPaused({ userId, now = Date.now() } = {}) {
  if (!userId) return true;
  try {
    const { lowRatingAt } = readState(userId);
    return Boolean(lowRatingAt && now - lowRatingAt < LOW_RATING_SUPPORT_PAUSE_DAYS * DAY);
  } catch {
    return true;
  }
}
