import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MilestoneStoryPrompt from './MilestoneStoryPrompt';
import { getProfile, hasSubmittedTestimonial } from '../lib/dataService';
import { trackEvent } from '../lib/analytics';
import { rememberAccountCreated } from '../lib/engagementAsks';

vi.mock('../lib/dataService', () => ({ getProfile: vi.fn(), hasSubmittedTestimonial: vi.fn(), getUserId: () => 'm1', submitTestimonial: vi.fn() }));
vi.mock('../lib/analytics', () => ({ trackEvent: vi.fn() }));

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

describe('Today review prompt', () => {
  beforeEach(() => {
    vi.clearAllMocks(); localStorage.clear(); sessionStorage.clear();
    hasSubmittedTestimonial.mockResolvedValue(false);
  });

  it('asks a member who came back on a later day, without needing workouts', async () => {
    rememberAccountCreated('m1', daysAgo(2));
    render(<MilestoneStoryPrompt lang="en" userId="m1" />);
    expect(await screen.findByText('How do you like Full Balance?')).toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalledWith('review_prompt_view', { surface: 'today' });
  });

  it('reads the signup date from the profile on a first visit', async () => {
    getProfile.mockResolvedValue({ created_at: daysAgo(5) });
    render(<MilestoneStoryPrompt lang="en" userId="m1" />);
    expect(await screen.findByText('How do you like Full Balance?')).toBeInTheDocument();
  });

  it('waits until the day after signup', async () => {
    rememberAccountCreated('m1', daysAgo(0.2));
    const { container } = render(<MilestoneStoryPrompt lang="en" userId="m1" />);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(container).toBeEmptyDOMElement();
  });

  it('opens the public review for 4-5 stars and private feedback for 1-3', async () => {
    rememberAccountCreated('m1', daysAgo(3));
    const { unmount } = render(<MilestoneStoryPrompt lang="en" userId="m1" />);
    fireEvent.click(await screen.findByRole('button', { name: '5/5' }));
    expect(screen.getByText('Share your experience')).toBeInTheDocument();
    unmount();
    localStorage.removeItem('fb_review_prompt:m1'); sessionStorage.clear();
    render(<MilestoneStoryPrompt lang="en" userId="m1" />);
    fireEvent.click(await screen.findByRole('button', { name: '2/5' }));
    expect(screen.getByText('What should we improve?')).toBeInTheDocument();
  });

  it('respects not now for a month', async () => {
    rememberAccountCreated('m1', daysAgo(3));
    const { unmount } = render(<MilestoneStoryPrompt lang="en" userId="m1" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Not now' }));
    unmount(); sessionStorage.clear();
    const { container } = render(<MilestoneStoryPrompt lang="en" userId="m1" />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
