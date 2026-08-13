import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import WaterTracker from './WaterTracker';

const { getWaterMock, saveWaterMock } = vi.hoisted(() => ({
  getWaterMock: vi.fn(),
  saveWaterMock: vi.fn(),
}));

vi.mock('../lib/dataService', () => ({
  getWater: getWaterMock,
  saveWater: saveWaterMock,
}));

function renderTracker(props = {}) {
  localStorage.setItem('shredmatrix_lang', 'tr');
  return render(
    <LanguageProvider>
      <WaterTracker {...props} />
    </LanguageProvider>,
  );
}

describe('WaterTracker', () => {
  beforeEach(() => {
    localStorage.clear();
    getWaterMock.mockReset().mockResolvedValue({ glasses: 8 });
    saveWaterMock.mockReset().mockResolvedValue(undefined);
  });

  it('allows logging water beyond the two-litre target', async () => {
    renderTracker();
    const addButton = await screen.findByRole('button', { name: '+1' });

    fireEvent.click(addButton);
    fireEvent.click(addButton);
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('3000')).toBeInTheDocument();
    expect(screen.getByText('%150')).toBeInTheDocument();
    expect(addButton).toBeEnabled();

    await waitFor(() => {
      expect(saveWaterMock).toHaveBeenLastCalledWith(expect.any(String), 12, true);
    });
  });

  it('keeps the compact add control enabled after the target is reached', async () => {
    renderTracker({ compact: true });
    const addButton = await screen.findByRole('button', { name: '+1' });

    expect(addButton).toBeEnabled();
    fireEvent.click(addButton);
    expect(screen.getByText('9')).toBeInTheDocument();
  });
});
