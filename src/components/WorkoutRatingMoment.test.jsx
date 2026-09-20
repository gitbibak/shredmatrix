import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WorkoutRatingMoment, { shouldAskForRating } from './WorkoutRatingMoment';
import { hasSubmittedTestimonial, submitTestimonial } from '../lib/dataService';

vi.mock('../lib/dataService', () => ({
  getUserId: () => 'user-1',
  hasSubmittedTestimonial: vi.fn(),
  submitTestimonial: vi.fn(),
}));
vi.mock('../lib/analytics', () => ({ trackEvent: vi.fn() }));

describe('WorkoutRatingMoment', () => {
  beforeEach(() => { vi.resetAllMocks(); localStorage.clear(); hasSubmittedTestimonial.mockResolvedValue(false); });

  it('asks only at milestones and respects previous answers', () => {
    expect(shouldAskForRating(3, null)).toBe(true);
    expect(shouldAskForRating(4, null)).toBe(false);
    expect(shouldAskForRating(10, { submitted: true })).toBe(false);
    expect(shouldAskForRating(10, { never: true })).toBe(false);
    expect(shouldAskForRating(25, { dismissedAt: Date.now() - 86400000 })).toBe(false);
    expect(shouldAskForRating(25, { dismissedAt: Date.now() - 40 * 86400000 })).toBe(true);
  });

  it('routes a low score to private improvement feedback', async () => {
    submitTestimonial.mockResolvedValue({});
    render(<WorkoutRatingMoment lang="en" workoutCount={3} />);
    fireEvent.click(await screen.findByRole('button', { name: '2/5' }));
    expect(screen.getByText('What should we improve?')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).toBeNull();
    fireEvent.change(screen.getByPlaceholderText('What should we change?'), { target: { value: 'The rest timer should keep running when the screen locks.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByRole('status')).toHaveTextContent('will not be published');
    expect(submitTestimonial).toHaveBeenCalledWith(expect.objectContaining({ rating: 2, consentPublic: false }));
    expect(JSON.parse(localStorage.getItem('fb_review_prompt:user-1'))).toEqual({ submitted: true });
  });

  it('routes a high score to the public review form with consent choice', async () => {
    render(<WorkoutRatingMoment lang="tr" workoutCount={10} />);
    fireEvent.click(await screen.findByRole('button', { name: '5/5' }));
    expect(screen.getByText('Deneyimini paylaş')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('stays silent after a review or when skipped', async () => {
    hasSubmittedTestimonial.mockResolvedValue(true);
    const { unmount } = render(<WorkoutRatingMoment lang="en" workoutCount={3} />);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByRole('button', { name: '1/5' })).toBeNull();
    unmount();
    hasSubmittedTestimonial.mockResolvedValue(false);
    render(<WorkoutRatingMoment lang="en" workoutCount={3} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Skip' }));
    expect(screen.queryByRole('button', { name: '1/5' })).toBeNull();
    expect(JSON.parse(localStorage.getItem('fb_review_prompt:user-1')).dismissedAt).toBeGreaterThan(0);
  });
});
