import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import InstallPrompt from './InstallPrompt';

function setDevice({ userAgent, standalone = false }) {
  const iphone = userAgent.includes('iPhone');
  Object.defineProperty(navigator, 'userAgent', { value: userAgent, configurable: true });
  Object.defineProperty(navigator, 'platform', { value: iphone ? 'iPhone' : 'Linux armv8l', configurable: true });
  Object.defineProperty(navigator, 'maxTouchPoints', { value: iphone ? 5 : 1, configurable: true });
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

  it('does not ask again after an iPhone user confirms installation', async () => {
    setDevice({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1' });
    const firstRender = renderPrompt();

    await act(async () => vi.advanceTimersByTime(2600));
    fireEvent.click(screen.getByRole('button', { name: 'Ana Ekrana Ekle' }));
    expect(screen.getByText("Safari'de Paylaş simgesine dokunup Ana Ekrana Ekle'yi seç.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ekledim' }));
    await act(async () => vi.runAllTimers());
    expect(localStorage.getItem('fullbalance_install_confirmed')).toBe('true');
    firstRender.unmount();

    renderPrompt();
    await act(async () => vi.advanceTimersByTime(3000));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('snoozes the prompt after an iPhone user chooses not now', async () => {
    setDevice({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1' });
    const firstRender = renderPrompt();

    await act(async () => vi.advanceTimersByTime(2600));
    fireEvent.click(screen.getByRole('button', { name: 'Şimdi değil' }));
    expect(Number(localStorage.getItem('fullbalance_install_dismissed'))).toBeGreaterThan(0);
    firstRender.unmount();

    renderPrompt();
    await act(async () => vi.advanceTimersByTime(3000));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the native Android install prompt', async () => {
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
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Ana Ekrana Ekle' }));
      await Promise.resolve();
      await Promise.resolve();
    });

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
