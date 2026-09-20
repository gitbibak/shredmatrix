import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UserStoryForm from './UserStoryForm';
import { submitTestimonial } from '../lib/dataService';
vi.mock('../lib/dataService', () => ({ submitTestimonial: vi.fn() }));
describe('review consent and submission', () => {
  beforeEach(() => vi.resetAllMocks());
  it('requires an explicit rating and consent and accepts a negative review', async () => {
    submitTestimonial.mockResolvedValue({});
    const done = vi.fn();
    render(<UserStoryForm lang="en" onSubmitted={done} />);
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: '1/5' }));
    fireEvent.change(screen.getByPlaceholderText('Your Full Balance experience'), { target: { value: 'The app needs improvements to the meal tracking experience.' } });
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Thank you');
    expect(submitTestimonial).toHaveBeenCalledWith(expect.objectContaining({ rating: 1, consentPublic: true }));
    expect(done).toHaveBeenCalledOnce();
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
});
