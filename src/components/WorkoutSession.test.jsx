import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WorkoutSession from './WorkoutSession';
import { buildSession } from '../lib/workoutSession';
import { isRestDay } from '../utils/streaks';

vi.mock('../lib/analytics', () => ({ trackEvent: vi.fn() }));
vi.mock('../i18n/LanguageContext', () => ({ useTranslation: () => ({ t: (key) => key, lang: 'en' }) }));

const day = {
  day: 'Tuesday',
  focus: 'Pull',
  exercises: [{ name: 'Row', sets: 2, reps: '8-10', rest: '60s' }, { name: 'Curl', sets: 2, reps: '10-12', rest: '60s' }],
};

describe('WorkoutSession', () => {
  it('keeps a decimal weight while it is being typed', () => {
    render(<WorkoutSession session={buildSession(day)} onFinish={vi.fn()} onClose={vi.fn()} />);
    const weight = screen.getByLabelText('Set 1 kg');
    // Typed one key at a time: "7." used to collapse to "7", making "7.5" read as 75.
    fireEvent.change(weight, { target: { value: '7' } });
    fireEvent.change(weight, { target: { value: '7.' } });
    expect(weight).toHaveValue('7.');
    fireEvent.change(weight, { target: { value: '7.5' } });
    expect(weight).toHaveValue('7.5');
    fireEvent.blur(weight);
    expect(weight).toHaveValue('7.5');
    fireEvent.change(weight, { target: { value: '12,5' } });
    fireEvent.blur(weight);
    expect(weight).toHaveValue('12.5');
  });

  it('lets a member who ticked nothing confirm the workout instead of losing it', async () => {
    const onFinish = vi.fn().mockResolvedValue(true);
    render(<WorkoutSession session={buildSession(day)} onFinish={onFinish} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Next exercise'));
    fireEvent.click(await screen.findByText('Finish Workout'));
    expect(onFinish).not.toHaveBeenCalled();
    expect(screen.getByText('No sets are checked. Did you do the workout?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Yes, I did it'));
    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    const [finished, summary] = onFinish.mock.calls[0];
    expect(finished.exercises.every((exercise) => exercise.sets.every((set) => set.done))).toBe(true);
    expect(summary.setsDone).toBe(summary.totalSets);
  });

  it('offers Finish before the last exercise once a set is done', async () => {
    const onFinish = vi.fn().mockResolvedValue(true);
    render(<WorkoutSession session={buildSession(day)} onFinish={onFinish} onClose={vi.fn()} />);
    expect(screen.queryByText('Finish')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Set 1 Done'));
    fireEvent.click(screen.getByText('Finish'));
    fireEvent.click(screen.getByText('Yes, finish'));
    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
  });
});

describe('rest day detection', () => {
  it('treats restorative sessions as training days', () => {
    for (const focus of ['Restoratif Yoga', 'Yin & Restore', 'Restore & Reflect', 'Stretch & Restore', 'Restorative Yoga', 'Yoga Restaurativo']) {
      expect(isRestDay({ day: 'Friday', focus, exercises: [{ name: 'Child pose' }] })).toBe(false);
    }
  });

  it('still recognises real rest days, with or without the generator flag', () => {
    for (const focus of ['Dinlenme', 'Tam Dinlenme', 'Aktif Dinlenme', 'Rest', 'Full Rest', 'Rest Day', 'Descanso', 'Descanso Total', 'Off']) {
      expect(isRestDay({ day: 'Sunday', focus })).toBe(true);
    }
    expect(isRestDay({ focus: 'Restoratif Yoga', isRest: false })).toBe(false);
    expect(isRestDay({ focus: 'Recovery', isRest: true })).toBe(true);
  });
});
