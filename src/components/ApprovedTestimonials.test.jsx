import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ApprovedTestimonials from './ApprovedTestimonials';
import { getApprovedTestimonials } from '../lib/dataService';
vi.mock('../lib/dataService', () => ({ getApprovedTestimonials: vi.fn() }));
describe('approved public reviews', () => {
  it('loads additional reviews without filtering low ratings', async () => {
    getApprovedTestimonials.mockResolvedValueOnce(Array.from({ length: 12 }, (_, i) => ({ id: String(i), language: 'en', rating: 1, body: 'Review ' + i }))).mockResolvedValueOnce([{ id: '12', language: 'en', rating: 2, body: 'Next review' }]);
    render(<ApprovedTestimonials language="en" all />);
    fireEvent.click(await screen.findByRole('button', { name: 'More reviews' }));
    expect(await screen.findByText('Next review')).toBeInTheDocument();
    expect(screen.getByText('Review 0')).toBeInTheDocument();
    expect(getApprovedTestimonials).toHaveBeenLastCalledWith(12, 'en', 12);
  });
  it('offers retry on an error rather than claiming there are no reviews', async () => {
    getApprovedTestimonials.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([]);
    render(<ApprovedTestimonials language="en" all />);
    fireEvent.click(await screen.findByRole('button', { name: 'Could not load reviews. Retry.' }));
    expect(await screen.findByText('No published reviews yet.')).toBeInTheDocument();
  });
  it('requests the page language and shows no fake verification label', async () => {
    getApprovedTestimonials.mockResolvedValue([{ id: '1', language: 'en', rating: 4, body: 'A genuine experience' }, { id: '2', language: 'tr', rating: 5, body: 'Different language' }]);
    render(<ApprovedTestimonials language="en" />);
    expect(await screen.findByText('A genuine experience')).toBeInTheDocument();
    expect(getApprovedTestimonials).toHaveBeenCalledWith(3, 'en');
    expect(screen.queryByText('Different language')).not.toBeInTheDocument();
    expect(screen.queryByText(/Verified user/)).not.toBeInTheDocument();
  });
});
