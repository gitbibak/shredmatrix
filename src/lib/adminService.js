import { supabase, isSupabaseReady } from './supabase';
import { utcDateKey } from './adminMetrics';

// ══════════════════════════════════════════════
// Admin Service — FullBalance Admin Panel
// Only accessible by admin role users
// ══════════════════════════════════════════════

export function isAdmin(user) {
  return user?.role === 'admin' || user?.app_metadata?.role === 'admin';
}

export async function verifyAdminAccess() {
  if (!isSupabaseReady()) return false;

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return false;
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();
    if (error) throw error;
    return data?.role === 'admin';
  } catch (err) {
    console.error('[Admin] Access verification error:', err);
    return false;
  }
}

// Read every page in a stable primary-key order instead of silently accepting
// the API's row limit. A changing count or overlapping page requires a refresh.
async function readAllAdminRows(table, columns, configure = (query) => query, keys = ['id']) {
  const pageSize = 500;
  const selected = columns.trim() === '*' ? '*' : [...new Set([...keys, ...columns.split(',').map((column) => column.trim())])].join(', ');
  const rows = [];
  const seen = new Set();
  let expectedCount;
  while (true) {
    let query = configure(supabase.from(table).select(selected, { count: 'exact' }));
    keys.forEach((key) => { query = query.order(key, { ascending: true }); });
    const { data, count, error } = await query.range(rows.length, rows.length + pageSize - 1);
    if (error) throw error;
    if (!Number.isInteger(count) || count < 0 || (expectedCount !== undefined && count !== expectedCount)) {
      throw new Error('Yönetim verileri yükleme sırasında değişti. Lütfen yeniden deneyin.');
    }
    expectedCount = count;
    const page = data || [];
    for (const row of page) {
      const identity = JSON.stringify(keys.map((key) => row[key]));
      if (keys.some((key) => row[key] == null) || seen.has(identity)) {
        throw new Error('Yönetim verileri tutarlı biçimde alınamadı. Lütfen yeniden deneyin.');
      }
      seen.add(identity);
      rows.push(row);
    }
    if (rows.length === expectedCount) return { data: rows };
    if (!page.length || rows.length > expectedCount) {
      throw new Error('Yönetim verileri eksik alındı. Lütfen yeniden deneyin.');
    }
  }
}


// ── Panel anlık görüntüsü ────────────────────────────────────
// Panelin bütün özetleri tek bir tutarlı okumadan hesaplanır (src/lib/adminMetrics.js).
// Plan JSON'unun tamamı yerine yalnızca gereken alanlar okunur; büyük plan
// belgelerini indirmek paneli yavaşlatıyordu.
export const ADMIN_EVENT_NAMES = Object.freeze([
  'meal_photo_analyzed', 'meal_photo_analysis_failed', 'sign_up_error', 'login_error',
  'affiliate_link_click', 'water_logged', 'sleep_logged', 'nutrition_logged',
  'meditation_completed', 'invite_sent',
]);

const PROFILE_COLUMNS = 'id, name, email, created_at, role, app_language, acquisition_source, acquisition_campaign, acquisition_content, landing_path, plan_created_at';
const PLAN_COLUMNS = 'user_id, goal:plan_data->>goal, primary_goal:plan_data->>primaryGoal, experience:plan_data->>userExperience, environment:plan_data->>trainingEnvironment, gender:plan_data->>userGender, age:plan_data->>userAge';

export async function getAdminSnapshot(now = new Date()) {
  if (!isSupabaseReady()) throw new Error('Supabase bağlantısı hazır değil.');
  const daysAgo = (days) => {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() - days);
    return date;
  };
  const [profiles, plans, activity, workouts, events] = await Promise.all([
    readAllAdminRows('profiles', PROFILE_COLUMNS),
    readAllAdminRows('plans', PLAN_COLUMNS),
    readAllAdminRows('user_activity_days',
      'user_id, activity_date, today_viewed, workout_plan_viewed, workout_day_opened, workout_completed',
      (query) => query.gte('activity_date', utcDateKey(daysAgo(62))), ['user_id', 'activity_date']),
    readAllAdminRows('workout_logs', 'user_id, date', (query) => query.gte('date', utcDateKey(daysAgo(32)))),
    readAllAdminRows('growth_events', 'user_id, event_name, occurred_at, properties',
      (query) => query.gte('occurred_at', daysAgo(32).toISOString()).in('event_name', ADMIN_EVENT_NAMES)),
  ]);
  return {
    now: now.toISOString(),
    profiles: profiles.data,
    plans: plans.data,
    activity: activity.data,
    workouts: workouts.data,
    events: events.data,
  };
}

// ── Delete User ─────────────────────────────────
export async function deleteUser(userId) {
  if (!isSupabaseReady()) throw new Error('Supabase bağlantısı hazır değil.');

  const { data, error } = await supabase.functions.invoke('admin-delete-user', {
    body: { userId },
  });
  if (error) throw new Error(error.message || 'Kullanıcı hesabı silinemedi.');
  if (!data?.ok) throw new Error(data?.error || 'Kullanıcı hesabı silinemedi.');
  return data;
}

// ── Support Inbox ───────────────────────────────
export async function getSupportTickets(status = 'open') {
  if (!isSupabaseReady()) throw new Error('Supabase bağlantısı hazır değil.');

  try {
    const { data } = await readAllAdminRows('support_tickets',
      'id, user_id, name, email, category, subject, message, status, priority, source, page_url, admin_note, resolved_at, created_at, updated_at',
      (query) => status === 'all' ? query : query.eq('status', status));
    return data || [];
  } catch (err) {
    console.error('[Admin] Support tickets error:', err);
    throw err;
  }
}

export async function getSupportStats({ strict = false } = {}) {
  if (!isSupabaseReady()) {
    if (strict) throw new Error('Supabase bağlantısı hazır değil.');
    return { open: 0, reviewing: 0, resolved: 0, total: 0 };
  }

  try {
    const statuses = ['open', 'reviewing', 'resolved'];
    const counts = {};

    const results = await Promise.all(statuses.map(async (status) => {
      const { count, error } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);
      if (error) throw error;
      return { status, count: count || 0 };
    }));

    results.forEach(({ status, count }) => {
      counts[status] = count;
    });

    const total = statuses.reduce((sum, status) => sum + (counts[status] || 0), 0);
    return { open: counts.open || 0, reviewing: counts.reviewing || 0, resolved: counts.resolved || 0, total };
  } catch (err) {
    console.error('[Admin] Support stats error:', err);
    if (strict) throw err;
    return { open: 0, reviewing: 0, resolved: 0, total: 0 };
  }
}

export async function updateSupportTicket(ticketId, updates) {
  if (!isSupabaseReady()) throw new Error('Supabase not ready');

  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (updates.status === 'resolved') {
    payload.resolved_at = new Date().toISOString();
  } else if (updates.status) {
    payload.resolved_at = null;
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .update(payload)
    .eq('id', ticketId)
    .select('id, user_id, name, email, category, subject, message, status, priority, source, page_url, admin_note, resolved_at, created_at, updated_at')
    .single();

  if (error) throw error;
  return data;
}

// ── Quality & editorial review ──────────────────
export async function getContentReviews() {
  if (!isSupabaseReady()) throw new Error('Supabase bağlantısı hazır değil.');
  const { data, error } = await supabase
    .from('content_reviews')
    .select('*')
    .order('content_area');
  if (error) throw error;
  return data || [];
}

export async function updateContentReview(reviewId, updates) {
  if (!isSupabaseReady()) throw new Error('Supabase not ready');
  const payload = { ...updates, updated_at: new Date().toISOString() };
  if (payload.review_status === 'approved') {
    let evidence;
    try { evidence = new URL(String(payload.evidence_url || '').trim()); } catch { /* Rejected below. */ }
    if (!String(payload.reviewer_name || '').trim()
      || !String(payload.reviewer_credential || '').trim()
      || evidence?.protocol !== 'https:' || !evidence?.hostname || evidence.username || evidence.password) {
      throw new Error('Onay için uzman adı, uzmanlığı ve HTTPS kanıt bağlantısı zorunlu.');
    }
    payload.reviewed_at = new Date().toISOString();
  } else if (payload.review_status) {
    payload.reviewed_at = null;
  }
  const { data, error } = await supabase
    .from('content_reviews')
    .update(payload)
    .eq('id', reviewId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function getAdminTestimonials(status = 'pending') {
  if (!isSupabaseReady()) throw new Error('Supabase bağlantısı hazır değil.');
  const { data } = await readAllAdminRows('testimonials', '*',
    (query) => status === 'all' ? query : query.eq('status', status));
  return (data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function updateTestimonialStatus(testimonialId, status) {
  if (!['approved', 'rejected'].includes(status)) throw new Error('Geçersiz durum.');
  if (status === 'approved') {
    const { data: existing, error: readError } = await supabase
      .from('testimonials')
      .select('consent_public, body')
      .eq('id', testimonialId)
      .single();
    if (readError) throw readError;
    if (!existing.consent_public || String(existing.body || '').trim().length < 30) {
      throw new Error('Açık yayın izni ve geçerli yorum olmadan onay verilemez.');
    }
  }
  const { data, error } = await supabase
    .from('testimonials')
    .update({ status, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', testimonialId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

