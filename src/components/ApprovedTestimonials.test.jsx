import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ApprovedTestimonials from './ApprovedTestimonials';
import { getApprovedTestimonials } from '../lib/dataService';
vi.mock('../lib/dataService', () => ({ getApprovedTestimonials: vi.fn() }));
describe('approved public reviews', () => {
  it('requests the page language and shows no fake verification label', async () => {
    getApprovedTestimonials.mockResolvedValue([{ id: '1', language: 'en', rating: 4, body: 'A genuine experience' }, { id: '2', language: 'tr', rating: 5, body: 'Different language' }]);
    render(<ApprovedTestimonials language="en" />);
    expect(await screen.findByText('A genuine experience')).toBeInTheDocument();
    expect(getApprovedTestimonials).toHaveBeenCalledWith(3, 'en');
    expect(screen.queryByText('Different language')).not.toBeInTheDocument();
    expect(screen.queryByText(/Verified user/)).not.toBeInTheDocument();
  });
});
