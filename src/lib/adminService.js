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
  const selected = columns.trim() === '*' ? '*' : [...new Set([...keys, ...columns.split(',').map((column) => column.trim())])].join(', ');
  return readAllPages(() => configure(supabase.from(table).select(selected, { count: 'exact' })), keys);
}

// Admin-only RPCs that return a table. Functions do not reliably report a total
// count, so pages are read in key order until a short page arrives.
async function readAllRpcRows(fn, args, keys) {
  const pageSize = 500;
  const rows = [];
  const seen = new Set();
  while (true) {
    let query = supabase.rpc(fn, args);
    keys.forEach((key) => { query = query.order(key, { ascending: true }); });
    const { data, error } = await query.range(rows.length, rows.length + pageSize - 1);
    if (error) throw error;
    const page = data || [];
    for (const row of page) {
      const identity = JSON.stringify(keys.map((key) => row[key]));
      if (seen.has(identity)) throw new Error(`${fn} returned a duplicate row.`);
      seen.add(identity);
      rows.push(row);
    }
    if (page.length < pageSize) return { data: rows };
  }
}

async function readAllPages(makeQuery, keys) {
  const pageSize = 500;
  const rows = [];
  const seen = new Set();
  let expectedCount;
  while (true) {
    let query = makeQuery();
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
  'meditation_completed', 'invite_sent', 'workout_session_started', 'workout_session_completed',
  'workout_session_abandoned', 'workout_session_save_failed',
]);

const PROFILE_COLUMNS = 'id, name, email, created_at, role, app_language, browser_locale, time_zone, acquisition_source, acquisition_medium, acquisition_campaign, acquisition_content, acquisition_term, landing_path, first_landing_page, plan_created_at, first_login_at, referral_code, referred_by_code';
const PLAN_COLUMNS = 'user_id, goal:plan_data->>goal, primary_goal:plan_data->>primaryGoal, experience:plan_data->>userExperience, environment:plan_data->>trainingEnvironment, gender:plan_data->>userGender, age:plan_data->>userAge, height:plan_data->>userHeight, weight:plan_data->>userWeight, target_weight:plan_data->>userTargetWeight, body_fat:plan_data->>userBodyFat, activity_level:plan_data->>userActivityLevel, phase:plan_data->>phase, calories:plan_data->>dailyCalories, training_days:plan_data->>trainingDaysPerWeek, plan_lang:plan_data->>lang';

// Workout, weight, water and sleep rows are readable only by their owner, so
// the panel reads them through admin-only database functions
// (supabase/migrations/20261025120000_admin_member_insights.sql). Until those
// exist the panel shows "—" instead of a misleading 0.
function isMissingFunction(error) {
  return ['PGRST202', '42883'].includes(error?.code) || /could not find the function|does not exist/i.test(error?.message || '');
}

async function readMemberInsights(since30, since32) {
  try {
    const [activity, workoutDays] = await Promise.all([
      readAllRpcRows('admin_member_activity', { p_since: since30 }, ['user_id']),
      readAllRpcRows('admin_workout_days', { p_since: since32 }, ['user_id', 'date']),
    ]);
    return { available: true, memberActivity: activity.data, workouts: workoutDays.data };
  } catch (error) {
    // Members, plans and sign-ups must still load if activity cannot be read.
    if (!isMissingFunction(error)) console.error('[Admin] Member activity error:', error);
    return { available: false, memberActivity: [], workouts: [] };
  }
}

export async function getAdminSnapshot(now = new Date()) {
  if (!isSupabaseReady()) throw new Error('Supabase bağlantısı hazır değil.');
  const daysAgo = (days) => {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() - days);
    return date;
  };
  const [profiles, plans, activity, insights, events] = await Promise.all([
    readAllAdminRows('profiles', PROFILE_COLUMNS),
    readAllAdminRows('plans', PLAN_COLUMNS),
    readAllAdminRows('user_activity_days',
      'user_id, activity_date, today_viewed, workout_plan_viewed, workout_day_opened, workout_completed',
      (query) => query.gte('activity_date', utcDateKey(daysAgo(62))), ['user_id', 'activity_date']),
    readMemberInsights(utcDateKey(daysAgo(30)), utcDateKey(daysAgo(32))),
    readAllAdminRows('growth_events', 'user_id, event_name, occurred_at, properties',
      (query) => query.gte('occurred_at', daysAgo(32).toISOString()).in('event_name', ADMIN_EVENT_NAMES)),
  ]);
  return {
    now: now.toISOString(),
    profiles: profiles.data,
    plans: plans.data,
    activity: activity.data,
    workouts: insights.workouts,
    memberActivity: insights.memberActivity,
    insightsAvailable: insights.available,
    events: events.data,
  };
}

// ── Üye detayı (yan panel) ───────────────────────────────────
// Panel açıldığında tek üye için okunur: planın tamamı, antrenman geçmişi,
// kilo/ölçüm, su/uyku ve destek talepleri.
export async function getMemberDetail(userId) {
  if (!isSupabaseReady()) throw new Error('Supabase bağlantısı hazır değil.');
  const [plan, detail, tickets] = await Promise.all([
    supabase.from('plans').select('plan_data, created_at').eq('user_id', userId).maybeSingle(),
    supabase.rpc('admin_member_detail', { p_user: userId }),
    supabase.from('support_tickets').select('id, created_at, subject, category, status').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
  ]);
  if (plan.error) throw plan.error;
  if (tickets.error) throw tickets.error;
  if (detail.error && !isMissingFunction(detail.error)) throw detail.error;
  return {
    plan: plan.data?.plan_data || null,
    planCreatedAt: plan.data?.created_at || null,
    activity: detail.error ? null : detail.data,
    tickets: tickets.data || [],
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

