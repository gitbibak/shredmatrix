import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import HeardFromCard from './HeardFromCard';

const getProfile = vi.fn();
const updateProfileStrict = vi.fn();
vi.mock('../lib/dataService', () => ({
  getProfile: (...args) => getProfile(...args),
  updateProfileStrict: (...args) => updateProfileStrict(...args),
}));

describe('HeardFromCard', () => {
  beforeEach(() => {
    getProfile.mockReset();
    updateProfileStrict.mockReset();
    localStorage.clear();
  });

  it('asks members without an answer and saves one tap', async () => {
    getProfile.mockResolvedValue({ id: 'u1', heard_from: null });
    updateProfileStrict.mockResolvedValue();
    render(<HeardFromCard userId="u1" lang="tr" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Instagram' }));
    await screen.findByText('Teşekkürler! Cevabın kaydedildi.');
    expect(updateProfileStrict).toHaveBeenCalledWith(expect.objectContaining({ heard_from: 'instagram' }));
  });

  it('stays hidden when already answered or before the column exists', async () => {
    getProfile.mockResolvedValueOnce({ id: 'u1', heard_from: 'google' });
    const { container, unmount } = render(<HeardFromCard userId="u1" lang="en" />);
    await waitFor(() => expect(getProfile).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
    unmount();

    getProfile.mockResolvedValueOnce({ id: 'u1', name: 'Ada' });
    const second = render(<HeardFromCard userId="u1" lang="en" />);
    await waitFor(() => expect(getProfile).toHaveBeenCalledTimes(2));
    expect(second.container).toBeEmptyDOMElement();
  });

  it('keeps the question and shows an error when saving fails', async () => {
    getProfile.mockResolvedValue({ id: 'u1', heard_from: null });
    updateProfileStrict.mockRejectedValue(new Error('offline'));
    render(<HeardFromCard userId="u1" lang="es" />);
    fireEvent.click(await screen.findByRole('button', { name: 'TikTok' }));
    await screen.findByRole('alert');
    expect(screen.getByRole('button', { name: 'TikTok' })).toBeEnabled();
  });

  it('remembers a dismissal on this device', async () => {
    getProfile.mockResolvedValue({ id: 'u1', heard_from: null });
    render(<HeardFromCard userId="u1" lang="en" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Close question' }));
    expect(screen.queryByText('How did you hear about Full Balance?')).not.toBeInTheDocument();
    expect(localStorage.getItem('fb_heard_from_dismissed:u1')).toBe('1');
  });
});
