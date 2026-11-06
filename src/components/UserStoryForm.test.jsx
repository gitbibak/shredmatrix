import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UserStoryForm from './UserStoryForm';
import { submitTestimonial } from '../lib/dataService';
vi.mock('../lib/dataService', () => ({ submitTestimonial: vi.fn(), getUserId: vi.fn(() => 'member-1') }));
describe('review consent and submission', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); sessionStorage.clear(); });
  it('requires an explicit rating and accepts a negative public review', async () => {
    submitTestimonial.mockResolvedValue({});
    const done = vi.fn();
    render(<UserStoryForm lang="en" onSubmitted={done} />);
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: '1/5' }));
    fireEvent.change(screen.getByPlaceholderText('Your Full Balance experience'), { target: { value: 'The app needs improvements to the meal tracking experience.' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByRole('status')).toHaveTextContent('may be published');
    expect(submitTestimonial).toHaveBeenCalledWith(expect.objectContaining({ rating: 1, consentPublic: true }));
    expect(done).toHaveBeenCalledWith({ rating: 1, consentPublic: true });
  });
  it('sends private feedback when publication consent is not given', async () => {
    submitTestimonial.mockResolvedValue({});
    render(<UserStoryForm lang="en" />);
    fireEvent.click(screen.getByRole('button', { name: '4/5' }));
    fireEvent.change(screen.getByPlaceholderText('Your Full Balance experience'), { target: { value: 'Great plans, but the shopping list could group items by aisle.' } });
    expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByRole('status')).toHaveTextContent('will not be published');
    expect(submitTestimonial).toHaveBeenCalledWith(expect.objectContaining({ consentPublic: false }));
  });
  it('never shows a consent box in improvement mode and prefills the rating', async () => {
    submitTestimonial.mockResolvedValue({});
    render(<UserStoryForm lang="tr" mode="improve" initialRating={2} />);
    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(screen.getByRole('button', { name: '2/5' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.change(screen.getByPlaceholderText('Neyi değiştirmeliyiz?'), { target: { value: 'Antrenman videoları daha hızlı açılmalı, bazen bekliyorum.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gönder' }));
    expect(await screen.findByRole('status')).toHaveTextContent('yayınlanmayacak');
    expect(submitTestimonial).toHaveBeenCalledWith(expect.objectContaining({ rating: 2, consentPublic: false, resultSummary: '' }));
  });
  it('keeps the draft and allows a retry on failure', async () => {
    submitTestimonial.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({});
    render(<UserStoryForm lang="en" />);
    fireEvent.click(screen.getByRole('button', { name: '3/5' }));
    const body = screen.getByPlaceholderText('Your Full Balance experience');
    fireEvent.change(body, { target: { value: 'The weekly plans help me maintain a consistent routine.' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await screen.findByText(/Could not send/);
    expect(body).toHaveValue('The weekly plans help me maintain a consistent routine.');
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Thank you');
  });

  it('thanks a happy reviewer with one support line, but never after criticism', async () => {
    submitTestimonial.mockResolvedValue({});
    const { unmount } = render(<UserStoryForm lang="en" />);
    fireEvent.click(screen.getByRole('button', { name: '5/5' }));
    fireEvent.change(screen.getByPlaceholderText('Your Full Balance experience'), { target: { value: 'Clear plans, honest numbers and everything is completely free.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByText(/Thank you so much for the kind words/)).toBeInTheDocument();
    unmount();
    localStorage.clear(); sessionStorage.clear();

    render(<UserStoryForm lang="en" mode="improve" initialRating={2} />);
    fireEvent.change(screen.getByPlaceholderText('What should we change?'), { target: { value: 'Meal tracking takes too many taps for a quick lunch.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await screen.findByRole('status');
    expect(screen.queryByText(/kind words/)).not.toBeInTheDocument();
  });
});
