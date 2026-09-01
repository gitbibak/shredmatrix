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
    return referrer.origin === window.location.origin ? null : normalizeSource(referrer.hostname);
  } catch {
    return null;
  }
}

function normalizeSource(hostname) {
  const host = clean(hostname, 100)?.toLowerCase().replace(/^www\./, '');
  if (!host) return null;
  if (host === 'chatgpt.com' || host.endsWith('.chatgpt.com') || host === 'chat.openai.com') return 'chatgpt.com';
  if (host.startsWith('google.') || host.includes('.google.')) return 'google';
  if (host.startsWith('bing.') || host.includes('.bing.')) return 'bing';
  if (host === 'perplexity.ai' || host.endsWith('.perplexity.ai')) return 'perplexity.ai';
  if (host === 'instagram.com' || host.endsWith('.instagram.com')) return 'instagram';
  if (host.startsWith('pinterest.') || host.includes('.pinterest.')) return 'pinterest';
  if (host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be') return 'youtube';
  if (host === 'reddit.com' || host.endsWith('.reddit.com')) return 'reddit';
  if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) return 'tiktok';
  if (host === 'x.com' || host.endsWith('.x.com') || host === 't.co') return 'x';
  return host;
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

  // A tagged URL can remain in the address bar while the visitor moves through
  // the page. Keep the first measured CTA when a later read has no utm_content.
  if (hasCampaign && stored?.acquisition_content && !fresh.acquisition_content) {
    result.acquisition_content = stored.acquisition_content;
  }

  // Invite attribution: the latest valid invite code wins so the inviter gets credit.
  const referralCode = readReferralCode();
  if (referralCode) result.referral_code = referralCode;

  writeStored(result);
  return result;
}

export function readReferralCode() {
  try {
    const code = String(localStorage.getItem('fb_referred_by') || '').trim().toUpperCase();
    return /^[A-Z0-9]{4,16}$/.test(code) ? code : null;
  } catch {
    return null;
  }
}

export function getAcquisitionContext(language) {
  return captureAcquisitionContext(language);
}

export function recordAcquisitionContent(content) {
  const value = clean(content, 120);
  if (!value || typeof window === 'undefined') return;
  const stored = readStored() || captureAcquisitionContext();
  if (stored.acquisition_content) return;
  writeStored({ ...stored, acquisition_content: value });
}
