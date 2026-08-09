import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import InstallPrompt from './InstallPrompt';

function setDevice({ userAgent, standalone = false }) {
  Object.defineProperty(navigator, 'userAgent', { value: userAgent, configurable: true });
  Object.defineProperty(navigator, 'platform', { value: 'iPhone', configurable: true });
  Object.defineProperty(navigator, 'maxTouchPoints', { value: 5, configurable: true });
  Object.defineProperty(navigator, 'standalone', { value: standalone, configurable: true });

  window.matchMedia = vi.fn((query) => ({
    matches: query === '(display-mode: standalone)' ? standalone : query === '(pointer: coarse)',
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

function renderPrompt() {
  return render(
    <LanguageProvider>
      <InstallPrompt />
    </LanguageProvider>,
  );
}

describe('InstallPrompt', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('shredmatrix_lang', 'tr');
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('guides iPhone users and does not ask again after confirmation', async () => {
    setDevice({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1' });
    const firstRender = renderPrompt();

    await act(async () => vi.advanceTimersByTime(2600));
    fireEvent.click(screen.getByRole('button', { name: 'Ana Ekrana Ekle' }));
    expect(screen.getByText("Safari'de Paylaş simgesine dokunup Ana Ekrana Ekle'yi seç.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ekledim' }));
    expect(localStorage.getItem('fullbalance_install_confirmed')).toBe('true');
    firstRender.unmount();

    renderPrompt();
    await act(async () => vi.advanceTimersByTime(2600));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the native Android install prompt and remembers acceptance', async () => {
    setDevice({ userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36' });
    renderPrompt();

    const prompt = vi.fn();
    const installEvent = new Event('beforeinstallprompt');
    Object.defineProperties(installEvent, {
      prompt: { value: prompt },
      userChoice: { value: Promise.resolve({ outcome: 'accepted' }) },
    });

    act(() => window.dispatchEvent(installEvent));
    await act(async () => vi.advanceTimersByTime(2600));
    fireEvent.click(screen.getByRole('button', { name: 'Ana Ekrana Ekle' }));
    await act(async () => Promise.resolve());

    expect(prompt).toHaveBeenCalledOnce();
    expect(localStorage.getItem('fullbalance_install_confirmed')).toBe('true');
  });

  it('stays hidden when the app already runs from the home screen', async () => {
    setDevice({ userAgent: 'Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1', standalone: true });
    renderPrompt();

    await act(async () => vi.advanceTimersByTime(3000));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
