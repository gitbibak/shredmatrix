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

    await saveWorkoutLog(log);

    expect(await getWorkoutLogs()).toEqual([log]);
  });

  it('upserts one wellbeing check-in per day in the local fallback', async () => {
    const { saveWellbeingCheckin, getWellbeingCheckins } = await loadService();

    await saveWellbeingCheckin({ date: '2026-08-10', energy: 1, nutritionAligned: false });
    await saveWellbeingCheckin({ date: '2026-08-10', energy: 3, nutritionAligned: true });

    expect(await getWellbeingCheckins()).toEqual([
      { date: '2026-08-10', energy: 3, nutrition_aligned: true },
    ]);
  });

  it('creates and resolves trainer invite links locally when Supabase is unavailable', async () => {
    const {
      connectTrainerByCode,
      createTrainerInvite,
      getMyTrainers,
      getTrainerClients,
      removeTrainerConnection,
    } = await loadService();

    const invite = await createTrainerInvite();
    await connectTrainerByCode(invite.code.toLowerCase());

    const clients = await getTrainerClients();
    const trainers = await getMyTrainers();
    expect(invite.code).toMatch(/^PT-[A-F0-9]{8}$/);
    expect(clients).toHaveLength(1);
    expect(trainers).toHaveLength(1);
    expect(clients[0].trainer.name).toBe('Local Trainer');

    await removeTrainerConnection(clients[0].id);
    expect(await getTrainerClients()).toEqual([]);
  });
});
