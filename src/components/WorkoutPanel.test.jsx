import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WorkoutPanel from './WorkoutPanel';
import { getWorkoutLogs, saveWorkoutFeedback, saveWorkoutLog } from '../lib/dataService';

vi.mock('../lib/dataService', () => ({
  getWorkoutLogs: vi.fn(),
  recordProductStep: vi.fn().mockResolvedValue(true),
  saveWorkoutFeedback: vi.fn(),
  saveWorkoutLog: vi.fn(),
  getReferralSummary: vi.fn().mockResolvedValue({ code: 'FBTEST22', invited: 0, activated: 0 }),
  getUserId: () => 'user-1',
  hasSubmittedTestimonial: vi.fn().mockResolvedValue(true),
  submitTestimonial: vi.fn(),
}));
vi.mock('../lib/analytics', () => ({ trackEvent: vi.fn() }));
vi.mock('../i18n/LanguageContext', () => ({ useTranslation: () => ({ t: (key) => key, lang: 'en' }) }));
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
    localStorage.clear();
    getWorkoutLogs.mockResolvedValue([]);
    saveWorkoutLog.mockResolvedValue({ id: 'log-1' });
    saveWorkoutFeedback.mockResolvedValue({ id: 'log-1' });
  });

  it('saves complete feedback and adapts the next workout', async () => {
    const onPlanUpdate = vi.fn().mockResolvedValue(undefined);
    render(<WorkoutPanel plan={plan} onPlanUpdate={onPlanUpdate} />);

    fireEvent.click(screen.getByText('Did it elsewhere? Quick log'));
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
    fireEvent.click(within(screen.getByRole('dialog', { name: 'referral.workoutTitle' })).getByText('workout.feedbackSkip'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('WorkoutPanel selected day', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getWorkoutLogs.mockResolvedValue([]);
  });

  it('reopens a requested day on a repeated navigation without completing it', async () => {
    const { rerender } = render(<WorkoutPanel plan={plan} selectionRequest={{ id: 1, index: 1 }} />);
    const tuesday = screen.getByRole('button', { name: /Tuesday Pull/i });
    await waitFor(() => expect(tuesday).toHaveAttribute('aria-expanded', 'true'));

    fireEvent.click(tuesday);
    expect(tuesday).toHaveAttribute('aria-expanded', 'false');
    rerender(<WorkoutPanel plan={plan} selectionRequest={{ id: 2, index: 1 }} />);

    await waitFor(() => expect(tuesday).toHaveAttribute('aria-expanded', 'true'));
    expect(saveWorkoutLog).not.toHaveBeenCalled();
  });

  it('accepts a rest-day request without offering workout completion', async () => {
    const restPlan = {
      ...plan,
      workoutSplit: [...plan.workoutSplit, { day: 'Wednesday', focus: 'Recovery', isRest: true }],
    };
    render(<WorkoutPanel plan={restPlan} selectionRequest={{ id: 1, index: 2 }} />);

    await waitFor(() => expect(screen.getByRole('button', { name: /Wednesday Recovery/i })).toHaveAttribute('aria-expanded', 'true'));
    expect(screen.queryByText('Start Workout')).not.toBeInTheDocument();
    expect(saveWorkoutLog).not.toHaveBeenCalled();
  });
});

describe('WorkoutPanel guided session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    getWorkoutLogs.mockResolvedValue([
      { date: '2026-10-13', exercises: [{ name: 'Row', sets: [{ weight: 35, reps: 8, completed: true }] }] },
    ]);
    saveWorkoutLog.mockResolvedValue({ id: 'log-2' });
  });

  it('logs real sets, prefills the last load and reports a new record', async () => {
    render(<WorkoutPanel plan={plan} selectionRequest={{ id: 1, index: 1, start: true }} />);
    const session = await screen.findByRole('dialog', { name: 'Pull' });
    expect(within(session).getByText('Last: 35 kg × 8')).toBeInTheDocument();
    expect(within(session).getByLabelText('Set 1 kg')).toHaveValue('35');

    fireEvent.change(within(session).getByLabelText('Set 1 kg'), { target: { value: '40' } });
    fireEvent.click(within(session).getByLabelText('Set 1 Done'));
    expect(within(session).getByLabelText('Set 2 kg')).toHaveValue('40');
    expect(within(session).getByText('Skip')).toBeInTheDocument();

    fireEvent.click(within(session).getByText('Next exercise'));
    fireEvent.click(await within(session).findByText('Finish Workout'));
    fireEvent.click(within(session).getByText('Yes, finish'));

    await waitFor(() => expect(saveWorkoutLog).toHaveBeenCalledTimes(1));
    const entry = saveWorkoutLog.mock.calls[0][0];
    expect(entry.dayFocus).toBe('Pull');
    expect(entry.exercises).toHaveLength(1);
    expect(entry.exercises[0]).toMatchObject({ name: 'Row', weight: 40 });
    expect(entry.exercises[0].sets[0]).toEqual({ weight: 40, reps: 8, completed: true });
    expect(entry.exercises[0].sets[1]).toEqual({ weight: 40, reps: 8, completed: false });
    expect(await screen.findByText(/New record: Row 40 kg/)).toBeInTheDocument();
    expect(localStorage.getItem('fullbalance_workout_session')).toBeNull();
  });

  it('keeps an unfinished session and offers to resume it', async () => {
    render(<WorkoutPanel plan={plan} selectionRequest={{ id: 1, index: 1, start: true }} />);
    const session = await screen.findByRole('dialog', { name: 'Pull' });
    fireEvent.click(within(session).getByLabelText('Set 1 Done'));
    fireEvent.click(within(session).getByLabelText('Close'));

    expect(await screen.findByText('Resume where you left off')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Resume where you left off'));
    const resumed = await screen.findByRole('dialog', { name: 'Pull' });
    expect(within(resumed).getByLabelText('Set 1 Done')).toHaveAttribute('aria-pressed', 'true');
    expect(saveWorkoutLog).not.toHaveBeenCalled();
  });
});
