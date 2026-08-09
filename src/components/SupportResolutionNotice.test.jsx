import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../i18n/LanguageContext';
import SupportResolutionNotice from './SupportResolutionNotice';

const mocks = vi.hoisted(() => ({
  getLatestResolvedSupportTicket: vi.fn(),
  sendLocalNotification: vi.fn(),
}));

vi.mock('../lib/supportService', () => ({
  getLatestResolvedSupportTicket: mocks.getLatestResolvedSupportTicket,
}));

vi.mock('../lib/pushService', () => ({
  sendLocalNotification: mocks.sendLocalNotification,
}));

const ticket = {
  id: 42,
  subject: 'Hesap sorunu',
  admin_note: 'Sorun giderildi.',
};

function renderNotice(pathname) {
  return render(
    <LanguageProvider>
      <MemoryRouter initialEntries={[pathname]}>
        <SupportResolutionNotice user={{ id: 'user-1' }} />
      </MemoryRouter>
    </LanguageProvider>,
  );
}

describe('SupportResolutionNotice', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('shredmatrix_lang', 'tr');
    mocks.getLatestResolvedSupportTicket.mockResolvedValue(ticket);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('marks the latest resolution as seen when support is opened', async () => {
    renderNotice('/contact?resolved=42');

    await waitFor(() => {
      expect(localStorage.getItem('fullbalance_support_seen_user-1')).toBe('42');
    });
    expect(screen.queryByText('Hesap sorunu')).not.toBeInTheDocument();
  });

  it('does not show the same notice again after its response is viewed', async () => {
    renderNotice('/dashboard');

    fireEvent.click(await screen.findByRole('button', { name: 'Yanıtı gör' }));
    expect(localStorage.getItem('fullbalance_support_seen_user-1')).toBe('42');
    await waitFor(() => expect(screen.queryByText('Hesap sorunu')).not.toBeInTheDocument());
  });
});
