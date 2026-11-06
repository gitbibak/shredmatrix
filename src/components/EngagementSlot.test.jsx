import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import EngagementSlot from './EngagementSlot';
import { submitSupportTicket } from '../lib/supportService';
import { trackEvent } from '../lib/analytics';
import { rememberAccountCreated } from '../lib/engagementAsks';

vi.mock('../lib/dataService', () => ({ getUserId: () => 'member-1', submitTestimonial: vi.fn() }));
vi.mock('../lib/supportService', () => ({ submitSupportTicket: vi.fn() }));
vi.mock('../lib/analytics', () => ({ trackEvent: vi.fn() }));

describe('Today engagement slot', () => {
  beforeEach(() => {
    vi.clearAllMocks(); localStorage.clear(); sessionStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-10T10:00:00Z'));
    rememberAccountCreated('member-1', '2026-10-01T10:00:00Z');
  });
  afterEach(() => vi.useRealTimers());

  it('shows the monthly founder note once and records the ask', async () => {
    render(<EngagementSlot lang="tr" />);
    expect(screen.getByText('Kurucudan bir not')).toBeInTheDocument();
    await waitFor(() => expect(trackEvent).toHaveBeenCalledWith('engagement_ask_shown', { kind: 'founder_note', placement: 'today' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kapat' }));
    expect(screen.queryByText('Kurucudan bir not')).not.toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalledWith('founder_note_action', { action: 'close', noteId: '2026-11' });
  });

  it('turns an idea into an idea ticket', async () => {
    submitSupportTicket.mockResolvedValue({ ok: true });
    render(<EngagementSlot lang="en" />);
    fireEvent.click(screen.getByRole('button', { name: 'Share an idea' }));
    fireEvent.change(screen.getByPlaceholderText('E.g. Add music to workouts'), { target: { value: 'A dark mode timer for evening sessions' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByText('Thanks! Your idea reached me.')).toBeInTheDocument();
    expect(submitSupportTicket).toHaveBeenCalledWith(expect.objectContaining({ category: 'idea', message: 'A dark mode timer for evening sessions' }));
    expect(trackEvent).toHaveBeenCalledWith('idea_submitted', { placement: 'founder_note', language: 'en' });
  });

  it('falls back to the idea box after the note was seen, and stays quiet within its cooldown', () => {
    localStorage.setItem('fb_asks:member-1', JSON.stringify({ lastShown: {}, seen: { 'note:2026-11': Date.now() } }));
    const { unmount } = render(<EngagementSlot lang="en" />);
    expect(screen.getByText('Got an idea? 💡')).toBeInTheDocument();
    unmount();
    sessionStorage.clear();
    const { container } = render(<EngagementSlot lang="en" />);
    expect(container).toBeEmptyDOMElement();
  });
});
