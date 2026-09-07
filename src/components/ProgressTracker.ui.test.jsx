import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProgressTracker from './ProgressTracker';
import { getProgress, saveProgress, deleteProgress } from '../lib/dataService';

vi.mock('../lib/dataService', () => ({ getProgress: vi.fn(), saveProgress: vi.fn(), deleteProgress: vi.fn() }));
vi.mock('../i18n/LanguageContext', () => ({ useTranslation: () => ({ t: (key) => key }) }));
vi.mock('./ToastProvider', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));

describe('progress persistence', () => {
  beforeEach(() => { vi.clearAllMocks(); getProgress.mockResolvedValue([]); });
  it('keeps entered measurements when saving fails', async () => {
    saveProgress.mockRejectedValue(new Error('offline'));
    render(<ProgressTracker />);
    await waitFor(() => expect(getProgress).toHaveBeenCalled());
    fireEvent.change(screen.getByLabelText('progress.weight'), { target: { value: '82' } });
    fireEvent.click(screen.getByText('progress.save'));
    await waitFor(() => expect(saveProgress).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText('progress.save')).not.toBeDisabled());
    expect(screen.getByLabelText('progress.weight')).toHaveValue(82);
  });
  it('does not hide a record when deletion fails', async () => {
    getProgress.mockResolvedValue([{ date: '2026-09-01', weight: 82, bodyFat: 20 }]);
    deleteProgress.mockRejectedValue(new Error('offline'));
    render(<ProgressTracker />);
    fireEvent.click(await screen.findByText('progress.recordHistory'));
    const button = screen.getByRole('button', { name: 'common.delete 2026-09-01' });
    fireEvent.click(button);
    await waitFor(() => expect(deleteProgress).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: 'common.delete 2026-09-01' })).toBeInTheDocument();
  });
  it('blocks invalid weights and body fat values', () => {
    render(<ProgressTracker />);
    fireEvent.change(screen.getByLabelText('progress.weight'), { target: { value: '900' } });
    expect(screen.getByText('progress.save')).toBeDisabled();
    fireEvent.change(screen.getByLabelText('progress.weight'), { target: { value: '82' } });
    fireEvent.change(screen.getByLabelText('progress.bodyFat'), { target: { value: '90' } });
    expect(screen.getByText('progress.save')).toBeDisabled();
    expect(saveProgress).not.toHaveBeenCalled();
  });
});
