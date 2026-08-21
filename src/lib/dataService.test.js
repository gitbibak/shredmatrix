import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./supabase', () => ({
  supabase: null,
  isSupabaseReady: () => false,
}));

const loadService = async () => import('./dataService');

describe('dataService local fallback', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('saves and loads plans from localStorage when Supabase is unavailable', async () => {
    const { savePlan, loadPlan } = await loadService();
    const plan = { dailyCalories: 2400, goal: 'muscle' };

    await savePlan(plan, 'user@example.com');

    expect(await loadPlan('user@example.com')).toEqual(plan);
    expect(localStorage.getItem('shredmatrix_plan_created')).toBeTruthy();
  });

  it('normalizes water history and keeps reset days below target', async () => {
    const { saveWater, getWater, getWaterHistory } = await loadService();

    await saveWater('2026-07-07', 8, true);
    await saveWater('2026-07-07', 0, false);

    expect(await getWater('2026-07-07')).toEqual({ date: '2026-07-07', glasses: 0 });
    expect(await getWaterHistory()).toEqual([
      { date: '2026-07-07', glasses: 0, target_met: false },
    ]);
  });

  it('migrates old string-only water history records on read', async () => {
    const { getWaterHistory } = await loadService();
    localStorage.setItem('shredmatrix_water_history', JSON.stringify(['2026-07-06']));

    expect(await getWaterHistory()).toEqual([
      { date: '2026-07-06', glasses: 8, target_met: true },
    ]);
  });

  it('appends workout logs locally when Supabase is unavailable', async () => {
    const { saveWorkoutLog, getWorkoutLogs } = await loadService();
    const log = { date: '2026-07-07', focus: 'Push', exercises: [] };

    const saved = await saveWorkoutLog(log);

    expect(saved).toMatchObject(log);
    expect(saved.id).toBeTruthy();
    expect(await getWorkoutLogs()).toEqual([saved]);
  });

  it('adds optional effort and pain feedback to the matching workout', async () => {
    const { saveWorkoutLog, saveWorkoutFeedback, getWorkoutLogs } = await loadService();
    const saved = await saveWorkoutLog({ date: '2026-08-21', dayFocus: 'Full Body', exercises: [] });

    await saveWorkoutFeedback({
      id: saved.id,
      date: saved.date,
      dayFocus: saved.dayFocus,
      perceivedExertion: 2,
      painReported: false,
      energyAfter: 3,
      sessionDurationMinutes: 42,
      adaptationAction: 'maintain',
    });

    expect(await getWorkoutLogs()).toEqual([
      expect.objectContaining({
        id: saved.id,
        perceived_exertion: 2,
        pain_reported: false,
        energy_after: 3,
        session_duration_minutes: 42,
        adaptation_action: 'maintain',
        feedback_at: expect.any(String),
      }),
    ]);
  });

  it('upserts one wellbeing check-in per day in the local fallback', async () => {
    const { saveWellbeingCheckin, getWellbeingCheckins } = await loadService();

    await saveWellbeingCheckin({ date: '2026-08-10', energy: 1, nutritionAligned: false });
    await saveWellbeingCheckin({ date: '2026-08-10', energy: 3, nutritionAligned: true });

    expect(await getWellbeingCheckins()).toEqual([
      { date: '2026-08-10', energy: 3, nutrition_aligned: true },
    ]);
  });

  it('clears local account data when Supabase is unavailable', async () => {
    const { deleteAllUserData } = await loadService();
    localStorage.setItem('shredmatrix_plan_user@example.com', JSON.stringify({ goal: 'muscle' }));
    localStorage.setItem('shredmatrix_progress', JSON.stringify([{ weight: 75 }]));

    await deleteAllUserData('user@example.com');

    expect(localStorage.getItem('shredmatrix_plan_user@example.com')).toBeNull();
    expect(localStorage.getItem('shredmatrix_progress')).toBeNull();
  });
});
