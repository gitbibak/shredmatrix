import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import { getWorkoutLogs, getWellbeingCheckins, hasSubmittedTestimonial } from '../lib/dataService';
import { dismissPushPrompt, subscribeToPush } from '../lib/pushService';
import MilestoneStoryPrompt from './MilestoneStoryPrompt';
import PushPermission from './PushPermission';

vi.mock('../lib/dataService', () => ({
  getWorkoutLogs: vi.fn(),
  hasSubmittedTestimonial: vi.fn(),
  getWellbeingCheckins: vi.fn(),
  submitTestimonial: vi.fn(),
}));

vi.mock('../lib/pushService', () => ({
  isPushSupported: vi.fn(() => true),
  getPermissionStatus: vi.fn(() => 'default'),
  wasRecentlyDismissed: vi.fn(() => false),
  dismissPushPrompt: vi.fn(),
  subscribeToPush: vi.fn(),
}));

vi.mock('../lib/analytics', () => ({ trackEvent: vi.fn() }));

function withLanguage(component) {
  localStorage.setItem('shredmatrix_lang', 'en');
  return render(<LanguageProvider>{component}</LanguageProvider>);
}

describe('retention nudges', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    getWorkoutLogs.mockResolvedValue([]);
    hasSubmittedTestimonial.mockResolvedValue(false);
    getWellbeingCheckins.mockResolvedValue([]);
    HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  });

  it('asks for reminder permission only after the user has received value', async () => {
    subscribeToPush.mockResolvedValue({ success: true });
    withLanguage(<PushPermission daysSinceJoin={2} />);

    expect(await screen.findByText(/Keep your plan moving tomorrow/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Enable reminder/i }));

    expect(subscribeToPush).toHaveBeenCalledWith({ language: 'en' });
    expect(await screen.findByText(/Reminders are on/i)).toBeInTheDocument();
  });

  it('respects dismissal instead of repeatedly asking', async () => {
    withLanguage(<PushPermission daysSinceJoin={3} />);
    expect(await screen.findByText(/Keep your plan moving tomorrow/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /Later/i })[0]);
    expect(dismissPushPrompt).toHaveBeenCalledOnce();
    expect(screen.queryByText(/Keep your plan moving tomorrow/i)).not.toBeInTheDocument();
  });

  it('requests a review after three sessions and opens the form directly', async () => {
    getWorkoutLogs.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);
    render(<MilestoneStoryPrompt lang="en" userId="a" />);

    expect(await screen.findByText(/How is Full Balance working for you/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Write a short review/i }));
    expect(screen.getByRole('dialog')).toHaveAttribute('open');
    expect(screen.getByPlaceholderText('Your Full Balance experience')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('includes wellbeing users after three distinct check-in days', async () => {
    getWellbeingCheckins.mockResolvedValue([{ date: '2026-09-16' }, { date: '2026-09-17' }, { date: '2026-09-18' }]);
    render(<MilestoneStoryPrompt lang="en" userId="a" />);
    expect(await screen.findByRole('button', { name: 'Write a short review' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Not now' }));
    expect(JSON.parse(localStorage.getItem('fb_review_prompt:a')).dismissedAt).toBeGreaterThan(0);
  });

  it('respects never ask and isolates preferences between accounts', async () => {
    getWorkoutLogs.mockResolvedValue([{}, {}, {}]);
    const view = render(<MilestoneStoryPrompt lang="en" userId="a" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Do not ask again' }));
    view.unmount();
    expect(JSON.parse(localStorage.getItem('fb_review_prompt:a')).never).toBe(true);
    const same = render(<MilestoneStoryPrompt lang="en" userId="a" />);
    expect(screen.queryByRole('button', { name: 'Write a short review' })).not.toBeInTheDocument();
    same.unmount();
    render(<MilestoneStoryPrompt lang="en" userId="b" />);
    expect(await screen.findByRole('button', { name: 'Write a short review' })).toBeInTheDocument();
  });

  it('waits 30 days after dismissal, then allows a new invitation', async () => {
    getWorkoutLogs.mockResolvedValue([{}, {}, {}]);
    localStorage.setItem('fb_review_prompt:a', JSON.stringify({ dismissedAt: Date.now() - 29 * 86400000 }));
    const recent = render(<MilestoneStoryPrompt lang="en" userId="a" />);
    expect(getWorkoutLogs).not.toHaveBeenCalled();
    recent.unmount();
    localStorage.setItem('fb_review_prompt:a', JSON.stringify({ dismissedAt: Date.now() - 31 * 86400000 }));
    render(<MilestoneStoryPrompt lang="en" userId="a" />);
    expect(await screen.findByRole('button', { name: 'Write a short review' })).toBeInTheDocument();
  });

  it('does not prompt after a lookup failure', async () => {
    hasSubmittedTestimonial.mockRejectedValue(new Error('offline'));
    getWorkoutLogs.mockResolvedValue([{}, {}, {}]);
    render(<MilestoneStoryPrompt lang="en" userId="a" />);
    await vi.waitFor(() => expect(hasSubmittedTestimonial).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'Write a short review' })).not.toBeInTheDocument();
  });

  it('does not ask a new user or a user who has already submitted', async () => {
    hasSubmittedTestimonial.mockResolvedValue(true);
    getWorkoutLogs.mockResolvedValue([{}, {}, {}]);
    render(<MilestoneStoryPrompt lang="en" userId="a" />);
    await vi.waitFor(() => expect(hasSubmittedTestimonial).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'Write a short review' })).not.toBeInTheDocument();
  });
});
