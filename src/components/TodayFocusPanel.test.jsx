import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

function renderPanel() {
  localStorage.setItem('shredmatrix_lang', 'tr');
  return render(
    <LanguageProvider>
      <TodayFocusPanel plan={plan} onNavigate={vi.fn()} />
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
