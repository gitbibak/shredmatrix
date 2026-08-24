import { beforeEach, describe, expect, it } from 'vitest';
import { captureAcquisitionContext, recordAcquisitionContent } from './acquisition';

describe('first-party acquisition attribution', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/en?utm_source=google&utm_medium=cpc&utm_campaign=free_fitness');
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
