import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import { getWorkoutLogs } from '../lib/dataService';
import TodayFocusPanel from './TodayFocusPanel';

vi.mock('../lib/dataService', () => ({
  getWorkoutLogs: vi.fn(),
  getStreakFreezes: vi.fn().mockResolvedValue([]),
  getReferralSummary: vi.fn().mockResolvedValue({ code: 'FBTEST22', invited: 0, activated: 0 }),
  getLocalReminderHour: vi.fn().mockReturnValue(null),
  saveStreakFreeze: vi.fn(),
  updateReminderHour: vi.fn().mockResolvedValue(18),
}));

vi.mock('../lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

const plan = {
  primaryGoal: 'muscle',
  trainingDays: 1,
  workoutSplit: [
    { day: 'Pazartesi', focus: 'Tam Vücut', exercises: [{ name: 'Squat' }] },
    ...Array.from({ length: 6 }, (_, index) => ({ day: `Dinlenme ${index + 1}`, focus: 'Dinlenme', isRest: true })),
  ],
};

function renderPanel(currentPlan = plan, onNavigate = vi.fn()) {
  localStorage.setItem('shredmatrix_lang', 'tr');
  return render(
    <LanguageProvider>
      <TodayFocusPanel plan={currentPlan} onNavigate={onNavigate} />
    </LanguageProvider>,
  );
}

describe('TodayFocusPanel recovery follow-up', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('shows a safety follow-up after reported pain', async () => {
    getWorkoutLogs.mockResolvedValue([
      { date: '2026-08-21', feedback_at: '2026-08-21T18:00:00Z', perceived_exertion: 2, pain_reported: true },
    ]);

    renderPanel();

    expect(await screen.findByText(/Son antrenmanda ağrı bildirdin/i)).toBeInTheDocument();
  });

  it('keeps the panel quiet after a comfortable workout', async () => {
    getWorkoutLogs.mockResolvedValue([
      { date: '2026-08-21', feedback_at: '2026-08-21T18:00:00Z', perceived_exertion: 2, pain_reported: false },
    ]);

    renderPanel();

    expect(await screen.findByText(/Bugünkü odak/i)).toBeInTheDocument();
    expect(screen.queryByText(/Son antrenmanda ağrı bildirdin/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Son antrenman zordu/i)).not.toBeInTheDocument();
  });
});

describe('TodayFocusPanel primary action', () => {
  const weeklyPlan = {
    primaryGoal: 'muscle',
    workoutSplit: [
      { day: 'Pazartesi', focus: 'İtiş', exercises: [{ name: 'Squat' }] },
      { day: 'Salı', focus: 'Dinlenme', isRest: true },
      { day: 'Çarşamba', focus: 'Çekiş', exercises: [{ name: 'Row' }] },
      ...Array.from({ length: 4 }, (_, index) => ({ day: `Dinlenme ${index + 1}`, focus: 'Dinlenme', isRest: true })),
    ],
  };

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.clearAllMocks();
    getWorkoutLogs.mockResolvedValue([]);
  });

  afterEach(() => vi.useRealTimers());

  it('opens the scheduled training day', () => {
    vi.setSystemTime(new Date(2026, 9, 12, 12));
    const onNavigate = vi.fn();
    renderPanel(weeklyPlan, onNavigate);

    fireEvent.click(screen.getByRole('button', { name: /Antrenmanı Başlat/i }));
    expect(onNavigate).toHaveBeenCalledWith('workout', 0, { start: true });
  });

  it('keeps rest-day navigation on recovery meals', () => {
    vi.setSystemTime(new Date(2026, 9, 13, 12));
    const onNavigate = vi.fn();
    renderPanel(weeklyPlan, onNavigate);

    fireEvent.click(screen.getByRole('button', { name: /Bugünün öğünlerini gör/i }));
    expect(onNavigate).toHaveBeenCalledWith('nutrition', undefined, { start: false });
  });

  it('opens the next scheduled training day after completion', async () => {
    vi.setSystemTime(new Date(2026, 9, 12, 12));
    getWorkoutLogs.mockResolvedValue([{ date: '2026-10-12', dayFocus: 'İtiş' }]);
    const onNavigate = vi.fn();
    renderPanel(weeklyPlan, onNavigate);

    const action = await screen.findByRole('button', { name: /Sıradaki odak: Çekiş/i });
    fireEvent.click(action);
    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith('workout', 2, { start: false }));
  });

  it('wraps to Monday even when Monday was completed this week', async () => {
    vi.setSystemTime(new Date(2026, 9, 16, 12));
    getWorkoutLogs.mockResolvedValue([
      { date: '2026-10-12', dayFocus: 'İtiş' },
      { date: '2026-10-16', dayFocus: 'Bacak' },
    ]);
    const fridayPlan = {
      ...weeklyPlan,
      workoutSplit: weeklyPlan.workoutSplit.map((day, index) => index === 4
        ? { day: 'Cuma', focus: 'Bacak', exercises: [{ name: 'Squat' }] }
        : day),
    };
    const onNavigate = vi.fn();
    renderPanel(fridayPlan, onNavigate);

    const action = await screen.findByRole('button', { name: /Sıradaki odak: İtiş/i });
    fireEvent.click(action);
    expect(onNavigate).toHaveBeenCalledWith('workout', 0, { start: false });
  });
});
