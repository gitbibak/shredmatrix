import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import CoachFeatureSection from './CoachFeatureSection';
import { coachMarketing } from '../data/coachMarketing';
import { trackLandingCta } from '../lib/analytics';
import { recordAcquisitionContent } from '../lib/acquisition';
vi.mock('../lib/analytics', () => ({ trackLandingCta: vi.fn() }));
vi.mock('../lib/acquisition', () => ({ recordAcquisitionContent: vi.fn() }));
describe('coach marketing section', () => {
  it.each(['tr', 'en', 'es'])('explains the actual coaching scope and tracks the CTA in %s', lang => {
    const c = coachMarketing[lang];
    render(<MemoryRouter><CoachFeatureSection lang={lang} /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: c.title })).toBeVisible();
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.getByText(c.note)).toBeVisible();
    expect(screen.getByText(c.offer)).toBeVisible();
    expect(screen.getByRole('region')).toHaveAttribute('id', 'for-trainers');
    const link = screen.getByRole('link', { name: c.cta });
    expect(link).toHaveAttribute('href', '/coach');
    fireEvent.click(link);
    expect(trackLandingCta).toHaveBeenCalledWith('coach_home_' + lang);
    expect(recordAcquisitionContent).toHaveBeenCalledWith('coach_home_' + lang);
  });
});
