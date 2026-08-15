const BASE_URL = 'https://fullbalance.app';
const LANGUAGE_PATHS = { tr: '/', en: '/en', es: '/es' };

function safeValue(value, maxLength = 80) {
  return String(value || '').trim().slice(0, maxLength);
}

export function buildTrackedShareUrl({
  language = 'en',
  source,
  medium = 'organic',
  campaign,
  referralCode,
} = {}) {
  const path = LANGUAGE_PATHS[language] || LANGUAGE_PATHS.en;
  const url = new URL(path, BASE_URL);
  url.searchParams.set('utm_source', safeValue(source) || 'app_share');
  url.searchParams.set('utm_medium', safeValue(medium) || 'organic');
  url.searchParams.set('utm_campaign', safeValue(campaign) || `share_${language}`);

  const code = safeValue(referralCode, 16).toUpperCase();
  if (/^[A-Z0-9]{4,16}$/.test(code)) url.searchParams.set('ref', code);

  return url.toString();
}
