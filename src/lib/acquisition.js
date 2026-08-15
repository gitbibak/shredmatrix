const STORAGE_KEY = 'fb_acquisition';
const SUPPORTED_LANGUAGES = ['tr', 'en', 'es'];

function clean(value, maxLength = 120) {
  const printable = [...String(value || '')]
    .filter((character) => character.charCodeAt(0) >= 32)
    .join('');
  return printable.trim().slice(0, maxLength) || null;
}

function readStored() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return value && typeof value === 'object' ? value : null;
  } catch {
    return null;
  }
}

function writeStored(value) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { /* Optional attribution. */ }
}

function externalReferrer() {
  try {
    if (!document.referrer) return null;
    const referrer = new URL(document.referrer);
    return referrer.origin === window.location.origin ? null : clean(referrer.hostname, 100);
  } catch {
    return null;
  }
}

export function captureAcquisitionContext(language) {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const hasCampaign = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
    .some((key) => params.has(key));
  const stored = readStored();
  const referrer = externalReferrer();
  const detectedLanguage = clean(navigator.language, 10)?.slice(0, 2).toLowerCase();
  const appLanguage = SUPPORTED_LANGUAGES.includes(language)
    ? language
    : SUPPORTED_LANGUAGES.includes(document.documentElement.lang)
      ? document.documentElement.lang
      : SUPPORTED_LANGUAGES.includes(detectedLanguage) ? detectedLanguage : 'en';

  const fresh = {
    acquisition_source: clean(params.get('utm_source'), 80) || referrer || 'direct',
    acquisition_medium: clean(params.get('utm_medium'), 80) || (referrer ? 'referral' : 'none'),
    acquisition_campaign: clean(params.get('utm_campaign'), 120),
    acquisition_content: clean(params.get('utm_content'), 120),
    acquisition_term: clean(params.get('utm_term'), 120),
    landing_path: clean(window.location.pathname, 160) || '/',
    app_language: appLanguage,
    browser_locale: clean(navigator.language, 20),
    time_zone: clean(Intl.DateTimeFormat().resolvedOptions().timeZone, 60),
  };

  // Preserve the first meaningful visit, but replace a previous direct visit
  // when the person later arrives through a tagged campaign before signup.
  const result = !stored || hasCampaign || stored.acquisition_source === 'direct'
    ? { ...stored, ...fresh }
    : { ...fresh, ...stored, app_language: appLanguage };

  writeStored(result);
  return result;
}

export function getAcquisitionContext(language) {
  return captureAcquisitionContext(language);
}
