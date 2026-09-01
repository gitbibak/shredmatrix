export type AnalyticsPrimitive = string | number | boolean | null;
export type AnalyticsProperties = Record<string, AnalyticsPrimitive | undefined>;

export type AcquisitionSource = string;
export type ShareDestination = 'copy' | 'whatsapp' | 'native' | 'download' | 'other';

export interface GrowthEventMap {
  visitor_started: { source?: string; language?: string };
  signup_started: SignupProperties;
  signup_completed: SignupProperties;
  login_completed: { method?: string };
  onboarding_started: { source?: string; goalType?: string };
  onboarding_step_completed: { stepName: string; stepNumber: number; goalType?: string };
  onboarding_completed: { goalType?: string; environment?: string };
  plan_generation_started: { goalType?: string; environment?: string; language?: string };
  plan_generated: { goalType?: string; environment?: string; language?: string };
  workout_started: { module?: string; source?: string };
  workout_completed: { module?: string; source?: string };
  nutrition_logged: { source?: string; category?: string; photoAssisted?: boolean };
  water_logged: { source?: string; targetReached?: boolean };
  sleep_logged: { source?: string };
  meditation_completed: { source?: string };
  balance_score_viewed: { source?: string };
  balance_score_shared: ShareProperties;
  challenge_viewed: ChallengeProperties;
  challenge_joined: ChallengeProperties;
  challenge_day_completed: ChallengeProperties & { challengeDay?: number };
  challenge_completed: ChallengeProperties;
  invite_opened: { source?: string; referralCode?: string };
  invite_sent: ShareProperties & { referralCode?: string };
  invite_accepted: { source?: string; referralCode?: string };
  accountability_partner_connected: { source?: string };
  weekly_progress_viewed: { source?: string; period?: string };
  weekly_progress_shared: ShareProperties & { period?: string };
  creator_link_opened: { source?: string; creatorCode: string; campaign?: string };
  creator_signup_completed: SignupProperties & { creatorCode: string };
  referral_link_opened: { source?: string; referralCode: string; campaign?: string };
  referral_signup_completed: SignupProperties & { referralCode: string };
}

export interface ChallengeProperties {
  challengeId: string;
  challengeType: string;
  source?: string;
  referralCode?: string;
}

export interface ShareProperties {
  cardType: string;
  destination: ShareDestination;
  source?: string;
}

export interface SignupProperties {
  method?: string;
  acquisitionSource?: AcquisitionSource;
  referralCode?: string;
  creatorCode?: string;
  campaign?: string;
}

export type GrowthEventName = keyof GrowthEventMap;
export type GrowthEventProperties<T extends GrowthEventName> = GrowthEventMap[T];

