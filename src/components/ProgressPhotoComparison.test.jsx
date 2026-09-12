import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProgressPhotoComparison from './ProgressPhotoComparison';
import { getProgress } from '../lib/dataService';
import { comparisonFile } from '../lib/photoComparison';
vi.mock('../i18n/LanguageContext', () => ({ useTranslation: () => ({ lang: 'en', t: key => key }) }));
vi.mock('../lib/dataService', () => ({ getProgress: vi.fn(), getMeasurements: vi.fn().mockResolvedValue([]) }));
vi.mock('../lib/photoComparison', async original => ({ ...await original(), comparisonFile: vi.fn() }));
const gallery = [{ id: 'a', date: '2026-09-01T12:00Z', src: 'a.jpg' }, { id: 'b', date: '2026-09-02T12:00Z', src: 'b.jpg' }, { id: 'c', date: '2026-09-03T12:00Z', src: 'c.jpg' }];
describe('private photo comparison', () => {
  beforeEach(() => { vi.clearAllMocks(); getProgress.mockResolvedValue([{ date: '2026-09-01', weight: 80, bodyFat: 20 }]); comparisonFile.mockResolvedValue(new File(['test'], 'test.png', { type: 'image/png' })); });
  it('shows only same-date recorded measurements, without estimating missing values', async () => {
    render(<ProgressPhotoComparison gallery={gallery} onDelete={vi.fn()} />);
    expect(await screen.findByText(/80 kg/)).toBeInTheDocument();
    expect(screen.getByText('No measurement on this date')).toBeInTheDocument();
    expect(comparisonFile).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Download image' })).toBeDisabled();
  });
  it('requires fresh consent when the selected pair changes', async () => {
    render(<ProgressPhotoComparison gallery={gallery} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByLabelText(/I agree/));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Download image' })).not.toBeDisabled());
    fireEvent.change(screen.getByLabelText('Later photo'), { target: { value: 'b' } });
    expect(screen.getByLabelText(/I agree/)).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Download image' })).toBeDisabled();
  });
  it('has a useful empty state', () => {
    render(<ProgressPhotoComparison gallery={[]} onDelete={vi.fn()} />);
    expect(screen.getByText('Add at least two photos to compare.')).toBeInTheDocument();
  });
});
