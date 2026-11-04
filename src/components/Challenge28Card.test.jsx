import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Challenge28Card from './Challenge28Card';
import { getWorkoutLogs } from '../lib/dataService';
import { trackEvent } from '../lib/analytics';
import { toDateStr } from '../utils/streaks';

vi.mock('../lib/dataService', () => ({ getWorkoutLogs: vi.fn() }));
vi.mock('../lib/analytics', () => ({ trackEvent: vi.fn() }));
vi.mock('../lib/acquisition', () => ({ getAcquisitionContext: vi.fn(() => ({ first_landing_page: '/28-gunluk-challenge' })) }));

const today = toDateStr(new Date());

describe('Challenge28Card', () => {
  beforeEach(() => { vi.clearAllMocks(); getWorkoutLogs.mockResolvedValue([{ date: today }]); });

  it('invites visitors from the challenge page and stores the start in the plan', async () => {
    const onPlanUpdate = vi.fn().mockResolvedValue(undefined);
    render(<Challenge28Card plan={{ goal: 'muscle' }} onPlanUpdate={onPlanUpdate} lang="tr" />);
    expect(screen.getByText(/challenge'ın seni bekliyor/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: "Challenge'a katıl" }));
    await waitFor(() => expect(onPlanUpdate).toHaveBeenCalledWith({ goal: 'muscle', challenge28: { startedAt: today } }));
    expect(trackEvent).toHaveBeenCalledWith('challenge_joined', { challengeId: 'start28', challengeType: 'workout', source: 'challenge_landing' });
  });

  it('shows progress from logged workouts once joined', async () => {
    render(<Challenge28Card plan={{ challenge28: { startedAt: today } }} onPlanUpdate={vi.fn()} lang="en" />);
    expect(await screen.findByText('1')).toBeInTheDocument();
    expect(screen.getByText('Day 1 / 28')).toBeInTheDocument();
    expect(screen.getByText('2 workouts left this week. You can still make it!')).toBeInTheDocument();
  });
});
