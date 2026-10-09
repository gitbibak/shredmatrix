import { beforeEach, describe, expect, it, vi } from 'vitest';
import { captureAcquisitionContext, getFirstTouchAttribution, recordAcquisitionContent } from './acquisition';

describe('first-party acquisition attribution', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    window.history.replaceState({}, '', '/en?utm_source=google&utm_medium=cpc&utm_campaign=free_fitness');
  });

  it('keeps a direct arrival direct after returning from Google sign-in', () => {
    window.history.replaceState({}, '', '/en');
    vi.spyOn(document, 'referrer', 'get').mockReturnValue('');
    captureAcquisitionContext('en');

    window.history.replaceState({}, '', '/auth');
    vi.spyOn(document, 'referrer', 'get').mockReturnValue('https://accounts.google.com/');

    expect(captureAcquisitionContext('en')).toMatchObject({
      acquisition_source: 'direct',
      acquisition_medium: 'none',
      first_source: 'direct',
      first_landing_page: '/en',
    });
  });

  it('does not credit Google sign-in when no acquisition context was retained', () => {
    window.history.replaceState({}, '', '/auth');
    vi.spyOn(document, 'referrer', 'get').mockReturnValue('https://accounts.google.com/');

    expect(captureAcquisitionContext('en')).toMatchObject({
      acquisition_source: 'direct',
      acquisition_medium: 'none',
      first_source: 'direct',
    });
  });

  it.each(['www.google.com', 'www.google.co.uk'])('preserves a genuine search referrer from %s', (host) => {
    window.history.replaceState({}, '', '/en');
    vi.spyOn(document, 'referrer', 'get').mockReturnValue(`https://${host}/search?q=fitness`);

    expect(captureAcquisitionContext('en')).toMatchObject({
      acquisition_source: 'google',
      acquisition_medium: 'referral',
    });
  });

  it('preserves tagged campaign attribution through a Google sign-in return', () => {
    vi.spyOn(document, 'referrer', 'get').mockReturnValue('https://accounts.google.com/');
    expect(captureAcquisitionContext('en').acquisition_source).toBe('google');
    window.history.replaceState({}, '', '/auth');

    expect(captureAcquisitionContext('en')).toMatchObject({
      acquisition_source: 'google',
      acquisition_medium: 'cpc',
      acquisition_campaign: 'free_fitness',
      landing_path: '/en',
    });
  });

  it('captures campaign and language without storing the full query string', () => {
    const context = captureAcquisitionContext('en');

    expect(context).toMatchObject({
      acquisition_source: 'google',
      acquisition_medium: 'cpc',
      acquisition_campaign: 'free_fitness',
      landing_path: '/en',
      app_language: 'en',
    });
    expect(JSON.stringify(context)).not.toContain('?utm_');
  });

  it('does not replace a campaign with a later direct visit', () => {
    captureAcquisitionContext('en');
    window.history.replaceState({}, '', '/auth?mode=register');

    expect(captureAcquisitionContext('en').acquisition_source).toBe('google');
  });

  it('preserves first-touch while allowing later conversion attribution', () => {
    captureAcquisitionContext('en');
    window.history.replaceState({}, '', '/es?utm_source=pinterest&utm_campaign=pilates');
    const context = captureAcquisitionContext('es');

    expect(context).toMatchObject({
      acquisition_source: 'pinterest',
      first_source: 'google',
      first_campaign: 'free_fitness',
      first_landing_page: '/en',
    });
    expect(getFirstTouchAttribution('es').first_source).toBe('google');
  });

  it('captures referral and creator codes without keeping the query string', () => {
    window.history.replaceState({}, '', '/en?ref=fb12ab&creator=coach_42&utm_source=creator');
    const context = captureAcquisitionContext('en');

    expect(context).toMatchObject({
      referral_code: 'FB12AB',
      creator_code: 'COACH_42',
      first_referral_code: 'FB12AB',
      first_creator_code: 'COACH_42',
      first_landing_page: '/en',
    });
  });

  it('records the first internal conversion content without replacing campaign attribution', () => {
    captureAcquisitionContext('en');
    recordAcquisitionContent('seo_en_home_workout_hero');
    recordAcquisitionContent('seo_en_home_workout_nav');

    expect(captureAcquisitionContext('en')).toMatchObject({
      acquisition_source: 'google',
      acquisition_campaign: 'free_fitness',
      acquisition_content: 'seo_en_home_workout_hero',
    });
  });
});
