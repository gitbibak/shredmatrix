import { supabase, isSupabaseReady } from './supabase';

// ══════════════════════════════════════════════
// Full Balance — Data Service Layer
// Hybrid: Supabase (primary) + localStorage (fallback)
// ══════════════════════════════════════════════

// ── Helpers ──────────────────────────────────

let activeUserId = null;

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

// ══════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════

export async function signUp(email, password, name) {
  if (!isSupabaseReady()) {
    throw new Error('Authentication service unavailable. Please try again later.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
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
    logs.push(log);
    lsSet('shredmatrix_workout_log', logs);
    return;
  }

  try {
    const { error } = await supabase
      .from('workout_logs')
      .insert({ user_id: userId, date: log.date, day_focus: log.focus || log.day_focus, exercises: log.exercises, notes: log.notes });
    if (error) throw error;
    // Fire-and-forget: update leaderboard in background
    updateLeaderboardScore().catch(() => {});
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    const logs = lsGet('shredmatrix_workout_log', []);
    logs.push(log);
    lsSet('shredmatrix_workout_log', logs);
  }
}

export async function getWorkoutLogs() {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    return lsGet('shredmatrix_workout_log', []);
  }

  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    return lsGet('shredmatrix_workout_log', []);
  }
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
// TRAINER / CLIENT CONNECTIONS
// ══════════════════════════════════════════════

function normalizeInviteCode(code) {
  return String(code || '').trim().toUpperCase();
}

function getLocalTrainerConnections() {
  return lsGet('shredmatrix_trainer_connections', []);
}

function setLocalTrainerConnections(connections) {
  lsSet('shredmatrix_trainer_connections', connections);
}

export async function createTrainerInvite() {
  if (!isSupabaseReady() || !getUserId()) {
    const code = `PT-${Math.random().toString(16).slice(2, 10).toUpperCase().padEnd(8, '0')}`;
    const invite = {
      code,
      expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
    };
    lsSet('shredmatrix_trainer_invite', invite);
    return invite;
  }

  const { data, error } = await supabase.rpc('create_trainer_invite');
  if (error) throw error;
  return data;
}

export async function connectTrainerByCode(code) {
  const normalizedCode = normalizeInviteCode(code);
  if (!normalizedCode) throw new Error('Invite code is required');

  if (!isSupabaseReady() || !getUserId()) {
    const invite = lsGet('shredmatrix_trainer_invite');
    if (normalizeInviteCode(invite?.code) !== normalizedCode) {
      throw new Error('Trainer invite code is invalid or expired');
    }
    const connection = {
      id: `local-${Date.now()}`,
      trainer_id: 'local-trainer',
      client_id: 'local-client',
      status: 'active',
      created_at: new Date().toISOString(),
      trainer: { name: 'Local Trainer' },
      client: { name: 'Local Client' },
    };
    const connections = getLocalTrainerConnections().filter((item) => item.trainer_id !== connection.trainer_id);
    connections.unshift(connection);
    setLocalTrainerConnections(connections);
    return { trainer_id: connection.trainer_id, trainer_name: connection.trainer.name };
  }

  const { data, error } = await supabase.rpc('connect_trainer_by_code', { invite_code: normalizedCode });
  if (error) {
    if (/own invite code/i.test(error.message || '')) {
      throw new Error('Bu kendi oluşturduğun kod. Bağlanmak için başka bir PT hesabından alınan kodu girmelisin.');
    }
    if (/invalid or expired/i.test(error.message || '')) {
      throw new Error('PT kodu geçersiz veya süresi dolmuş.');
    }
    throw error;
  }
  return data;
}

export async function getTrainerClients() {
  const userId = getUserId();
  if (!isSupabaseReady() || !userId) {
    return getLocalTrainerConnections();
  }

  const { data, error } = await supabase
    .from('trainer_clients')
    .select(`
      id,
      trainer_id,
      client_id,
      status,
      created_at,
      client:profiles!trainer_clients_client_id_fkey(id, name, email)
    `)
    .eq('trainer_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getMyTrainers() {
  const userId = getUserId();
  if (!isSupabaseReady() || !userId) {
    return getLocalTrainerConnections();
  }

  const { data, error } = await supabase
    .from('trainer_clients')
    .select(`
      id,
      trainer_id,
      client_id,
      status,
      created_at,
      trainer:profiles!trainer_clients_trainer_id_fkey(id, name, email)
    `)
    .eq('client_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function removeTrainerConnection(connectionId) {
  if (!connectionId) return;

  if (!isSupabaseReady() || !getUserId()) {
    setLocalTrainerConnections(getLocalTrainerConnections().filter((item) => item.id !== connectionId));
    return;
  }

  const { error } = await supabase
    .from('trainer_clients')
    .delete()
    .eq('id', connectionId);
  if (error) throw error;
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
          lsSet('shredmatrix_profile_photo', reader.result);
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
    }

    return data.signedUrl;
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    // Fallback: store as base64 in localStorage
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'profile') {
          lsSet('shredmatrix_profile_photo', reader.result);
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

  if (!isSupabaseReady() || !userId) {
    return lsGet('shredmatrix_profile_photo', null);
  }

  try {
    const profile = await getProfile();
    if (!profile?.avatar_url) return null;
    const { data } = await supabase.storage
      .from('user-photos')
      .createSignedUrl(profile.avatar_url, 3600);
    return data?.signedUrl || profile.avatar_url;
  } catch (err) {
    console.warn('[DataService]', err?.message || err);
    return lsGet('shredmatrix_profile_photo', null);
  }
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

async function listStorageFilesRecursive(prefix) {
  const files = [];
  const { data, error } = await supabase.storage.from('user-photos').list(prefix, { limit: 1000 });
  if (error) throw error;

  for (const item of data || []) {
    const path = `${prefix}/${item.name}`;
    if (item.id) {
      files.push(path);
    } else {
      files.push(...await listStorageFilesRecursive(path));
    }
  }

  return files;
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

export async function setFirstLogin() {
  const userId = getUserId();
  const now = new Date().toISOString();

  if (!isSupabaseReady() || !userId) {
    if (!localStorage.getItem('shredmatrix_first_login')) {
      localStorage.setItem('shredmatrix_first_login', now);
    }
    return;
  }

  // Profile trigger already sets first_login_at on signup
}

// ══════════════════════════════════════════════
// DELETE ALL USER DATA
// ══════════════════════════════════════════════

export async function deleteAllUserData(email) {
  const userId = getUserId();

  // Always clear localStorage
  const allKeys = [
    'shredmatrix_session', `shredmatrix_plan_${email}`,
    'shredmatrix_progress', 'shredmatrix_water', 'shredmatrix_water_history',
    'shredmatrix_workout_log', 'shredmatrix_measurements', 'shredmatrix_sleep',
    'shredmatrix_profile_photo', 'shredmatrix_progress_photos',
    'shredmatrix_reminder', 'shredmatrix_current_phase', 'shredmatrix_plan_created',
    'shredmatrix_first_login', `shredmatrix_tour_seen_${email}`,
    'shredmatrix_install_dismissed', 'shredmatrix_trainer_invite',
    'shredmatrix_trainer_connections',
  ];
  allKeys.forEach(k => lsRemove(k));

  // Remove from users list
  const users = lsGet('shredmatrix_users', []);
  const filtered = users.filter(u => u.email !== email);
  lsSet('shredmatrix_users', filtered);

  if (!isSupabaseReady() || !userId) return;

  // Delete from all Supabase tables (ignore errors for missing tables)
  const tables = ['plans', 'workout_logs', 'progress_entries',
    'measurements', 'water_logs', 'sleep_logs', 'reminders'];
  for (const table of tables) {
    try { await supabase.from(table).delete().eq('user_id', userId); } catch (err) { console.warn('[DataService]', err?.message || err); }
  }

  try { await supabase.from('trainer_invites').delete().eq('trainer_id', userId); } catch (err) { console.warn('[DataService]', err?.message || err); }
  try { await supabase.from('trainer_clients').delete().eq('trainer_id', userId); } catch (err) { console.warn('[DataService]', err?.message || err); }
  try { await supabase.from('trainer_clients').delete().eq('client_id', userId); } catch (err) { console.warn('[DataService]', err?.message || err); }

  // Delete storage files
  try {
    const files = await listStorageFilesRecursive(userId);
    if (files.length) await supabase.storage.from('user-photos').remove(files);
  } catch (err) { console.warn('[DataService]', err?.message || err); }

  // Delete profile (cascade will handle auth)
  try { await supabase.from('profiles').delete().eq('id', userId); } catch (err) { console.warn('[DataService]', err?.message || err); }

  // Delete auth user via RPC
  try {
    await supabase.rpc('delete_current_user');
  } catch (err) { console.warn('[DataService]', err?.message || err); }
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
