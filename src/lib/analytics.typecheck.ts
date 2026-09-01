import { trackEvent } from './analytics.js';

trackEvent('challenge_joined', {
  challengeId: 'starter-21',
  challengeType: 'system',
  source: 'dashboard',
  referralCode: 'FB1234',
});
trackEvent('balance_score_shared', {
  cardType: 'balance_score',
  destination: 'native',
  source: 'profile',
});
trackEvent('signup_completed', {
  acquisitionSource: 'google',
  campaign: 'home_workout',
});

// @ts-expect-error challenge identity is mandatory.
trackEvent('challenge_joined', { source: 'dashboard' });
// @ts-expect-error health measurements are not valid analytics properties.
trackEvent('signup_completed', { weight: 80 });
// @ts-expect-error unknown events must be added to the central contract first.
trackEvent('unregistered_growth_event', {});
