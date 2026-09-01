export interface AcquisitionContext {
  acquisition_source: string | null;
  acquisition_medium: string | null;
  acquisition_campaign: string | null;
  acquisition_content: string | null;
  acquisition_term: string | null;
  landing_path: string;
  app_language: 'tr' | 'en' | 'es';
  browser_locale: string | null;
  time_zone: string | null;
  referral_code?: string | null;
  creator_code?: string | null;
  first_source: string | null;
  first_medium: string | null;
  first_campaign: string | null;
  first_referral_code: string | null;
  first_creator_code: string | null;
  first_landing_page: string | null;
}

export function captureAcquisitionContext(language?: string): AcquisitionContext;
export function getAcquisitionContext(language?: string): AcquisitionContext;
export function getFirstTouchAttribution(language?: string): Pick<
  AcquisitionContext,
  'first_source' | 'first_medium' | 'first_campaign' | 'first_referral_code' | 'first_creator_code' | 'first_landing_page'
>;

