import { supabase, isSupabaseReady } from './supabase';
import { getAcquisitionContext } from './acquisition';

// ══════════════════════════════════════════════
// Full Balance — Data Service Layer
// Hybrid: Supabase (primary) + localStorage (fallback)
// ══════════════════════════════════════════════

// ── Helpers ──────────────────────────────────

let activeUserId = null;
let profilePhotoCache = null;
let profilePhotoRequest = null;

const PROFILE_PHOTO_KEY = 'shredmatrix_profile_photo';
const PROFILE_PHOTO_EXPIRY_KEY = 'shredmatrix_profile_photo_expires';

function lsGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) { console.warn('[DataService]', err?.message || err); return fallback; }
}

function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (err) { console.warn('[DataService]', err?.message || err); }
}

function lsRemove(key) {
  try { localStorage.removeItem(key); } catch (err) { console.warn('[DataService]', err?.message || err); }
}

function getLocalProfilePhoto() {
  let value = lsGet(PROFILE_PHOTO_KEY, null);
  if (!value) {
    try {
      const raw = localStorage.getItem(PROFILE_PHOTO_KEY);
      value = raw && !raw.startsWith('"') ? raw : null;
    } catch (err) {
      console.warn('[DataService]', err?.message || err);
    }
  }
  if (!value || typeof value !== 'string') return null;
  if (value.startsWith('data:')) return value;

  const expiresAt = Number(lsGet(PROFILE_PHOTO_EXPIRY_KEY, 0));
  if (expiresAt > Date.now() + 30_000) return value;
  lsRemove(PROFILE_PHOTO_KEY);
  lsRemove(PROFILE_PHOTO_EXPIRY_KEY);
  return null;
}

function cacheProfilePhoto(userId, value, expiresAt = null) {
  profilePhotoCache = { userId: userId || 'local', value: value || null };
  if (!value) return;
  lsSet(PROFILE_PHOTO_KEY, value);
  if (expiresAt) lsSet(PROFILE_PHOTO_EXPIRY_KEY, expiresAt);
  else lsRemove(PROFILE_PHOTO_EXPIRY_KEY);
}

function clearProfilePhotoCache() {
  profilePhotoCache = null;
  profilePhotoRequest = null;
}

function normalizeWaterLog(entry) {
  if (typeof entry === 'string') {
    return { date: entry, glasses: 8, target_met: true };
  }
  if (!entry || typeof entry !== 'object') return null;
  const date = entry.date || entry.created_at?.slice?.(0, 10);
  if (!date) return null;
  const glasses = Number(entry.glasses ?? entry.amount ?? 0) || 0;
  return {
    ...entry,
    date,
    glasses,
    target_met: Boolean(entry.target_met ?? entry.targetMet ?? glasses >= 8),
  };
}

function getLocalWaterHistory() {
  return lsGet('shredmatrix_water_history', [])
    .map(normalizeWaterLog)
    .filter(Boolean);
}

function setLocalWaterHistoryEntry(date, glasses, targetMet) {
  const history = getLocalWaterHistory();
  const nextEntry = { date, glasses, target_met: targetMet };
  const idx = history.findIndex((entry) => entry.date === date);
  if (idx >= 0) history[idx] = { ...history[idx], ...nextEntry };
  else history.push(nextEntry);
  history.sort((a, b) => b.date.localeCompare(a.date));
  lsSet('shredmatrix_water_history', history);
}

function getUserId() {
  return isSupabaseReady() ? activeUserId : null;
}

const ACQUISITION_FIELDS = [
  'acquisition_source', 'acquisition_medium', 'acquisition_campaign',
  'acquisition_content', 'acquisition_term', 'landing_path',
  'app_language', 'browser_locale', 'time_zone',
];
const FIRST_TOUCH_FIELDS = [
  'acquisition_source', 'acquisition_medium', 'acquisition_campaign',
  'acquisition_content', 'acquisition_term', 'landing_path',
];

async function syncAcquisitionProfile(userId, language) {
  if (!isSupabaseReady() || !userId) return;
  try {
    const context = getAcquisitionContext(language);
    const { data, error } = await supabase
      .from('profiles')
      .select(`${ACQUISITION_FIELDS.join(',')},created_at`)
      .eq('id', userId)
      .single();
    if (error || !data) return;

    const profileAge = Date.now() - new Date(data.created_at || 0).getTime();
    const isNewProfile = Number.isFinite(profileAge) && profileAge < 86_400_000;
    const missing = Object.fromEntries(ACQUISITION_FIELDS
      .filter((field) => !data[field] && context[field])
      .filter((field) => isNewProfile || !FIRST_TOUCH_FIELDS.includes(field))
      .map((field) => [field, context[field]]));
    if (Object.keys(missing).length > 0) {
      await supabase.from('profiles').update(missing).eq('id', userId);
    }
  } catch (err) {
    console.warn('[Acquisition]', err?.message || err);
  }
}

// ══════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════

export async function signUp(email, password, name, language) {
  if (!isSupabaseReady()) {
    throw new Error('Authentication service unavailable. Please try again later.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, ...getAcquisitionContext(language) } },
  });
  if (error) throw error;
  activeUserId = data.session?.user?.id || null;
  return { user: data.user, session: data.session };
}

export async function signIn(email, password) {
  if (!isSupabaseReady()) {
    throw new Error('Authentication service unavailable. Please try again later.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  activeUserId = data.session?.user?.id || data.user?.id || null;
  syncAcquisitionProfile(activeUserId);
  return { user: data.user, session: data.session };
}

export async function resetPassword(email) {
  if (!isSupabaseReady()) {
    throw new Error('Authentication service unavailable. Please try again later.');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getRedirectOrigin()}/auth`,
  });
  if (error) throw error;
}

export async function signOut() {
  if (isSupabaseReady()) {
    await supabase.auth.signOut();
  }
  activeUserId = null;
  clearProfilePhotoCache();
  lsRemove('shredmatrix_session');
}

/**
 * Get the correct origin for OAuth redirects.
 * In production, always use the production URL to avoid localhost redirects.
 * This fixes the issue where PWA/Safari standalone mode returns wrong origin.
 */
function getRedirectOrigin() {
  const origin = window.location.origin;
  // If running on localhost/dev, still use localhost (developer testing)
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return origin;
  }
  // In production, use actual origin
  return origin;
}

export async function signInWithGoogle() {
  if (!isSupabaseReady()) {
    throw new Error('Authentication service unavailable. Please try again later.');
  }

  const redirectUrl = `${getRedirectOrigin()}/auth`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });
  if (error) throw error;
}

export async function getSession() {
  if (!isSupabaseReady()) return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    activeUserId = null;
    return null;
  }
  activeUserId = session.user.id;
  syncAcquisitionProfile(activeUserId);
  return {
    user: {
      id: session.user.id,
      name: session.user.user_metadata?.name || 'User',
      email: session.user.email,
    },
    session,
  };
}

export function onAuthStateChange(callback) {
  if (!isSupabaseReady()) return { unsubscribe: () => {} };

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    // Only react to actual sign-in/sign-out events, not token refreshes or initial session
    if (event === 'SIGNED_IN' && session) {
      activeUserId = session.user.id;
      syncAcquisitionProfile(activeUserId);
      callback('SIGNED_IN', {
        id: session.user.id,
        name: session.user.user_metadata?.name || 'User',
        email: session.user.email,
      });
    } else if (event === 'SIGNED_OUT') {
      activeUserId = null;
      callback('SIGNED_OUT', null);
    }
    // Ignore: INITIAL_SESSION, TOKEN_REFRESHED, USER_UPDATED, PASSWORD_RECOVERY
  });

  return subscription;
}

// ══════════════════════════════════════════════
// PLAN
// ══════════════════════════════════════════════

export async function savePlan(planData, email) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    lsSet(`shredmatrix_plan_${email}`, planData);
    lsSet('shredmatrix_plan_created', new Date().toISOString());
    return;
  }

  try {
    const { error } = await supabase
      .from('plans')
      .upsert({ user_id: userId, plan_data: planData }, { onConflict: 'user_id' });
    if (error) throw error;

    // Update profile
    await supabase.from('profiles').update({
      plan_created_at: new Date().toISOString(),
    }).eq('id', userId);
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    // Fallback to localStorage
    lsSet(`shredmatrix_plan_${email}`, planData);
    lsSet('shredmatrix_plan_created', new Date().toISOString());
  }
}

export async function loadPlan(email) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    return lsGet(`shredmatrix_plan_${email}`);
  }

  try {
    const { data, error } = await supabase
      .from('plans')
      .select('plan_data')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data?.plan_data || lsGet(`shredmatrix_plan_${email}`) || null;
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    return lsGet(`shredmatrix_plan_${email}`) || null;
  }
}

// ══════════════════════════════════════════════
// WORKOUT LOG
// ══════════════════════════════════════════════

export async function saveWorkoutLog(log) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    const logs = lsGet('shredmatrix_workout_log', []);
    const savedLog = { ...log, id: log.id || crypto.randomUUID() };
    logs.push(savedLog);
    lsSet('shredmatrix_workout_log', logs);
    return savedLog;
  }

  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .insert({ user_id: userId, date: log.date, day_focus: log.focus || log.day_focus, exercises: log.exercises, notes: log.notes })
      .select('*')
      .single();
    if (error) throw error;
    // Fire-and-forget: update leaderboard in background
    updateLeaderboardScore().catch(() => {});
    return data;
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    throw err;
  }
}

export async function saveWorkoutFeedback({
  id,
  date,
  dayFocus,
  perceivedExertion,
  painReported,
  energyAfter,
  sessionDurationMinutes,
  adaptationAction = 'maintain',
}) {
  const feedback = {
    perceived_exertion: Number(perceivedExertion),
    pain_reported: Boolean(painReported),
    energy_after: Number(energyAfter),
    session_duration_minutes: Number(sessionDurationMinutes),
    adaptation_action: adaptationAction,
    feedback_at: new Date().toISOString(),
  };
  if (![1, 2, 3].includes(feedback.perceived_exertion)) {
    throw new Error('Invalid workout effort feedback');
  }
  if (![1, 2, 3].includes(feedback.energy_after)) {
    throw new Error('Invalid post-workout energy feedback');
  }
  if (!Number.isInteger(feedback.session_duration_minutes)
    || feedback.session_duration_minutes < 1
    || feedback.session_duration_minutes > 600) {
    throw new Error('Invalid workout duration');
  }
  if (!['maintain', 'reduce', 'progress', 'hold'].includes(feedback.adaptation_action)) {
    throw new Error('Invalid workout adaptation');
  }

  const userId = getUserId();
  if (!isSupabaseReady() || !userId) {
    const logs = lsGet('shredmatrix_workout_log', []);
    const index = [...logs].reverse().findIndex((entry) => (
      (id && entry.id === id)
      || (!id && entry.date === date && (entry.dayFocus || entry.day_focus || entry.focus) === dayFocus)
    ));
    if (index < 0) throw new Error('Workout log not found');
    const actualIndex = logs.length - 1 - index;
    logs[actualIndex] = { ...logs[actualIndex], ...feedback };
    lsSet('shredmatrix_workout_log', logs);
    return logs[actualIndex];
  }

  let query = supabase.from('workout_logs').update(feedback).eq('user_id', userId);
  query = id
    ? query.eq('id', id)
    : query.eq('date', date).eq('day_focus', dayFocus);
  const { data, error } = await query.select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Workout log not found');
  return data;
}

export async function getWorkoutLogs(limit) {
  const userId = getUserId();
  const normalizedLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 365) : null;

  if (!isSupabaseReady() || !userId) {
    const logs = lsGet('shredmatrix_workout_log', []);
    return normalizedLimit ? logs.slice(-normalizedLimit).reverse() : logs;
  }

  try {
    let query = supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (normalizedLimit) query = query.limit(normalizedLimit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    const logs = lsGet('shredmatrix_workout_log', []);
    return normalizedLimit ? logs.slice(-normalizedLimit).reverse() : logs;
  }
}

// ══════════════════════════════════════════════
// RETENTION ACTIVITY
// ══════════════════════════════════════════════

export async function recordActivityDay() {
  const userId = getUserId();
  const activityDate = new Date().toISOString().slice(0, 10);
  if (!isSupabaseReady() || !userId) return false;

  const cacheKey = `fb_activity_recorded_${activityDate}`;
  try {
    if (localStorage.getItem(cacheKey) === userId) return true;
  } catch { /* Continue without cache. */ }

  const now = new Date().toISOString();
  const { error } = await supabase.from('user_activity_days').upsert({
    user_id: userId,
    activity_date: activityDate,
    last_seen_at: now,
  }, { onConflict: 'user_id,activity_date' });
  if (error) throw error;
  try { localStorage.setItem(cacheKey, userId); } catch { /* Optional cache. */ }
  return true;
}

const PRODUCT_STEP_COLUMNS = {
  today_viewed: 'today_viewed',
  workout_plan_viewed: 'workout_plan_viewed',
  workout_day_opened: 'workout_day_opened',
  workout_completed: 'workout_completed',
};

export async function recordProductStep(step) {
  const column = PRODUCT_STEP_COLUMNS[step];
  const userId = getUserId();
  const activityDate = new Date().toISOString().slice(0, 10);
  if (!column || !isSupabaseReady() || !userId) return false;

  const cacheKey = `fb_product_step_${activityDate}_${column}`;
  try {
    if (localStorage.getItem(cacheKey) === userId) return true;
  } catch { /* Continue without cache. */ }

  const { error } = await supabase.from('user_activity_days').upsert({
    user_id: userId,
    activity_date: activityDate,
    last_seen_at: new Date().toISOString(),
    [column]: true,
  }, { onConflict: 'user_id,activity_date' });
  if (error) throw error;
  try { localStorage.setItem(cacheKey, userId); } catch { /* Optional cache. */ }
  return true;
}

// ══════════════════════════════════════════════
// USER STORIES
// ══════════════════════════════════════════════

export async function submitTestimonial({ rating, body, resultSummary, language = 'en', consentPublic }) {
  const userId = getUserId();
  if (!isSupabaseReady() || !userId) throw new Error('Sign in required');
  const payload = {
    user_id: userId,
    rating: Math.max(1, Math.min(5, Math.round(Number(rating)))),
    body: String(body || '').trim().slice(0, 600),
    result_summary: String(resultSummary || '').trim().slice(0, 180) || null,
    language: ['tr', 'en', 'es'].includes(language) ? language : 'en',
    consent_public: Boolean(consentPublic),
    status: 'pending',
  };
  if (payload.body.length < 30 || !payload.consent_public) throw new Error('Invalid testimonial');
  const { data, error } = await supabase.from('testimonials').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function getApprovedTestimonials(limit = 6) {
  if (!isSupabaseReady()) return [];
  const { data, error } = await supabase
    .from('testimonials')
    .select('id, rating, body, result_summary, language, created_at')
    .eq('status', 'approved')
    .eq('consent_public', true)
    .order('created_at', { ascending: false })
    .limit(Math.max(1, Math.min(12, limit)));
  if (error) return [];
  return data || [];
}

export async function hasSubmittedTestimonial() {
  const userId = getUserId();
  if (!isSupabaseReady() || !userId) return false;
  const { data, error } = await supabase
    .from('testimonials')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

// ══════════════════════════════════════════════
// PROGRESS (Weight + Body Fat)
// ══════════════════════════════════════════════

export async function saveProgress(entry) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    const entries = lsGet('shredmatrix_progress', []);
    entries.push(entry);
    lsSet('shredmatrix_progress', entries);
    return;
  }

  try {
    const { error } = await supabase
      .from('progress_entries')
      .insert({ user_id: userId, date: entry.date, weight: entry.weight, body_fat: entry.bodyFat || entry.body_fat });
    if (error) throw error;
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    const entries = lsGet('shredmatrix_progress', []);
    entries.push(entry);
    lsSet('shredmatrix_progress', entries);
  }
}

export async function getProgress() {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    return lsGet('shredmatrix_progress', []);
  }

  try {
    const { data, error } = await supabase
      .from('progress_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    return lsGet('shredmatrix_progress', []);
  }
}

export async function deleteProgress(dateToDelete) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    const entries = lsGet('shredmatrix_progress', []);
    lsSet('shredmatrix_progress', entries.filter(e => e.date !== dateToDelete));
    return;
  }

  try {
    const { error } = await supabase
      .from('progress_entries')
      .delete()
      .eq('user_id', userId)
      .eq('date', dateToDelete);
    if (error) throw error;
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    const entries = lsGet('shredmatrix_progress', []);
    lsSet('shredmatrix_progress', entries.filter(e => e.date !== dateToDelete));
  }
}

// ══════════════════════════════════════════════
// MEASUREMENTS
// ══════════════════════════════════════════════

export async function saveMeasurement(entry) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    const entries = lsGet('shredmatrix_measurements', []);
    entries.push(entry);
    lsSet('shredmatrix_measurements', entries);
    return;
  }

  try {
    const { error } = await supabase
      .from('measurements')
      .insert({ user_id: userId, ...entry });
    if (error) throw error;
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    const entries = lsGet('shredmatrix_measurements', []);
    entries.push(entry);
    lsSet('shredmatrix_measurements', entries);
  }
}

export async function getMeasurements() {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    return lsGet('shredmatrix_measurements', []);
  }

  try {
    const { data, error } = await supabase
      .from('measurements')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    return lsGet('shredmatrix_measurements', []);
  }
}

export async function deleteMeasurement(dateToDelete) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    const entries = lsGet('shredmatrix_measurements', []);
    lsSet('shredmatrix_measurements', entries.filter(e => e.date !== dateToDelete));
    return;
  }

  try {
    const { error } = await supabase
      .from('measurements')
      .delete()
      .eq('user_id', userId)
      .eq('date', dateToDelete);
    if (error) throw error;
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    const entries = lsGet('shredmatrix_measurements', []);
    lsSet('shredmatrix_measurements', entries.filter(e => e.date !== dateToDelete));
  }
}

// ══════════════════════════════════════════════
// WATER
// ══════════════════════════════════════════════

export async function saveWater(date, glasses, targetMet = false) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    lsSet('shredmatrix_water', { date, glasses });
    setLocalWaterHistoryEntry(date, glasses, targetMet);
    return;
  }

  try {
    const { error } = await supabase
      .from('water_logs')
      .upsert({ user_id: userId, date, glasses, target_met: targetMet }, { onConflict: 'user_id,date' });
    if (error) throw error;
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    // Fallback to localStorage if table doesn't exist
    lsSet('shredmatrix_water', { date, glasses });
    setLocalWaterHistoryEntry(date, glasses, targetMet);
  }
}

export async function getWater(date) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    const data = lsGet('shredmatrix_water');
    if (data?.date === date) return data;
    return { date, glasses: 0 };
  }

  try {
    const { data, error } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || { date, glasses: 0 };
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    // Table may not exist — fallback to localStorage
    const data = lsGet('shredmatrix_water');
    if (data?.date === date) return data;
    return { date, glasses: 0 };
  }
}

export async function getWaterHistory(limit = 30) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    return getLocalWaterHistory().slice(0, limit);
  }

  try {
    const { data, error } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(normalizeWaterLog).filter(Boolean);
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    return getLocalWaterHistory().slice(0, limit);
  }
}

// ══════════════════════════════════════════════
// SLEEP
// ══════════════════════════════════════════════

export async function saveSleep(date, hours) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    const entries = lsGet('shredmatrix_sleep', []);
    const idx = entries.findIndex(e => e.date === date);
    if (idx >= 0) entries[idx].hours = hours;
    else entries.push({ date, hours });
    lsSet('shredmatrix_sleep', entries);
    return;
  }

  try {
    const { error } = await supabase
      .from('sleep_logs')
      .upsert({ user_id: userId, date, hours }, { onConflict: 'user_id,date' });
    if (error) throw error;
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    const entries = lsGet('shredmatrix_sleep', []);
    const idx = entries.findIndex(e => e.date === date);
    if (idx >= 0) entries[idx].hours = hours;
    else entries.push({ date, hours });
    lsSet('shredmatrix_sleep', entries);
  }
}

export async function getSleep(limit = 30) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    return lsGet('shredmatrix_sleep', []);
  }

  try {
    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    return lsGet('shredmatrix_sleep', []);
  }
}

// ══════════════════════════════════════════════
// WELLBEING CHECK-INS
// ══════════════════════════════════════════════

const WELLBEING_STORAGE_KEY = 'fullbalance_wellbeing_checkins';

function saveLocalWellbeingCheckin(entry) {
  const entries = lsGet(WELLBEING_STORAGE_KEY, []);
  const index = entries.findIndex((item) => item.date === entry.date);
  if (index >= 0) entries[index] = { ...entries[index], ...entry };
  else entries.push(entry);
  entries.sort((a, b) => b.date.localeCompare(a.date));
  lsSet(WELLBEING_STORAGE_KEY, entries.slice(0, 90));
}

export async function saveWellbeingCheckin({ date, energy, nutritionAligned }) {
  const normalized = {
    date,
    energy: Math.max(1, Math.min(3, Math.round(Number(energy) || 2))),
    nutrition_aligned: Boolean(nutritionAligned),
  };
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    saveLocalWellbeingCheckin(normalized);
    return normalized;
  }

  try {
    const { data, error } = await supabase
      .from('wellbeing_checkins')
      .upsert({ user_id: userId, ...normalized, updated_at: new Date().toISOString() }, { onConflict: 'user_id,date' })
      .select('date, energy, nutrition_aligned')
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    saveLocalWellbeingCheckin(normalized);
    return normalized;
  }
}

export async function getWellbeingCheckins(limit = 30) {
  const userId = getUserId();
  if (!isSupabaseReady() || !userId) return lsGet(WELLBEING_STORAGE_KEY, []).slice(0, limit);

  try {
    const { data, error } = await supabase
      .from('wellbeing_checkins')
      .select('date, energy, nutrition_aligned')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(Math.min(Math.max(Number(limit) || 30, 1), 90));
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    return lsGet(WELLBEING_STORAGE_KEY, []).slice(0, limit);
  }
}

// ══════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════

export async function updateProfile(updates) {
  const userId = getUserId();
  if (!isSupabaseReady() || !userId) return;

  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    if (error) throw error;
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
  }
}

export async function getProfile() {
  const userId = getUserId();
  if (!isSupabaseReady() || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    return null;
  }
}

// ══════════════════════════════════════════════
// PHOTOS (Supabase Storage)
// ══════════════════════════════════════════════

export async function uploadPhoto(file, type = 'profile') {
  // Validate file
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('File too large. Maximum size is 5MB.');
  }

  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    // Fallback: store as base64 in localStorage
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'profile') {
          cacheProfilePhoto(userId, reader.result);
        } else {
          const photos = lsGet('shredmatrix_progress_photos', []);
          photos.push({ id: Date.now(), date: new Date().toISOString(), src: reader.result });
          lsSet('shredmatrix_progress_photos', photos);
        }
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const ext = file.name?.split('.').pop() || 'jpg';
  const path = `${userId}/${type}/${Date.now()}.${ext}`;

  try {
    const { error } = await supabase.storage
      .from('user-photos')
      .upload(path, file, { cacheControl: '3600', upsert: type === 'profile' });
    if (error) throw error;

    const { data, error: urlError } = await supabase.storage
      .from('user-photos')
      .createSignedUrl(path, 3600);
    if (urlError) throw urlError;

    if (type === 'profile') {
      await updateProfile({ avatar_url: path });
      cacheProfilePhoto(userId, data.signedUrl, Date.now() + 55 * 60 * 1000);
    }

    return data.signedUrl;
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    // Fallback: store as base64 in localStorage
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'profile') {
          cacheProfilePhoto(userId, reader.result);
        } else {
          const photos = lsGet('shredmatrix_progress_photos', []);
          photos.push({ id: Date.now(), date: new Date().toISOString(), src: reader.result });
          lsSet('shredmatrix_progress_photos', photos);
        }
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export async function getProfilePhoto() {
  const userId = getUserId();
  const cacheKey = userId || 'local';

  if (profilePhotoCache?.userId === cacheKey) return profilePhotoCache.value;
  if (profilePhotoRequest?.userId === cacheKey) return profilePhotoRequest.promise;

  if (!isSupabaseReady() || !userId) {
    const localPhoto = getLocalProfilePhoto();
    profilePhotoCache = { userId: cacheKey, value: localPhoto };
    return localPhoto;
  }

  const promise = (async () => {
    try {
      const profile = await getProfile();
      if (!profile?.avatar_url) {
        const localPhoto = getLocalProfilePhoto();
        profilePhotoCache = { userId: cacheKey, value: localPhoto };
        return localPhoto;
      }
      const { data, error } = await supabase.storage
        .from('user-photos')
        .createSignedUrl(profile.avatar_url, 3600);
      if (error) throw error;
      const photo = data?.signedUrl || null;
      cacheProfilePhoto(userId, photo, Date.now() + 55 * 60 * 1000);
      return photo;
    } catch (err) {
      console.warn('[DataService]', err?.message || err);
      const localPhoto = getLocalProfilePhoto();
      profilePhotoCache = { userId: cacheKey, value: localPhoto };
      return localPhoto;
    }
  })();

  profilePhotoRequest = { userId: cacheKey, promise };
  try {
    return await promise;
  } finally {
    if (profilePhotoRequest?.promise === promise) profilePhotoRequest = null;
  }
}

export async function preloadProfilePhoto() {
  const photo = await getProfilePhoto();
  if (!photo || typeof Image === 'undefined') return photo;

  await new Promise((resolve) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = resolve;
    image.src = photo;
    if (image.complete) resolve();
  });
  return photo;
}

export async function getProgressPhotos() {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    return lsGet('shredmatrix_progress_photos', []);
  }

  const { data, error } = await supabase.storage
    .from('user-photos')
    .list(`${userId}/progress`, { sortBy: { column: 'created_at', order: 'desc' } });
  if (error) return [];

  return await Promise.all((data || []).map(async (f) => {
    const { data: urlData } = await supabase.storage
      .from('user-photos')
      .createSignedUrl(`${userId}/progress/${f.name}`, 3600);
    return {
      id: f.id,
      name: f.name,
      date: f.created_at,
      src: urlData?.signedUrl || '',
    };
  }));
}

export async function deleteProgressPhoto(photoName) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    // localStorage fallback: filter by name or id
    const photos = lsGet('shredmatrix_progress_photos', []);
    const filtered = photos.filter((p) => p.name !== photoName && String(p.id) !== String(photoName));
    lsSet('shredmatrix_progress_photos', filtered);
    return filtered;
  }

  try {
    const path = `${userId}/progress/${photoName}`;
    const { error } = await supabase.storage
      .from('user-photos')
      .remove([path]);
    if (error) throw error;
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    // If supabase delete fails, still update localStorage
    const photos = lsGet('shredmatrix_progress_photos', []);
    const filtered = photos.filter((p) => p.name !== photoName);
    lsSet('shredmatrix_progress_photos', filtered);
  }

  // Return updated list
  return getProgressPhotos();
}

// ══════════════════════════════════════════════
// PHASE MANAGEMENT
// ══════════════════════════════════════════════

export async function updatePhase(newPhase) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    localStorage.setItem('shredmatrix_current_phase', String(newPhase));
    localStorage.setItem('shredmatrix_plan_created', new Date().toISOString());
    return;
  }

  try {
    await supabase.from('profiles').update({
      current_phase: newPhase,
      plan_created_at: new Date().toISOString(),
    }).eq('id', userId);
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    localStorage.setItem('shredmatrix_current_phase', String(newPhase));
    localStorage.setItem('shredmatrix_plan_created', new Date().toISOString());
  }
}

export async function getCurrentPhase() {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    return parseInt(localStorage.getItem('shredmatrix_current_phase') || '0', 10);
  }

  const profile = await getProfile();
  return profile?.current_phase || 0;
}

export async function getPlanCreatedAt() {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    return localStorage.getItem('shredmatrix_plan_created');
  }

  const profile = await getProfile();
  return profile?.plan_created_at;
}

// ══════════════════════════════════════════════
// FIRST LOGIN
// ══════════════════════════════════════════════

export async function getFirstLogin() {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    return localStorage.getItem('shredmatrix_first_login');
  }

  const profile = await getProfile();
  return profile?.first_login_at;
}

// ══════════════════════════════════════════════
// DELETE ALL USER DATA
// ══════════════════════════════════════════════

export async function deleteAllUserData(email) {
  const userId = getUserId();

  if (isSupabaseReady() && userId) {
    const { data, error } = await supabase.functions.invoke('delete-account');
    if (error) throw new Error(error.message || 'Account could not be deleted.');
    if (!data?.ok) throw new Error(data?.error || 'Account could not be deleted.');
  }

  // Clear local state only after the server confirms deletion.
  const allKeys = [
    'shredmatrix_session', `shredmatrix_plan_${email}`,
    'shredmatrix_progress', 'shredmatrix_water', 'shredmatrix_water_history',
    'shredmatrix_workout_log', 'shredmatrix_measurements', 'shredmatrix_sleep',
    'shredmatrix_profile_photo', 'shredmatrix_progress_photos',
    PROFILE_PHOTO_EXPIRY_KEY,
    'shredmatrix_reminder', 'shredmatrix_current_phase', 'shredmatrix_plan_created',
    'shredmatrix_first_login', `shredmatrix_tour_seen_${email}`,
    'shredmatrix_install_dismissed', 'shredmatrix_trainer_invite',
    'shredmatrix_trainer_connections',
  ];
  allKeys.forEach(k => lsRemove(k));
  clearProfilePhotoCache();

  // Remove from users list
  const users = lsGet('shredmatrix_users', []);
  const filtered = users.filter(u => u.email !== email);
  lsSet('shredmatrix_users', filtered);
  activeUserId = null;
}

// ══════════════════════════════════════════════
// LEADERBOARD
// ══════════════════════════════════════════════

/**
 * Update the user's leaderboard score for the current week.
 * Called automatically after saving a workout log.
 */
export async function updateLeaderboardScore() {
  if (!isSupabaseReady()) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get current week start (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const weekStart = monday.toISOString().split('T')[0];
    const weekEnd = new Date(monday);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Count workouts this week
    const { data: logs } = await supabase
      .from('workout_logs')
      .select('id')
      .eq('user_id', user.id)
      .gte('date', weekStart)
      .lt('date', weekEnd.toISOString().split('T')[0]);

    const workouts = logs?.length || 0;

    // Get display name from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    // Anonymize: first name + last initial
    const fullName = profile?.name || 'User';
    const parts = fullName.trim().split(' ');
    const displayName = parts.length > 1
      ? `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`
      : parts[0];

    // Calculate streak (consecutive days with workouts)
    const { data: allLogs } = await supabase
      .from('workout_logs')
      .select('date')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(60);

    let streak = 0;
    if (allLogs?.length) {
      const dates = [...new Set(allLogs.map(l => l.date))].sort().reverse();
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (dates[0] === today || dates[0] === yesterday) {
        streak = 1;
        for (let i = 1; i < dates.length; i++) {
          const prev = new Date(dates[i - 1]);
          const curr = new Date(dates[i]);
          const diff = (prev - curr) / 86400000;
          if (diff <= 1) streak++;
          else break;
        }
      }
    }

    // Simple balance score (0-100)
    const score = Math.min(100, Math.round(workouts * 12 + streak * 2));

    // Upsert to leaderboard
    await supabase
      .from('leaderboard_scores')
      .upsert({
        user_id: user.id,
        display_name: displayName,
        week_start: weekStart,
        workouts,
        streak,
        score,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,week_start',
      });

  } catch (err) {
    // Silent fail — leaderboard is not critical
    console.warn('[Leaderboard]', err?.message || err);
  }
}

// ══════════════════════════════════════════════

// ══════════════════════════════════════════════
// REFERRALS
// ══════════════════════════════════════════════

const LOCAL_REFERRAL_KEY = 'fb_referral_code';

function localReferralCode() {
  try {
    let code = localStorage.getItem(LOCAL_REFERRAL_KEY);
    if (!code || !/^[A-Z0-9]{4,16}$/.test(code)) {
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      code = 'FB';
      for (let i = 0; i < 6; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
      localStorage.setItem(LOCAL_REFERRAL_KEY, code);
    }
    return code;
  } catch {
    return '';
  }
}

/**
 * Invite code plus aggregate counts for the signed-in member.
 * Falls back to a device-local code when Supabase is unavailable so the
 * invite card keeps working; server counts stay at zero in that mode.
 */
export async function getReferralSummary() {
  if (!isSupabaseReady() || !getUserId()) {
    return { code: localReferralCode(), invited: 0, activated: 0, local: true };
  }
  const { data, error } = await supabase.rpc('get_referral_summary');
  if (error) throw error;
  const summary = data && typeof data === 'object' ? data : {};
  const code = typeof summary.code === 'string' && /^[A-Z0-9]{4,16}$/.test(summary.code) ? summary.code : localReferralCode();
  try { localStorage.setItem(LOCAL_REFERRAL_KEY, code); } catch { /* Optional cache. */ }
  return {
    code,
    invited: Number(summary.invited) || 0,
    activated: Number(summary.activated) || 0,
    local: false,
  };
}

// ══════════════════════════════════════════════
// STREAK FREEZES
// ══════════════════════════════════════════════

const STREAK_FREEZE_KEY = 'fb_streak_freezes';

export async function getStreakFreezes(limit = 60) {
  const userId = getUserId();
  if (!isSupabaseReady() || !userId) return lsGet(STREAK_FREEZE_KEY, []).slice(0, limit);

  try {
    const { data, error } = await supabase
      .from('streak_freezes')
      .select('date, source')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(Math.min(Math.max(Number(limit) || 60, 1), 200));
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    return lsGet(STREAK_FREEZE_KEY, []).slice(0, limit);
  }
}

export async function saveStreakFreeze(date, source = 'weekly') {
  const normalized = {
    date: String(date || '').slice(0, 10),
    source: source === 'referral' ? 'referral' : 'weekly',
  };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized.date)) throw new Error('invalid_date');

  const persistLocally = () => {
    const list = lsGet(STREAK_FREEZE_KEY, []).filter((entry) => entry?.date !== normalized.date);
    list.unshift(normalized);
    lsSet(STREAK_FREEZE_KEY, list.slice(0, 200));
    return normalized;
  };

  const userId = getUserId();
  if (!isSupabaseReady() || !userId) return persistLocally();

  try {
    const { data, error } = await supabase
      .from('streak_freezes')
      .upsert({ user_id: userId, ...normalized }, { onConflict: 'user_id,date' })
      .select('date, source')
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    return persistLocally();
  }
}

// ══════════════════════════════════════════════
// DAILY COMMITMENT (reminder hour)
// ══════════════════════════════════════════════

const REMINDER_HOUR_KEY = 'fb_reminder_hour';

export function getLocalReminderHour() {
  const value = Number(lsGet(REMINDER_HOUR_KEY, null));
  return Number.isInteger(value) && value >= 7 && value <= 21 ? value : null;
}

/** Aligns the daily push reminder with the hour the member committed to. */
export async function updateReminderHour(hour) {
  const safeHour = Math.max(7, Math.min(21, Math.round(Number(hour) || 9)));
  lsSet(REMINDER_HOUR_KEY, safeHour);
  const userId = getUserId();
  if (!isSupabaseReady() || !userId) return safeHour;

  try {
    const { error } = await supabase
      .from('push_subscriptions')
      .update({ notification_hour: safeHour, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    if (error) throw error;
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
  }
  return safeHour;
}
