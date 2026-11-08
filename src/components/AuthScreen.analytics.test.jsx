import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import { initAnalytics } from '../lib/analytics';
import { signIn, signInWithGoogle, signUp } from '../lib/dataService';
import AuthScreen from './AuthScreen';

vi.mock('../lib/supabase', () => ({ supabase: null }));
vi.mock('../lib/dataService', () => ({
  signUp: vi.fn(),
  signIn: vi.fn(),
  resetPassword: vi.fn(),
  signInWithGoogle: vi.fn(),
}));

function renderRegistration() {
  const onAuth = vi.fn();
  render(<MemoryRouter><LanguageProvider><AuthScreen onAuth={onAuth} /></LanguageProvider></MemoryRouter>);
  return onAuth;
}

function submitRegistration() {
  fireEvent.change(screen.getByLabelText('Your Name'), { target: { value: 'Test' } });
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'TestPassword123!' } });
  fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'TestPassword123!' } });
  fireEvent.click(screen.getByRole('button', { name: 'CREATE ACCOUNT' }));
}

function googleSignupEvents() {
  return window.dataLayer.filter((entry) => entry[0] === 'event' && entry[1] === 'signup_completed');
}

describe('optional analytics before registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('shredmatrix_lang', 'en');
    window.history.replaceState({}, '', '/auth?mode=register&lang=en');
    document.head.querySelectorAll('script[data-fullbalance-ga]').forEach((script) => script.remove());
    delete window.gtag;
    delete window.dataLayer;
    initAnalytics('en');
    signUp.mockResolvedValue({
      user: { id: 'test-user', email: 'test@example.com', user_metadata: { name: 'Test' } },
      session: {},
    });
  });

  it('offers the optional choice inline before the registration form and any auth request', async () => {
    renderRegistration();
    const choice = await screen.findByRole('dialog', { name: 'Allow anonymous usage analytics?' });
    expect(choice).not.toHaveClass('fixed');
    expect(choice.compareDocumentPosition(screen.getByLabelText('Your Name')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Do not allow' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Allow anonymous analytics' })).toBeEnabled();
    expect(signUp).not.toHaveBeenCalled();
    expect(document.querySelector('script[data-fullbalance-ga]')).toBeNull();
  });

  it.each(['undecided', 'denied'])('allows registration while consent is %s without sending it to Google', async (choice) => {
    const onAuth = renderRegistration();
    const decline = await screen.findByRole('button', { name: 'Do not allow' });
    if (choice === 'denied') fireEvent.click(decline);
    submitRegistration();
    await waitFor(() => expect(onAuth).toHaveBeenCalledOnce());
    expect(signUp).toHaveBeenCalledOnce();
    expect(googleSignupEvents()).toHaveLength(0);
    expect(document.querySelector('script[data-fullbalance-ga]')).toBeNull();
  });

  it.each(['granted', 'denied'])('hides the choice when %s is already saved', async (choice) => {
    localStorage.setItem('fullbalance_analytics_consent', choice);
    renderRegistration();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CREATE ACCOUNT' })).toBeEnabled();
  });

  it('sends the completed registration after consent is granted before submission', async () => {
    const onAuth = renderRegistration();
    fireEvent.click(await screen.findByRole('button', { name: 'Allow anonymous analytics' }));
    expect(googleSignupEvents()).toHaveLength(0);
    submitRegistration();
    await waitFor(() => expect(onAuth).toHaveBeenCalledOnce());
    expect(googleSignupEvents()).toHaveLength(1);
    expect(googleSignupEvents()[0][2]).toMatchObject({ method: 'email' });
  });

  it('offers Google before email fields with consent first and legal links beside the choice', async () => {
    renderRegistration();
    const choice = await screen.findByRole('dialog', { name: 'Allow anonymous usage analytics?' });
    const google = screen.getByRole('button', { name: 'Continue with Google' });
    const name = screen.getByLabelText('Your Name');
    expect(choice.compareDocumentPosition(google) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(google.compareDocumentPosition(name) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/terms');
    expect(signInWithGoogle).not.toHaveBeenCalled();
  });

  it.each(['granted', 'denied'])('starts Google registration with %s analytics consent without requiring email fields', async (consent) => {
    renderRegistration();
    fireEvent.click(await screen.findByRole('button', {
      name: consent === 'granted' ? 'Allow anonymous analytics' : 'Do not allow',
    }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
    await waitFor(() => expect(signInWithGoogle).toHaveBeenCalledOnce());
    expect(signUp).not.toHaveBeenCalled();
    expect(signIn).not.toHaveBeenCalled();
    const starts = window.dataLayer.filter((entry) => entry[0] === 'event' && entry[1] === 'signup_started');
    expect(starts).toHaveLength(consent === 'granted' ? 1 : 0);
    if (consent === 'granted') expect(starts[0][2]).toMatchObject({ method: 'google' });
  });

  it('shows a Google failure next to the promoted choice and keeps email registration usable', async () => {
    signInWithGoogle.mockRejectedValueOnce(new Error('Google is temporarily unavailable'));
    const onAuth = renderRegistration();
    const google = screen.getByRole('button', { name: 'Continue with Google' });
    fireEvent.click(google);
    const error = await screen.findByRole('alert');
    expect(error).toHaveTextContent('Google is temporarily unavailable');
    expect(error.compareDocumentPosition(google) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    submitRegistration();
    await waitFor(() => expect(onAuth).toHaveBeenCalledOnce());
  });

  it('preserves login ordering and hides Google during password recovery', async () => {
    window.history.replaceState({}, '', '/auth?lang=en');
    renderRegistration();
    const email = screen.getByLabelText('Email address');
    expect(email.compareDocumentPosition(screen.getByRole('button', { name: 'Continue with Google' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Forgot Password' }));
    await screen.findByRole('button', { name: 'Send Reset Link' });
    expect(screen.queryByRole('button', { name: 'Continue with Google' })).not.toBeInTheDocument();
  });

  it('preserves the email verification confirmation and its existing Google alternative', async () => {
    signUp.mockResolvedValueOnce({ user: { id: 'test-user' }, session: null });
    signIn.mockRejectedValueOnce(new Error('Email not confirmed'));
    const onAuth = renderRegistration();
    submitRegistration();
    await waitFor(() => expect(screen.queryByLabelText('Your Name')).not.toBeInTheDocument());
    expect(screen.queryByLabelText('Email address')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Continue with Google' })).toHaveLength(1);
    expect(onAuth).not.toHaveBeenCalled();
  });

});
