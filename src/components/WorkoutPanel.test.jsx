import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WorkoutPanel from './WorkoutPanel';
import { getWorkoutLogs, saveWorkoutFeedback, saveWorkoutLog } from '../lib/dataService';

vi.mock('../lib/dataService', () => ({
  getWorkoutLogs: vi.fn(),
  recordProductStep: vi.fn().mockResolvedValue(true),
  saveWorkoutFeedback: vi.fn(),
  saveWorkoutLog: vi.fn(),
  getReferralSummary: vi.fn().mockResolvedValue({ code: 'FBTEST22', invited: 0, activated: 0 }),
}));
vi.mock('../lib/analytics', () => ({ trackEvent: vi.fn() }));
vi.mock('../i18n/LanguageContext', () => ({ useTranslation: () => ({ t: (key) => key }) }));
vi.mock('./ToastProvider', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }) }));
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

const plan = {
  goal: 'muscle',
  workoutSplit: [
    { day: 'Monday', focus: 'Push', exercises: [{ name: 'Push-up', sets: 3, reps: '8-10', rest: '60s' }] },
    { day: 'Tuesday', focus: 'Pull', exercises: [{ name: 'Row', sets: 4, reps: '8-10', rest: '60s' }, { name: 'Curl', sets: 3, reps: '10-12', rest: '60s' }] },
  ],
};

describe('WorkoutPanel feedback flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getWorkoutLogs.mockResolvedValue([]);
    saveWorkoutLog.mockResolvedValue({ id: 'log-1' });
    saveWorkoutFeedback.mockResolvedValue({ id: 'log-1' });
  });

  it('saves complete feedback and adapts the next workout', async () => {
    const onPlanUpdate = vi.fn().mockResolvedValue(undefined);
    render(<WorkoutPanel plan={plan} onPlanUpdate={onPlanUpdate} />);

    fireEvent.click(screen.getByText('workout.completeBtn'));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByText('workout.feedbackEffort3'));
    fireEvent.click(screen.getByText('workout.feedbackEnergy2'));
    fireEvent.click(screen.getByText('workout.feedbackNo'));
    fireEvent.click(screen.getByText('workout.feedbackSave'));

    await waitFor(() => expect(saveWorkoutFeedback).toHaveBeenCalledWith(expect.objectContaining({
      id: 'log-1',
      perceivedExertion: 3,
      painReported: false,
      energyAfter: 2,
      sessionDurationMinutes: 45,
      adaptationAction: 'reduce',
    })));
    await waitFor(() => expect(onPlanUpdate).toHaveBeenCalledWith(expect.objectContaining({
      workoutSplit: expect.arrayContaining([expect.objectContaining({ adaptationAction: 'reduce' })]),
    })));
    // The feedback dialog closes and the invite moment takes its place.
    await waitFor(() => expect(screen.queryByText('workout.feedbackSave')).not.toBeInTheDocument());
    expect(await screen.findByText('WhatsApp')).toBeInTheDocument();
    fireEvent.click(screen.getByText('workout.feedbackSkip'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
