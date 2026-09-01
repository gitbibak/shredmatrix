import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BalanceScoreCard from './BalanceScoreCard';
import { LanguageProvider } from '../i18n/LanguageContext';
import { getSleep, getWaterHistory, getWellbeingCheckins, getWorkoutLogs } from '../lib/dataService';
import { trackEvent } from '../lib/analytics';

vi.mock('../lib/dataService', () => ({
  getWorkoutLogs: vi.fn(),
  getWaterHistory: vi.fn(),
  getSleep: vi.fn(),
  getWellbeingCheckins: vi.fn(),
}));

vi.mock('../lib/analytics', () => ({ trackEvent: vi.fn() }));

const plan = {
  primaryGoal: 'muscle',
  workoutSplit: [
    { focus: 'Upper body' },
    { focus: 'Rest', isRest: true },
    { focus: 'Lower body' },
  ],
};

function renderCard() {
  localStorage.setItem('shredmatrix_lang', 'en');
  return render(<LanguageProvider><BalanceScoreCard plan={plan} /></LanguageProvider>);
}

describe('BalanceScoreCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getWorkoutLogs.mockResolvedValue([]);
    getWaterHistory.mockResolvedValue([]);
    getSleep.mockResolvedValue([]);
    getWellbeingCheckins.mockResolvedValue([]);
  });

  it('shows an honest empty state when data is insufficient', async () => {
    renderCard();
    expect(await screen.findByText('Complete a few activities to unlock your Balance Score.')).toBeInTheDocument();
    expect(trackEvent).not.toHaveBeenCalledWith('balance_score_viewed', expect.anything());
  });

  it('renders a real score and records one privacy-safe view event', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    getWorkoutLogs.mockResolvedValue([{ date: today }, { date: yesterday }]);
    getWaterHistory.mockResolvedValue([{ date: today, glasses: 8, target_met: true }]);
    getSleep.mockResolvedValue([{ date: yesterday, hours: 8 }]);
    renderCard();
    await waitFor(() => expect(screen.getByRole('progressbar')).toBeInTheDocument());
    expect(screen.getByText(/Your Balance is \d+\/100/)).toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith('balance_score_viewed', { source: 'today_dashboard' });
  });
});
