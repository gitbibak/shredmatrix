import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import { getWorkoutLogs, getWellbeingCheckins, hasSubmittedTestimonial } from '../lib/dataService';
import { dismissPushPrompt, subscribeToPush } from '../lib/pushService';
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
});
