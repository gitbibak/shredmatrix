import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SupportCard from './SupportCard';
import { isSupportEnabled, supportCopy } from '../data/support';
import { trackEvent } from '../lib/analytics';

vi.mock('../lib/analytics', () => ({ trackEvent: vi.fn() }));

const URL = 'https://buymeacoffee.com/fullbalance';

describe('SupportCard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('stays hidden until a support page is configured', () => {
    const { container } = render(<SupportCard lang="tr" placement="profile" url="" />);
    expect(container).toBeEmptyDOMElement();
    expect(isSupportEnabled('')).toBe(false);
    expect(isSupportEnabled('http://insecure.example')).toBe(false);
    expect(isSupportEnabled(URL)).toBe(true);
  });

  it('opens the support page in a new tab, tracks the click and explains why on request', () => {
    render(<SupportCard lang="en" placement="profile" url={URL} />);
    const link = screen.getByRole('link', { name: /Buy me a protein shake/ });
    expect(link).toHaveAttribute('href', URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    fireEvent.click(link);
    expect(trackEvent).toHaveBeenCalledWith('support_link_click', { placement: 'profile', language: 'en' });
    expect(screen.queryByText(/make a living/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Why support?' }));
    expect(screen.getByText(/make a living and build new projects/)).toBeInTheDocument();
  });

  it('shows a short line after a workout without a popup', () => {
    render(<SupportCard lang="es" placement="workout_complete" variant="inline" url={URL} />);
    expect(screen.getByText(supportCopy.es.afterWorkout)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has the same keys in every language', () => {
    const keys = Object.keys(supportCopy.tr).sort();
    expect(Object.keys(supportCopy.en).sort()).toEqual(keys);
    expect(Object.keys(supportCopy.es).sort()).toEqual(keys);
  });
});
