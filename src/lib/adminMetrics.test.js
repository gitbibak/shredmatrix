import { describe, expect, it } from 'vitest';
import { buildAdminMetrics, buildUserRows, dateKeyInTimeZone, sourceLabel } from './adminMetrics';

// "Şimdi": 18 Ekim 2026, İstanbul saatiyle 12:00.
const NOW = '2026-10-18T09:00:00.000Z';
const at = (day, hour = 10) => `${day}T${String(hour).padStart(2, '0')}:00:00.000Z`;
const member = (id, day, extra = {}) => ({ id, role: 'user', created_at: at(day), name: id, email: `${id}@example.test`, ...extra });

function snapshot(overrides = {}) {
  return {
    now: NOW,
    profiles: [
      { id: 'admin', role: 'admin', created_at: at('2026-10-17'), app_language: 'en' },
      member('today', '2026-10-18', { app_language: 'tr', acquisition_source: 'direct' }),
      member('yday-a', '2026-10-17', { app_language: 'en', acquisition_source: 'chatgpt.com', landing_path: '/en' }),
      member('yday-b', '2026-10-17', { app_language: 'en', acquisition_source: 'chatgpt.com', landing_path: '/en' }),
      member('wk', '2026-10-13', { app_language: 'es', acquisition_source: 'google' }),
      member('prev', '2026-10-08', { app_language: 'tr' }),
      member('old', '2026-09-01', { app_language: 'tr' }),
    ],
    plans: [
      { user_id: 'admin', goal: 'yoga' },
      { user_id: 'yday-a', goal: 'muscle', experience: 'expert', environment: 'home_basic', gender: 'male', age: '29' },
      { user_id: 'wk', primary_goal: 'pilates', age: '200' },
      { user_id: 'old', goal: 'Kas Gelişimi', experience: 'beginner', environment: 'gym', age: '41' },
    ],
    activity: [
      { user_id: 'old', activity_date: '2026-10-17', workout_completed: true, today_viewed: true },
      { user_id: 'old', activity_date: '2026-10-12' },
      { user_id: 'yday-a', activity_date: '2026-10-17', today_viewed: true },
      { user_id: 'admin', activity_date: '2026-10-17', workout_completed: true },
      { user_id: 'prev', activity_date: '2026-10-09' },
    ],
    workouts: [
      { user_id: 'old', date: '2026-10-17' },
      { user_id: 'old', date: '2026-10-15' },
      { user_id: 'admin', date: '2026-10-17' },
    ],
    events: [
      { user_id: 'yday-a', event_name: 'meal_photo_analyzed', occurred_at: at('2026-10-17') },
      { user_id: 'old', event_name: 'affiliate_link_click', occurred_at: at('2026-10-16'), properties: { placement: 'seo_tr_dumbbell', productId: 'exercise-mat' } },
      { user_id: 'admin', event_name: 'affiliate_link_click', occurred_at: at('2026-10-16'), properties: { placement: 'seo_tr_band', productId: 'mini-band' } },
      { user_id: 'old', event_name: 'meal_photo_analyzed', occurred_at: at('2026-10-18') },
    ],
    ...overrides,
  };
}

describe('buildAdminMetrics', () => {
  const metrics = buildAdminMetrics(snapshot());

  it('uses completed Istanbul days and keeps the ongoing day separate', () => {
    expect(metrics.today).toBe('2026-10-18');
    expect(metrics.todaySoFar.registrations).toBe(1);
    expect(metrics.windows.yesterday).toMatchObject({ start: '2026-10-17', end: '2026-10-18', registrations: 2, withPlan: 1 });
    expect(metrics.windows.last7).toMatchObject({ start: '2026-10-11', registrations: 3, withPlan: 2, planRate: 67 });
    expect(metrics.windows.previous7).toMatchObject({ start: '2026-10-04', end: '2026-10-11', registrations: 1 });
  });

  it('excludes administrators from every count', () => {
    expect(metrics.totals).toMatchObject({ members: 6, withPlan: 3, withoutPlan: 3 });
    expect(metrics.windows.last7.active).toBe(2);
    expect(metrics.windows.last7.workouts).toBe(2);
    expect(metrics.windows.last7.affiliateClicks).toBe(1);
    expect(metrics.affiliate.byPlacement).toEqual([{ label: 'seo_tr_dumbbell', value: 1 }]);
  });

  it('counts returning members as people who signed up before the window', () => {
    expect(metrics.windows.last7.returning).toBe(1);
    expect(metrics.windows.yesterday.returning).toBe(1);
  });

  it('measures activity, workouts and events inside the window only', () => {
    expect(metrics.windows.last7).toMatchObject({ workoutUsers: 1, photos: 1 });
    expect(metrics.windows.last7.funnel).toMatchObject({ opened: 2, todayViewed: 2, completed: 1 });
  });

  it('groups sources, languages and landing pages with their plan rate', () => {
    expect(metrics.sources7).toEqual([
      { key: 'chatgpt.com', label: 'ChatGPT', registrations: 2, withPlan: 1, planRate: 50 },
      { key: 'google', label: 'Google', registrations: 1, withPlan: 1, planRate: 100 },
    ]);
    expect(metrics.languages7.map(({ label, registrations }) => [label, registrations])).toEqual([['İngilizce', 2], ['İspanyolca', 1]]);
    expect(metrics.landings[0]).toMatchObject({ label: '/en', registrations: 2 });
    expect(metrics.newWithoutPlan7).toBe(1);
  });

  it('builds a 30-day trend of completed days', () => {
    expect(metrics.trend).toHaveLength(30);
    expect(metrics.trend.at(-1)).toMatchObject({ date: '2026-10-17', label: '17.10', registrations: 2, active: 2 });
    expect(metrics.trend.some(({ date }) => date === '2026-10-18')).toBe(false);
  });

  it('labels member profiles and ignores impossible ages', () => {
    expect(metrics.profileMix.goals).toEqual([{ label: 'Kas gelişimi', value: 2 }, { label: 'Pilates', value: 1 }]);
    expect(metrics.profileMix.experiences).toContainEqual({ label: 'Usta', value: 1 });
    expect(metrics.profileMix.environments).toContainEqual({ label: 'Ev · dambıl + bant', value: 1 });
    expect(metrics.profileMix.ages).toEqual([{ label: '25–34', value: 1 }, { label: '35–44', value: 1 }]);
  });

  it('switches the growth period without changing the daily windows', () => {
    const monthly = buildAdminMetrics(snapshot(), { period: 30 });
    expect(monthly.period.days).toBe(30);
    expect(monthly.period.current.registrations).toBe(4);
    expect(monthly.windows.last7.registrations).toBe(3);
  });

  it('handles an empty snapshot without inventing data', () => {
    const empty = buildAdminMetrics({ now: NOW });
    expect(empty.totals.members).toBe(0);
    expect(empty.windows.last7.planRate).toBeNull();
    expect(empty.sources7).toEqual([]);
    expect(empty.retention.d1Rate).toBeNull();
  });
});

describe('buildUserRows', () => {
  it('lists newest members first with plan, activity and attribution', () => {
    const rows = buildUserRows({
      ...snapshot(),
      insightsAvailable: true,
      memberActivity: [{ user_id: 'old', total_workouts: 9, recent_workouts: 2, last_workout: '2026-10-16', water_days: 3, sleep_days: 0, last_weight: 81.5 }],
    });
    expect(rows[0].id).toBe('today');
    const old = rows.find(({ id }) => id === 'old');
    expect(old).toMatchObject({
      hasPlan: true, lastActive: '2026-10-17', activeDays: 2, workouts: 2, totalWorkouts: 9,
      lastWorkout: '2026-10-16', waterDays: 3, lastWeight: 81.5, sourceLabel: 'Bilinmiyor',
    });
    expect(rows.find(({ id }) => id === 'today')).toMatchObject({ workouts: 0, totalWorkouts: 0 });
    expect(old.plan).toMatchObject({ goal: 'Kas gelişimi', experience: 'Temel', environment: 'Salon', age: 41 });
    expect(rows.find(({ id }) => id === 'admin').isAdmin).toBe(true);
    expect(rows.find(({ id }) => id === 'today').hasPlan).toBe(false);
  });

  it('shows unknown instead of zero when member activity cannot be read', () => {
    const rows = buildUserRows({ ...snapshot(), insightsAvailable: false, memberActivity: [] });
    expect(rows.find(({ id }) => id === 'old')).toMatchObject({ workouts: null, totalWorkouts: null, insightsAvailable: false });
  });

  it('reads body and plan details from the plan fields', () => {
    const base = snapshot();
    const rows = buildUserRows({
      ...base,
      plans: [{ user_id: 'old', goal: 'Fat Loss', height: '178', weight: '82.5', target_weight: '', body_fat: null, activity_level: 'moderate', phase: '1', calories: '2150', training_days: '4' }],
    });
    expect(rows.find(({ id }) => id === 'old').plan).toMatchObject({
      goal: 'Yağ yakımı', height: 178, weight: 82.5, targetWeight: null, bodyFat: null, activityLevel: 'Orta', phase: 1, calories: 2150, trainingDays: 4,
    });
  });
});

describe('helpers', () => {
  it('uses the Istanbul calendar day across the UTC midnight boundary', () => {
    expect(dateKeyInTimeZone('2026-10-14T22:30:00.000Z')).toBe('2026-10-15');
    expect(dateKeyInTimeZone(null)).toBeNull();
  });

  it('labels known sources and keeps campaign sources readable', () => {
    expect(sourceLabel('chatgpt.com')).toBe('ChatGPT');
    expect(sourceLabel('DIRECT')).toBe('Doğrudan');
    expect(sourceLabel('newsletter')).toBe('newsletter');
    expect(sourceLabel(null)).toBe('Bilinmiyor');
  });
});
