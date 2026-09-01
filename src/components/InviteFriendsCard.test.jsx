import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import InviteFriendsCard, { buildInviteMessage } from './InviteFriendsCard';
import { LanguageProvider } from '../i18n/LanguageContext';

const getReferralSummary = vi.fn();
vi.mock('../lib/dataService', () => ({
  getReferralSummary: (...args) => getReferralSummary(...args),
}));
vi.mock('../lib/analytics', () => ({ trackEvent: vi.fn(), trackShare: vi.fn() }));

const t = (key) => ({
  'referral.message': 'generic',
  'referral.messagePersonal': '{name} invites you',
  'referral.messageStreak': '{name} streak {days}',
  'referral.messageWorkout': '{name} workout {count}',
}[key] || key);

describe('buildInviteMessage', () => {
  it('prefers the most specific social proof available', () => {
    expect(buildInviteMessage(t, { userName: 'Ada', workoutCount: 3 })).toBe('Ada workout 3');
    expect(buildInviteMessage(t, { userName: 'Ada', streak: 5 })).toBe('Ada streak 5');
    expect(buildInviteMessage(t, { userName: 'Ada' })).toBe('Ada invites you');
    expect(buildInviteMessage(t, {})).toBe('generic');
  });
});

describe('InviteFriendsCard', () => {
  beforeEach(() => {
    getReferralSummary.mockReset();
    localStorage.clear();
    localStorage.setItem('shredmatrix_lang', 'en');
  });

  it('shows the member code and invite counts from the server', async () => {
    getReferralSummary.mockResolvedValue({ code: 'FBTEST22', invited: 2, activated: 1 });
    render(<LanguageProvider><InviteFriendsCard surface="profile" userName="Ada" /></LanguageProvider>);
    await waitFor(() => expect(screen.getByText('FBTEST22')).toBeInTheDocument());
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
  });

  it('still renders when the summary is unavailable', async () => {
    getReferralSummary.mockRejectedValue(new Error('offline'));
    render(<LanguageProvider><InviteFriendsCard compact /></LanguageProvider>);
    expect(await screen.findByText('WhatsApp')).toBeInTheDocument();
    expect(screen.queryByText('Joined via invite')).not.toBeInTheDocument();
  });
});
