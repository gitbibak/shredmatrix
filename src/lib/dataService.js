import { supabase, isSupabaseReady } from './supabase';

// ══════════════════════════════════════════════
// ShredMatrix — Data Service Layer
// Hybrid: Supabase (primary) + localStorage (fallback)
// ══════════════════════════════════════════════

// ── Helpers ──────────────────────────────────

const LOCAL_AUTH_ALLOWED = import.meta.env.DEV;
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PHOTO_EXTENSION_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
let currentUserId = null;

function lsGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch { return fallback; }
}

function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

function lsRemove(key) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

function getUserId() {
  if (currentUserId) return currentUserId;
  if (!isSupabaseReady()) return null;
  // Supabase stores session, we can read it synchronously from localStorage cache
  try {
    const sessionStr = localStorage.getItem('sb-' + import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      return session?.user?.id || session?.currentSession?.user?.id || null;
    }
  } catch { /* ignore */ }
  return null;
}

function normalizeUser(user, fallbackName = 'User') {
  if (!user) return null;
  return {
    id: user.id,
    name: user.user_metadata?.name || fallbackName,
    email: user.email,
  };
}

function getLocalSession() {
  const session = lsGet('shredmatrix_session');
  if (!session) return null;
  if (!LOCAL_AUTH_ALLOWED && session.isLocalTest) {
    lsRemove('shredmatrix_session');
    return null;
  }
  return session;
}

function assertLocalAuthAllowed() {
  if (!LOCAL_AUTH_ALLOWED) {
    throw new Error('auth.errors.supabaseRequired');
  }
}

function validatePhoto(file) {
  if (!file) throw new Error('profile.errors.photoRequired');
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    throw new Error('profile.errors.photoType');
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    throw new Error('profile.errors.photoSize');
  }
}

// ══════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════

export async function signUp(email, password, name) {
  if (!isSupabaseReady()) {
    throw new Error('auth.errors.supabaseRequired');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  if (!data.session) throw new Error('auth.errors.emailConfirmationRequired');
  currentUserId = data.user?.id || null;
  return { user: normalizeUser(data.user, name), session: data.session };
}

export async function signIn(email, password) {
  if (!isSupabaseReady()) {
    throw new Error('auth.errors.supabaseRequired');
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  currentUserId = data.user?.id || null;
  return { user: normalizeUser(data.user), session: data.session };
}

export async function signOut() {
  if (isSupabaseReady()) {
    await supabase.auth.signOut();
  }
  currentUserId = null;
  lsRemove('shredmatrix_session');
}

export async function getSession() {
  const localSession = getLocalSession();
  if (localSession?.isLocalTest || (!isSupabaseReady() && localSession)) {
    return { user: localSession, isLocal: true };
  }

  if (!isSupabaseReady()) {
    return null;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  currentUserId = session.user.id;
  return {
    user: normalizeUser(session.user),
    session,
  };
}

export function onAuthStateChange(callback) {
  if (!isSupabaseReady()) return { unsubscribe: () => {} };

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      currentUserId = session.user.id;
      callback('SIGNED_IN', normalizeUser(session.user));
    } else {
      currentUserId = null;
      callback('SIGNED_OUT', null);
    }
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

  const { error } = await supabase
    .from('plans')
    .upsert({ user_id: userId, plan_data: planData }, { onConflict: 'user_id' });
  if (error) throw error;

  // Update profile
  await supabase.from('profiles').update({
    plan_created_at: new Date().toISOString(),
  }).eq('id', userId);
}

export async function loadPlan(email) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    return lsGet(`shredmatrix_plan_${email}`);
  }

  const { data, error } = await supabase
    .from('plans')
    .select('plan_data')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data?.plan_data || null;
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

  const { error } = await supabase
    .from('workout_logs')
    .insert({ user_id: userId, date: log.date, day_focus: log.focus || log.day_focus, exercises: log.exercises, notes: log.notes });
  if (error) throw error;
}

export async function getWorkoutLogs() {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    return lsGet('shredmatrix_workout_log', []);
  }

  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data || [];
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

  const { error } = await supabase
    .from('progress_entries')
    .insert({ user_id: userId, date: entry.date, weight: entry.weight, body_fat: entry.bodyFat || entry.body_fat });
  if (error) throw error;
}

export async function getProgress() {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    return lsGet('shredmatrix_progress', []);
  }

  const { data, error } = await supabase
    .from('progress_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  if (error) throw error;
  return data || [];
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

  const { error } = await supabase
    .from('measurements')
    .insert({ user_id: userId, ...entry });
  if (error) throw error;
}

export async function getMeasurements() {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    return lsGet('shredmatrix_measurements', []);
  }

  const { data, error } = await supabase
    .from('measurements')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  if (error) throw error;
  return data || [];
}

// ══════════════════════════════════════════════
// WATER
// ══════════════════════════════════════════════

export async function saveWater(date, glasses, targetMet = false) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    lsSet('shredmatrix_water', { date, glasses });
    // Also write to water_history for achievements
    if (targetMet) {
      const history = lsGet('shredmatrix_water_history', []);
      if (!history.includes(date)) {
        history.push(date);
        lsSet('shredmatrix_water_history', history);
      }
    }
    return;
  }

  const { error } = await supabase
    .from('water_logs')
    .upsert({ user_id: userId, date, glasses, target_met: targetMet }, { onConflict: 'user_id,date' });
  if (error) throw error;
}

export async function getWater(date) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    const data = lsGet('shredmatrix_water');
    if (data?.date === date) return data;
    return { date, glasses: 0 };
  }

  const { data, error } = await supabase
    .from('water_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || { date, glasses: 0 };
}

export async function getWaterHistory(limit = 30) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    return lsGet('shredmatrix_water_history', []);
  }

  const { data, error } = await supabase
    .from('water_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
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

  const { error } = await supabase
    .from('sleep_logs')
    .upsert({ user_id: userId, date, hours }, { onConflict: 'user_id,date' });
  if (error) throw error;
}

export async function getSleep(limit = 30) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    return lsGet('shredmatrix_sleep', []);
  }

  const { data, error } = await supabase
    .from('sleep_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// ══════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════

export async function updateProfile(updates) {
  const userId = getUserId();
  if (!isSupabaseReady() || !userId) return;

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) throw error;
}

export async function getProfile() {
  const userId = getUserId();
  if (!isSupabaseReady() || !userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// ══════════════════════════════════════════════
// PHOTOS (Supabase Storage)
// ══════════════════════════════════════════════

export async function uploadPhoto(file, type = 'profile') {
  validatePhoto(file);
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

  const ext = PHOTO_EXTENSION_BY_TYPE[file.type] || 'jpg';
  const path = `${userId}/${type}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('user-photos')
    .upload(path, file, { cacheControl: '3600', upsert: type === 'profile' });
  if (error) throw error;

  const { data } = supabase.storage
    .from('user-photos')
    .getPublicUrl(path);

  if (type === 'profile') {
    await updateProfile({ avatar_url: path });
  }

  const { data: signed } = await supabase.storage
    .from('user-photos')
    .createSignedUrl(path, 60 * 60);

  return signed?.signedUrl || data.publicUrl;
}

export async function getProfilePhoto() {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    return lsGet('shredmatrix_profile_photo', null);
  }

  const profile = await getProfile();
  if (!profile?.avatar_url) return null;
  if (profile.avatar_url.startsWith('http')) return profile.avatar_url;

  const { data } = await supabase.storage
    .from('user-photos')
    .createSignedUrl(profile.avatar_url, 60 * 60);
  return data?.signedUrl || null;
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

  return Promise.all((data || []).map(async (f) => {
    const path = `${userId}/progress/${f.name}`;
    const { data: signed } = await supabase.storage
      .from('user-photos')
      .createSignedUrl(path, 60 * 60);
    return {
      id: f.id || path,
      name: f.name,
      date: f.created_at,
      src: signed?.signedUrl || '',
    };
  }));
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

  await supabase.from('profiles').update({
    current_phase: newPhase,
    plan_created_at: new Date().toISOString(),
  }).eq('id', userId);
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
    'shredmatrix_install_dismissed', 'shredmatrix_users',
  ];
  allKeys.forEach(k => lsRemove(k));

  if (!isSupabaseReady() || !userId) return;

  // Delete from all Supabase tables
  const tables = ['plans', 'workout_logs', 'progress_entries',
    'measurements', 'water_logs', 'sleep_logs', 'reminders'];
  for (const table of tables) {
    await supabase.from(table).delete().eq('user_id', userId);
  }

  // Delete storage files
  try {
    const prefixes = [`${userId}/profile`, `${userId}/progress`];
    for (const prefix of prefixes) {
      const { data: files } = await supabase.storage.from('user-photos').list(prefix, { limit: 100 });
      const paths = (files || []).map(f => `${prefix}/${f.name}`);
      if (paths.length) await supabase.storage.from('user-photos').remove(paths);
    }
  } catch { /* ignore storage errors */ }

  // Delete auth user when the hardening RPC is installed; fall back to profile delete.
  const { error: rpcError } = await supabase.rpc('delete_current_user');
  if (rpcError) {
    await supabase.from('profiles').delete().eq('id', userId);
  }
}

// ══════════════════════════════════════════════
// REMINDER
// ══════════════════════════════════════════════

export async function saveReminder(settings) {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    lsSet('shredmatrix_reminder', settings);
    return;
  }

  const { error } = await supabase
    .from('reminders')
    .upsert({ user_id: userId, ...settings }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function getReminder() {
  const userId = getUserId();

  if (!isSupabaseReady() || !userId) {
    return lsGet('shredmatrix_reminder', { enabled: false, hour: 9 });
  }

  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || { enabled: false, hour: 9 };
}
