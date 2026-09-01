const COMMON = ['source', 'language', 'goalType', 'module'];
const SIGNUP = ['method', 'acquisitionSource', 'referralCode', 'creatorCode', 'campaign'];
const CHALLENGE = ['challengeId', 'challengeType', 'source', 'referralCode'];
const SHARE = ['cardType', 'destination', 'source'];

export const GROWTH_EVENT_SCHEMAS = Object.freeze({
  visitor_started: { allowed: ['source', 'language'] },
  signup_started: { allowed: SIGNUP },
  signup_completed: { allowed: SIGNUP },
  login_completed: { allowed: ['method'] },
  onboarding_started: { allowed: ['source', 'goalType'] },
  onboarding_step_completed: { allowed: ['stepName', 'stepNumber', 'goalType'], required: ['stepName', 'stepNumber'] },
  onboarding_completed: { allowed: ['goalType', 'environment'] },
  plan_generation_started: { allowed: ['goalType', 'environment', 'language'] },
  plan_generated: { allowed: ['goalType', 'environment', 'language'] },
  workout_started: { allowed: ['module', 'source'] },
  workout_completed: { allowed: ['module', 'source'] },
  nutrition_logged: { allowed: ['source', 'category', 'photoAssisted'] },
  water_logged: { allowed: ['source', 'targetReached'] },
  sleep_logged: { allowed: ['source'] },
  meditation_completed: { allowed: ['source'] },
  balance_score_viewed: { allowed: ['source'] },
  balance_score_shared: { allowed: SHARE, required: ['cardType', 'destination'] },
  challenge_viewed: { allowed: CHALLENGE, required: ['challengeId', 'challengeType'] },
  challenge_joined: { allowed: CHALLENGE, required: ['challengeId', 'challengeType'] },
  challenge_day_completed: { allowed: [...CHALLENGE, 'challengeDay'], required: ['challengeId', 'challengeType'] },
  challenge_completed: { allowed: CHALLENGE, required: ['challengeId', 'challengeType'] },
  invite_opened: { allowed: ['source', 'referralCode'] },
  invite_sent: { allowed: [...SHARE, 'referralCode'], required: ['cardType', 'destination'] },
  invite_accepted: { allowed: ['source', 'referralCode'] },
  accountability_partner_connected: { allowed: ['source'] },
  weekly_progress_viewed: { allowed: ['source', 'period'] },
  weekly_progress_shared: { allowed: [...SHARE, 'period'], required: ['cardType', 'destination'] },
  creator_link_opened: { allowed: ['source', 'creatorCode', 'campaign'], required: ['creatorCode'] },
  creator_signup_completed: { allowed: SIGNUP, required: ['creatorCode'] },
  referral_link_opened: { allowed: ['source', 'referralCode', 'campaign'], required: ['referralCode'] },
  referral_signup_completed: { allowed: SIGNUP, required: ['referralCode'] },
});

export const GROWTH_EVENT_NAMES = Object.freeze(Object.keys(GROWTH_EVENT_SCHEMAS));

export function validateGrowthEvent(eventName, properties = {}) {
  const schema = GROWTH_EVENT_SCHEMAS[eventName];
  if (!schema) return { valid: true, properties };
  const filtered = Object.fromEntries(Object.entries(properties)
    .filter(([key]) => schema.allowed.includes(key)));
  const valid = (schema.required || []).every((key) => (
    filtered[key] !== undefined && filtered[key] !== null && filtered[key] !== ''
  ));
  return { valid, properties: filtered };
}

