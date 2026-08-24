import { supabase, isSupabaseReady } from './supabase';

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

// ── Normalization Maps ──────────────────────────
const GOAL_MAP = {
  'muscle': 'Kas Gelişimi', 'Muscle Growth': 'Kas Gelişimi', 'muscle_growth': 'Kas Gelişimi',
  'fat_loss': 'Yağ Yakımı', 'Fat Loss': 'Yağ Yakımı', 'weight_loss': 'Yağ Yakımı',
  'yoga': 'Yoga', 'pilates': 'Pilates', 'reformer': 'Reformer',
  'meditation': 'Meditasyon', 'Meditation': 'Meditasyon',
};
const GENDER_MAP = {
  'male': 'Erkek', 'Male': 'Erkek', 'erkek': 'Erkek',
  'female': 'Kadın', 'Female': 'Kadın', 'kadın': 'Kadın', 'kadin': 'Kadın',
};
const EXPERIENCE_MAP = {
  'beginner': 'Başlangıç', 'Beginner': 'Başlangıç', 'başlangıç': 'Başlangıç',
  'intermediate': 'Orta', 'Intermediate': 'Orta', 'orta': 'Orta',
  'advanced': 'İleri', 'Advanced': 'İleri', 'ileri': 'İleri',
};

function normalize(value, map) {
  if (!value) return 'Bilinmiyor';
  return map[value] || value;
}

export function summarizeInternationalAcquisition(profiles = [], planUserIds = [], now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 30);
  const activatedIds = new Set(planUserIds);
  const international = profiles.filter((profile) => (
    ['en', 'es'].includes(profile.app_language)
    && new Date(profile.created_at) >= cutoff
  ));
  const activated = international.filter((profile) => activatedIds.has(profile.id)).length;
  const attributed = international.filter((profile) => (
    profile.acquisition_source && profile.acquisition_source !== 'direct'
  )).length;

  return {
    registrations: international.length,
    activated,
    activationRate: international.length > 0 ? Math.round((activated / international.length) * 100) : 0,
    english: international.filter((profile) => profile.app_language === 'en').length,
    spanish: international.filter((profile) => profile.app_language === 'es').length,
    attributed,
    direct: international.filter((profile) => profile.acquisition_source === 'direct').length,
  };
}

function utcDateKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function addUtcDays(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return utcDateKey(date);
}

export function summarizeRetention(profiles = [], activityDays = [], planUserIds = [], now = new Date()) {
  const today = utcDateKey(now);
  const activeDates = new Map();
  activityDays.forEach(({ user_id: userId, activity_date: activityDate }) => {
    if (!userId || !activityDate) return;
    if (!activeDates.has(userId)) activeDates.set(userId, new Set());
    activeDates.get(userId).add(String(activityDate).slice(0, 10));
  });

  const activatedIds = new Set(planUserIds);
  const result = {
    registrations: profiles.length,
    activated: profiles.filter(({ id }) => activatedIds.has(id)).length,
    d1Eligible: 0,
    d1Returned: 0,
    d7Eligible: 0,
    d7Returned: 0,
  };

  profiles.forEach((profile) => {
    const signupDate = utcDateKey(profile.created_at);
    if (!signupDate) return;
    const dates = activeDates.get(profile.id) || new Set();
    const d1Date = addUtcDays(signupDate, 1);
    const d7Date = addUtcDays(signupDate, 7);
    if (d1Date <= today) {
      result.d1Eligible += 1;
      if (dates.has(d1Date)) result.d1Returned += 1;
    }
    if (d7Date <= today) {
      result.d7Eligible += 1;
      if (dates.has(d7Date)) result.d7Returned += 1;
    }
  });

  return {
    ...result,
    activationRate: result.registrations > 0 ? Math.round((result.activated / result.registrations) * 100) : 0,
    d1Rate: result.d1Eligible > 0 ? Math.round((result.d1Returned / result.d1Eligible) * 100) : null,
    d7Rate: result.d7Eligible > 0 ? Math.round((result.d7Returned / result.d7Eligible) * 100) : null,
  };
}

export async function getRetentionStats() {
  if (!isSupabaseReady()) return summarizeRetention();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 60);
  const sinceKey = utcDateKey(since);
  const [profilesResult, activityResult, plansResult] = await Promise.all([
    supabase.from('profiles').select('id, created_at').gte('created_at', since.toISOString()),
    supabase.from('user_activity_days').select('user_id, activity_date').gte('activity_date', sinceKey),
    supabase.from('plans').select('user_id').gte('created_at', since.toISOString()),
  ]);
  const failed = [profilesResult, activityResult, plansResult].find(({ error }) => error);
  if (failed?.error) throw failed.error;
  return summarizeRetention(
    profilesResult.data || [],
    activityResult.data || [],
    (plansResult.data || []).map(({ user_id: userId }) => userId),
  );
}

// ── User Statistics ─────────────────────────────
export async function getAdminStats() {
  if (!isSupabaseReady()) return null;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);

    const results = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo.toISOString()),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', twoMonthsAgo.toISOString()).lt('created_at', monthAgo.toISOString()),
      supabase.from('plans').select('*', { count: 'exact', head: true }),
      supabase.from('support_tickets').select('*', { count: 'exact', head: true }).neq('status', 'resolved'),
    ]);

    const failed = results.find((result) => result.error);
    if (failed?.error) throw failed.error;

    const [
      { count: totalUsers },
      { count: todayRegistrations },
      { count: weekRegistrations },
      { count: monthRegistrations },
      { count: prevMonthRegistrations },
      { count: usersWithPlans },
      { count: openSupportTickets },
    ] = results;

    const growth = prevMonthRegistrations > 0
      ? Math.round(((monthRegistrations - prevMonthRegistrations) / prevMonthRegistrations) * 100)
      : monthRegistrations > 0 ? 100 : 0;

    return {
      totalUsers: totalUsers || 0,
      todayRegistrations: todayRegistrations || 0,
      weekRegistrations: weekRegistrations || 0,
      monthRegistrations: monthRegistrations || 0,
      monthlyGrowth: growth,
      usersWithPlans: usersWithPlans || 0,
      openSupportTickets: openSupportTickets || 0,
    };
  } catch (err) {
    console.error('[Admin] Stats error:', err);
    return null;
  }
}

// ── User List ───────────────────────────────────
export async function getAdminUsers(page = 0, pageSize = 20, search = '') {
  if (!isSupabaseReady()) return { users: [], total: 0, error: new Error('Supabase bağlantısı hazır değil.') };

  try {
    let query = supabase
      .from('profiles')
      .select('id, email, name, created_at, plan_created_at, role, app_language, acquisition_source, acquisition_campaign, acquisition_content, landing_path', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (search) {
      const safeSearch = String(search).trim().replace(/[,%().]/g, ' ').slice(0, 80);
      if (safeSearch) query = query.or(`email.ilike.%${safeSearch}%,name.ilike.%${safeSearch}%`);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return { users: data || [], total: count || 0, error: null };
  } catch (err) {
    console.error('[Admin] Users error:', err);
    return { users: [], total: 0, error: err };
  }
}

// ── User Plan Details ───────────────────────────
export async function getUserPlanDetails(userId) {
  if (!isSupabaseReady()) return null;

  try {
    const { data, error } = await supabase
      .from('plans')
      .select('plan_data')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return data?.plan_data || null;
  } catch {
    return null;
  }
}

// ── Plan Distribution (with normalization) ──────
export async function getPlanDistribution() {
  const empty = {
    goals: [], genders: [], ages: [], experiences: [], languages: [], sources: [], campaigns: [], contents: [],
    international: summarizeInternationalAcquisition(),
  };
  if (!isSupabaseReady()) return empty;

  try {
    const [planResult, profileResult] = await Promise.all([
      supabase.from('plans').select('user_id, plan_data'),
      supabase.from('profiles').select('id, created_at, app_language, acquisition_source, acquisition_campaign, acquisition_content'),
    ]);
    if (planResult.error) throw planResult.error;
    if (profileResult.error) throw profileResult.error;

    const goalCounts = {};
    const genderCounts = {};
    const experienceCounts = {};
    const languageCounts = {};
    const sourceCounts = {};
    const campaignCounts = {};
    const contentCounts = {};
    const ageBuckets = { '16-20': 0, '21-25': 0, '26-30': 0, '31-35': 0, '36-40': 0, '41-50': 0, '50+': 0 };

    (planResult.data || []).forEach(({ plan_data }) => {
      if (!plan_data) return;

      // Goal distribution (normalized)
      const goal = normalize(plan_data.goal || plan_data.primaryGoal, GOAL_MAP);
      goalCounts[goal] = (goalCounts[goal] || 0) + 1;

      // Gender distribution (normalized)
      const gender = normalize(plan_data.userGender, GENDER_MAP);
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;

      // Experience distribution (normalized)
      const exp = normalize(plan_data.userExperience, EXPERIENCE_MAP);
      experienceCounts[exp] = (experienceCounts[exp] || 0) + 1;

      // Age distribution
      const age = parseInt(plan_data.userAge) || 0;
      if (age <= 20) ageBuckets['16-20']++;
      else if (age <= 25) ageBuckets['21-25']++;
      else if (age <= 30) ageBuckets['26-30']++;
      else if (age <= 35) ageBuckets['31-35']++;
      else if (age <= 40) ageBuckets['36-40']++;
      else if (age <= 50) ageBuckets['41-50']++;
      else ageBuckets['50+']++;
    });

    const languageLabels = { tr: 'Türkçe', en: 'English', es: 'Español' };
    (profileResult.data || []).forEach((profile) => {
      const language = languageLabels[profile.app_language] || 'Bilinmiyor';
      const source = String(profile.acquisition_source || 'Bilinmiyor').toLowerCase();
      languageCounts[language] = (languageCounts[language] || 0) + 1;
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      const campaign = String(profile.acquisition_campaign || '').trim();
      const content = String(profile.acquisition_content || '').trim();
      if (campaign) campaignCounts[campaign] = (campaignCounts[campaign] || 0) + 1;
      if (content) contentCounts[content] = (contentCounts[content] || 0) + 1;
    });

    return {
      goals: Object.entries(goalCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      genders: Object.entries(genderCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      experiences: Object.entries(experienceCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      ages: Object.entries(ageBuckets).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value })),
      languages: Object.entries(languageCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      sources: Object.entries(sourceCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      campaigns: Object.entries(campaignCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      contents: Object.entries(contentCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      international: summarizeInternationalAcquisition(
        profileResult.data || [],
        (planResult.data || []).map((plan) => plan.user_id),
      ),
    };
  } catch (err) {
    console.error('[Admin] Distribution error:', err);
    return empty;
  }
}

// ── Registration Trend (last 30 days) ───────────
export async function getRegistrationTrend() {
  if (!isSupabaseReady()) return [];

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const grouped = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().slice(0, 10);
      grouped[key] = 0;
    }

    (data || []).forEach(({ created_at }) => {
      const key = created_at?.slice(0, 10);
      if (key && grouped[key] !== undefined) grouped[key]++;
    });

    return Object.entries(grouped).map(([date, count]) => ({
      date: date.slice(5), // "06-15" format
      count,
    }));
  } catch (err) {
    console.error('[Admin] Trend error:', err);
    return [];
  }
}

// ── Recent Users (last 10 registrations) ────────
export async function getRecentUsers() {
  if (!isSupabaseReady()) return [];

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[Admin] Recent users error:', err);
    return [];
  }
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
  if (!isSupabaseReady()) return [];

  try {
    let query = supabase
      .from('support_tickets')
      .select('id, user_id, name, email, category, subject, message, status, priority, source, page_url, admin_note, resolved_at, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(60);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[Admin] Support tickets error:', err);
    throw err;
  }
}

export async function getSupportStats() {
  if (!isSupabaseReady()) return { open: 0, reviewing: 0, resolved: 0, total: 0 };

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
  if (!isSupabaseReady()) return [];
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
    if (!String(payload.reviewer_name || '').trim()
      || !String(payload.reviewer_credential || '').trim()
      || !/^https:\/\//i.test(String(payload.evidence_url || '').trim())) {
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
  if (!isSupabaseReady()) return [];
  let query = supabase.from('testimonials').select('*').order('created_at', { ascending: false }).limit(60);
  if (status !== 'all') query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
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

// ── Activity Stats ──────────────────────────────
export async function getActivityStats() {
  if (!isSupabaseReady()) return null;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const results = await Promise.all([
      supabase.from('workout_logs').select('*', { count: 'exact', head: true }),
      supabase.from('workout_logs').select('*', { count: 'exact', head: true }).gte('date', today.toISOString().split('T')[0]),
      supabase.from('workout_logs').select('*', { count: 'exact', head: true }).gte('date', weekAgo.toISOString().split('T')[0]),
      supabase.from('workout_logs').select('user_id').gte('date', weekAgo.toISOString().split('T')[0]),
      supabase.from('water_logs').select('*', { count: 'exact', head: true }),
      supabase.from('progress_entries').select('*', { count: 'exact', head: true }),
      supabase.from('measurements').select('*', { count: 'exact', head: true }),
    ]);

    const failed = results.find((result) => result.error);
    if (failed?.error) throw failed.error;

    const [
      { count: totalWorkouts },
      { count: todayWorkouts },
      { count: weekWorkouts },
      { data: activeData },
      { count: totalWater },
      { count: totalProgress },
      { count: totalMeasurements },
    ] = results;
    const activeUsers = new Set((activeData || []).map(d => d.user_id)).size;

    return {
      totalWorkouts: totalWorkouts || 0,
      todayWorkouts: todayWorkouts || 0,
      weekWorkouts: weekWorkouts || 0,
      activeUsers,
      totalWater: totalWater || 0,
      totalProgress: totalProgress || 0,
      totalMeasurements: totalMeasurements || 0,
    };
  } catch (err) {
    console.error('[Admin] Activity stats error:', err);
    return null;
  }
}

// ── Workout Trend (last 14 days) ────────────────
export async function getWorkoutTrend() {
  if (!isSupabaseReady()) return [];

  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data, error } = await supabase
      .from('workout_logs')
      .select('date')
      .gte('date', fourteenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;

    const grouped = {};
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      grouped[d.toISOString().slice(0, 10)] = 0;
    }

    (data || []).forEach(({ date }) => {
      const key = date?.slice(0, 10);
      if (key && grouped[key] !== undefined) grouped[key]++;
    });

    return Object.entries(grouped).map(([date, count]) => ({
      date: date.slice(5),
      count,
    }));
  } catch (err) {
    console.error('[Admin] Workout trend error:', err);
    return [];
  }
}
