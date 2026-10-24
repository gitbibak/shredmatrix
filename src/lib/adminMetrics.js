// Yönetim paneli metrikleri — saf fonksiyonlar; Supabase'e dokunmaz, test edilebilir.
//
// Tanımlar günlük sağlık raporuyla aynıdır:
// - Gün sınırları Europe/Istanbul takvim günüdür.
// - "Son N gün" tamamlanmış günlerdir; devam eden bugün dahil değildir.
// - Yönetici hesapları ve onların kayıtları her metrikten çıkarılır.
// - "Planı var" kaydın şu anki durumudur; kayıt günü aktivasyonu değildir.

export const ADMIN_TIME_ZONE = 'Europe/Istanbul';
export const MEMBER_GOAL = 500;

export function utcDateKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

export function addUtcDays(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return utcDateKey(date);
}

export function dateKeyInTimeZone(value, timeZone = ADMIN_TIME_ZONE) {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value: partValue }) => [type, partValue]));
  return `${values.year}-${values.month}-${values.day}`;
}

// ── Etiketler ────────────────────────────────────────────────
export const LANGUAGE_LABELS = { tr: 'Türkçe', en: 'İngilizce', es: 'İspanyolca' };
const SOURCE_LABELS = {
  direct: 'Doğrudan', 'chatgpt.com': 'ChatGPT', google: 'Google', bing: 'Bing',
  'perplexity.ai': 'Perplexity', facebook: 'Facebook', instagram: 'Instagram', strava: 'Strava',
};
const GOAL_LABELS = {
  muscle: 'Kas gelişimi', 'Muscle Growth': 'Kas gelişimi', muscle_growth: 'Kas gelişimi', 'Kas Gelişimi': 'Kas gelişimi',
  fat_loss: 'Yağ yakımı', 'Fat Loss': 'Yağ yakımı', weight_loss: 'Yağ yakımı', 'Yağ Yakımı': 'Yağ yakımı',
  yoga: 'Yoga', Yoga: 'Yoga', pilates: 'Pilates', Pilates: 'Pilates', reformer: 'Reformer', Reformer: 'Reformer',
  meditation: 'Meditasyon', Meditation: 'Meditasyon', Meditasyon: 'Meditasyon',
};
const EXPERIENCE_LABELS = { beginner: 'Temel', intermediate: 'Orta', advanced: 'İleri', expert: 'Usta' };
const GENDER_LABELS = { male: 'Erkek', erkek: 'Erkek', female: 'Kadın', kadın: 'Kadın', kadin: 'Kadın' };
const ACTIVITY_LABELS = {
  sedentary: 'Hareketsiz', light: 'Az hareketli', moderate: 'Orta', active: 'Aktif', athlete: 'Sporcu',
};
const ENVIRONMENT_LABELS = {
  gym: 'Salon', home_basic: 'Ev · dambıl + bant', home_bodyweight: 'Ev · ekipmansız',
  studio: 'Stüdyo reformer', home_reformer: 'Ev reformer',
};
const UNKNOWN = 'Bilinmiyor';

export function sourceLabel(source) {
  if (!source) return UNKNOWN;
  return SOURCE_LABELS[String(source).toLowerCase()] || String(source);
}

const labelFrom = (map) => (value) => (value == null || value === '' ? UNKNOWN : map[value] || map[String(value).toLowerCase()] || String(value));
export const goalLabel = labelFrom(GOAL_LABELS);
export const experienceLabel = labelFrom(EXPERIENCE_LABELS);
export const genderLabel = labelFrom(GENDER_LABELS);
export const environmentLabel = labelFrom(ENVIRONMENT_LABELS);
export const languageLabel = labelFrom(LANGUAGE_LABELS);
export const activityLabel = labelFrom(ACTIVITY_LABELS);

const toNumber = (value) => {
  const number = Number(value);
  return value == null || value === '' || !Number.isFinite(number) ? null : number;
};

// ── Geri dönüş (D1/D7) ───────────────────────────────────────
// user_activity_days.activity_date sunucu (UTC) günüdür; bu yüzden UTC ile ölçülür.
export function summarizeRetention(profiles = [], activityDays = [], planUserIds = [], now = new Date()) {
  const today = utcDateKey(now);
  const coverageDates = activityDays
    .map(({ activity_date: activityDate }) => String(activityDate || '').slice(0, 10))
    .filter(Boolean)
    .sort();
  const trackingStartedAt = coverageDates[0] || null;
  const lastCompleteDate = today ? addUtcDays(today, -1) : null;
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
    if (trackingStartedAt && d1Date >= trackingStartedAt && d1Date < today) {
      result.d1Eligible += 1;
      if (dates.has(d1Date)) result.d1Returned += 1;
    }
    if (trackingStartedAt && d7Date >= trackingStartedAt && d7Date < today) {
      result.d7Eligible += 1;
      if (dates.has(d7Date)) result.d7Returned += 1;
    }
  });

  return {
    ...result,
    activationRate: result.registrations > 0 ? Math.round((result.activated / result.registrations) * 100) : 0,
    d1Rate: result.d1Eligible > 0 ? Math.round((result.d1Returned / result.d1Eligible) * 100) : null,
    d7Rate: result.d7Eligible > 0 ? Math.round((result.d7Returned / result.d7Eligible) * 100) : null,
    trackingStartedAt,
    lastCompleteDate,
    measurementDays: trackingStartedAt && lastCompleteDate
      ? Math.max(0, Math.round((new Date(`${lastCompleteDate}T00:00:00.000Z`) - new Date(`${trackingStartedAt}T00:00:00.000Z`)) / 86400000) + 1)
      : 0,
  };
}

// ── Yardımcılar ──────────────────────────────────────────────
export function percent(part, whole) {
  return whole > 0 ? Math.round((part / whole) * 100) : null;
}

const dayOf = (value) => (value == null ? null : String(value).slice(0, 10));
const inRange = (day, start, end) => Boolean(day) && day >= start && day < end;

function groupRegistrations(registrations, keyOf, labelOf, planIds) {
  const groups = new Map();
  registrations.forEach((profile) => {
    const key = keyOf(profile) || null;
    const group = groups.get(key) || { key: key || 'unknown', label: key ? labelOf(key) : UNKNOWN, registrations: 0, withPlan: 0 };
    group.registrations += 1;
    if (planIds.has(profile.id)) group.withPlan += 1;
    groups.set(key, group);
  });
  return [...groups.values()]
    .map((group) => ({ ...group, planRate: percent(group.withPlan, group.registrations) }))
    .sort((a, b) => b.registrations - a.registrations || a.label.localeCompare(b.label, 'tr'));
}

function countValues(values, labelOf) {
  const counts = new Map();
  values.forEach((value) => {
    const label = labelOf(value);
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'tr'));
}

function ageBucket(raw) {
  const age = Number(raw);
  if (!Number.isInteger(age) || age < 16 || age > 120) return null;
  if (age <= 24) return '16–24';
  if (age <= 34) return '25–34';
  if (age <= 44) return '35–44';
  if (age <= 54) return '45–54';
  return '55+';
}

const AGE_ORDER = ['16–24', '25–34', '35–44', '45–54', '55+'];

function prepare(snapshot) {
  const now = snapshot.now ? new Date(snapshot.now) : new Date();
  const today = dateKeyInTimeZone(now);
  const profiles = snapshot.profiles || [];
  const members = profiles.filter(({ role }) => role !== 'admin');
  const memberIds = new Set(members.map(({ id }) => id));
  const plans = (snapshot.plans || []).filter(({ user_id: userId }) => memberIds.has(userId));
  const planIds = new Set(plans.map(({ user_id: userId }) => userId));
  const signupDay = new Map(members.map((profile) => [profile.id, dateKeyInTimeZone(profile.created_at)]));
  const activity = (snapshot.activity || []).filter(({ user_id: userId }) => memberIds.has(userId));
  const workouts = (snapshot.workouts || []).filter(({ user_id: userId }) => memberIds.has(userId));
  const events = (snapshot.events || [])
    .filter(({ user_id: userId }) => memberIds.has(userId))
    .map((event) => ({ ...event, day: dateKeyInTimeZone(event.occurred_at) }));
  return { now, today, members, memberIds, plans, planIds, signupDay, activity, workouts, events };
}

function windowStats(data, days, offset = 0) {
  const { today, members, planIds, signupDay, activity, workouts, events } = data;
  const end = addUtcDays(today, -offset);
  const start = addUtcDays(end, -days);
  const registrations = members.filter(({ id }) => inRange(signupDay.get(id), start, end));
  const activeRows = activity.filter(({ activity_date: date }) => inRange(dayOf(date), start, end));
  const activeIds = new Set(activeRows.map(({ user_id: userId }) => userId));
  const workoutRows = workouts.filter(({ date }) => inRange(dayOf(date), start, end));
  const eventCount = (name) => events.filter((event) => event.event_name === name && inRange(event.day, start, end)).length;
  const usersWith = (flag) => new Set(activeRows.filter((row) => row[flag]).map(({ user_id: userId }) => userId)).size;
  const withPlan = registrations.filter(({ id }) => planIds.has(id)).length;
  return {
    start,
    end,
    days,
    registrations: registrations.length,
    withPlan,
    planRate: percent(withPlan, registrations.length),
    active: activeIds.size,
    returning: [...activeIds].filter((id) => (signupDay.get(id) || '') < start).length,
    workouts: workoutRows.length,
    workoutUsers: new Set(workoutRows.map(({ user_id: userId }) => userId)).size,
    photos: eventCount('meal_photo_analyzed'),
    photoFailures: eventCount('meal_photo_analysis_failed'),
    signupErrors: eventCount('sign_up_error'),
    loginErrors: eventCount('login_error'),
    affiliateClicks: eventCount('affiliate_link_click'),
    funnel: {
      opened: activeIds.size,
      todayViewed: usersWith('today_viewed'),
      planViewed: usersWith('workout_plan_viewed'),
      dayOpened: usersWith('workout_day_opened'),
      completed: usersWith('workout_completed'),
    },
    usage: {
      water: eventCount('water_logged'),
      sleep: eventCount('sleep_logged'),
      nutrition: eventCount('nutrition_logged'),
      meditation: eventCount('meditation_completed'),
      invites: eventCount('invite_sent'),
      sessionsStarted: eventCount('workout_session_started'),
      sessionsCompleted: events.filter((event) => event.event_name === 'workout_session_completed' && event.properties?.mode === 'guided' && inRange(event.day, start, end)).length,
    },
    registrationRows: registrations,
  };
}

/**
 * Panelin ihtiyaç duyduğu bütün özetler.
 * @param {object} snapshot getAdminSnapshot() çıktısı (+ isteğe bağlı support/pending sayıları)
 * @param {{ period?: 7 | 30 }} options Büyüme bölümünün dönemi
 */
export function buildAdminMetrics(snapshot = {}, { period = 7 } = {}) {
  const data = prepare(snapshot);
  const { today, members, plans, planIds, signupDay, activity, events } = data;

  const yesterday = windowStats(data, 1);
  const last3 = windowStats(data, 3);
  const last7 = windowStats(data, 7);
  const previous7 = windowStats(data, 7, 7);
  const current = windowStats(data, period);
  const previous = windowStats(data, period, period);

  const trendStart = addUtcDays(today, -30);
  const trend = Array.from({ length: 30 }, (_, index) => {
    const day = addUtcDays(trendStart, index);
    return {
      date: day,
      label: `${day.slice(8, 10)}.${day.slice(5, 7)}`,
      registrations: members.filter(({ id }) => signupDay.get(id) === day).length,
      active: new Set(activity.filter(({ activity_date: date }) => dayOf(date) === day).map(({ user_id: userId }) => userId)).size,
    };
  });

  const periodRegistrations = current.registrationRows;
  const affiliateEvents = events.filter((event) => event.event_name === 'affiliate_link_click' && inRange(event.day, current.start, current.end));

  const retentionProfiles = members.filter(({ created_at: createdAt }) => {
    const day = utcDateKey(createdAt);
    return day && day >= addUtcDays(utcDateKey(data.now), -60);
  });

  const strip = ({ registrationRows, ...rest }) => rest;

  return {
    today,
    totals: {
      members: members.length,
      withPlan: planIds.size,
      withoutPlan: members.length - planIds.size,
      goal: MEMBER_GOAL,
      goalProgress: Math.min(100, Math.round((members.length / MEMBER_GOAL) * 100)),
    },
    todaySoFar: { registrations: members.filter(({ id }) => signupDay.get(id) === today).length },
    windows: { yesterday: strip(yesterday), last3: strip(last3), last7: strip(last7), previous7: strip(previous7) },
    period: { days: period, current: strip(current), previous: strip(previous) },
    newWithoutPlan7: last7.registrations - last7.withPlan,
    trend,
    sources: groupRegistrations(periodRegistrations, (p) => (p.acquisition_source ? String(p.acquisition_source).toLowerCase() : null), sourceLabel, planIds),
    landings: groupRegistrations(periodRegistrations, (p) => p.landing_path || null, (path) => path, planIds),
    campaigns: groupRegistrations(periodRegistrations.filter((p) => p.acquisition_campaign), (p) => p.acquisition_campaign, (name) => name, planIds),
    languages: groupRegistrations(periodRegistrations, (p) => p.app_language || null, languageLabel, planIds),
    sources7: groupRegistrations(last7.registrationRows, (p) => (p.acquisition_source ? String(p.acquisition_source).toLowerCase() : null), sourceLabel, planIds),
    languages7: groupRegistrations(last7.registrationRows, (p) => p.app_language || null, languageLabel, planIds),
    retention: summarizeRetention(retentionProfiles, activity, [...planIds], data.now),
    affiliate: {
      byPlacement: countValues(affiliateEvents.map((event) => event.properties?.placement || null), (value) => value || UNKNOWN),
      byProduct: countValues(affiliateEvents.map((event) => event.properties?.productId || null), (value) => value || UNKNOWN),
    },
    profileMix: {
      goals: countValues(plans.map((plan) => plan.goal || plan.primary_goal), goalLabel),
      experiences: countValues(plans.map((plan) => plan.experience), experienceLabel),
      environments: countValues(plans.map((plan) => plan.environment), environmentLabel),
      genders: countValues(plans.map((plan) => plan.gender), genderLabel),
      ages: countValues(plans.map((plan) => ageBucket(plan.age)).filter(Boolean), (value) => value)
        .sort((a, b) => AGE_ORDER.indexOf(a.label) - AGE_ORDER.indexOf(b.label)),
    },
  };
}

/** Kullanıcı tablosu satırları: en yeni kayıt önce. */
export function buildUserRows(snapshot = {}) {
  const data = prepare(snapshot);
  const insights = snapshot.insightsAvailable !== false && Array.isArray(snapshot.memberActivity);
  const memberActivity = new Map((snapshot.memberActivity || []).map((row) => [row.user_id, row]));
  const plansById = new Map(data.plans.map((plan) => [plan.user_id, plan]));
  const lastActive = new Map();
  const activeDays = new Map();
  data.activity.forEach(({ user_id: userId, activity_date: date }) => {
    const day = dayOf(date);
    if (!day) return;
    if (!lastActive.has(userId) || lastActive.get(userId) < day) lastActive.set(userId, day);
    activeDays.set(userId, (activeDays.get(userId) || 0) + 1);
  });
  // Plans are filtered to members in prepare(); admins keep their own plan here.
  (snapshot.plans || []).forEach((plan) => { if (!plansById.has(plan.user_id)) plansById.set(plan.user_id, plan); });

  return (snapshot.profiles || [])
    .map((profile) => {
      const plan = plansById.get(profile.id);
      const usage = memberActivity.get(profile.id);
      const count = (value) => (insights ? toNumber(value) ?? 0 : null);
      return {
        id: profile.id,
        name: profile.name || '',
        email: profile.email || '',
        role: profile.role || 'user',
        isAdmin: profile.role === 'admin',
        createdAt: profile.created_at,
        signupDay: dateKeyInTimeZone(profile.created_at),
        language: profile.app_language || null,
        source: profile.acquisition_source ? String(profile.acquisition_source).toLowerCase() : null,
        sourceLabel: sourceLabel(profile.acquisition_source),
        medium: profile.acquisition_medium || null,
        campaign: profile.acquisition_campaign || null,
        content: profile.acquisition_content || null,
        term: profile.acquisition_term || null,
        landing: profile.landing_path || null,
        firstLanding: profile.first_landing_page || null,
        browserLocale: profile.browser_locale || null,
        timeZone: profile.time_zone || null,
        firstLoginAt: profile.first_login_at || null,
        planCreatedAt: profile.plan_created_at || null,
        referralCode: profile.referral_code || null,
        referredBy: profile.referred_by_code || null,
        hasPlan: Boolean(plan),
        goalKey: plan ? String(plan.primary_goal || plan.goal || '') : null,
        plan: plan ? {
          goal: goalLabel(plan.goal || plan.primary_goal),
          experience: experienceLabel(plan.experience),
          environment: environmentLabel(plan.environment),
          gender: genderLabel(plan.gender),
          age: Number.isInteger(Number(plan.age)) && Number(plan.age) > 0 ? Number(plan.age) : null,
          height: toNumber(plan.height),
          weight: toNumber(plan.weight),
          targetWeight: toNumber(plan.target_weight),
          bodyFat: toNumber(plan.body_fat),
          activityLevel: plan.activity_level ? activityLabel(plan.activity_level) : null,
          phase: toNumber(plan.phase),
          calories: toNumber(plan.calories),
          trainingDays: toNumber(plan.training_days),
          language: plan.plan_lang || null,
        } : null,
        lastActive: lastActive.get(profile.id) || null,
        activeDays: activeDays.get(profile.id) || 0,
        insightsAvailable: insights,
        workouts: count(usage?.recent_workouts),
        totalWorkouts: count(usage?.total_workouts),
        lastWorkout: usage?.last_workout || null,
        waterDays: count(usage?.water_days),
        sleepDays: count(usage?.sleep_days),
        lastWeight: toNumber(usage?.last_weight),
        lastWeightDate: usage?.last_weight_date || null,
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
