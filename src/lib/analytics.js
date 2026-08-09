const CONSENT_KEY = 'fullbalance_analytics_consent';
const LOCAL_KEY = 'fb_analytics';
const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-FEVV3EFSW2';
const SENSITIVE_PARAM_PATTERN = /name|email|phone|weight|bmi|body|fat|allerg|health|condition|sleep_hours|message|subject|user_id/i;

let configured = false;

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
}

function cleanParams(params = {}) {
  return Object.fromEntries(Object.entries(params).filter(([key, value]) => {
    if (SENSITIVE_PARAM_PATTERN.test(key)) return false;
    return ['string', 'number', 'boolean'].includes(typeof value) && String(value).length <= 100;
  }));
}

function recordLocalEvent(eventName) {
  try {
    const data = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
    const today = new Date().toISOString().split('T')[0];
    if (!data[today]) data[today] = {};
    data[today][eventName] = (data[today][eventName] || 0) + 1;
    const keys = Object.keys(data).sort();
    if (keys.length > 90) keys.slice(0, keys.length - 90).forEach((key) => delete data[key]);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch { /* Local diagnostics are optional. */ }
}

function configureGoogleAnalytics() {
  if (configured || !MEASUREMENT_ID || !/^G-[A-Z0-9]+$/i.test(MEASUREMENT_ID)) return false;
  ensureDataLayer();
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  if (!document.querySelector(`script[data-fullbalance-ga="${MEASUREMENT_ID}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    script.dataset.fullbalanceGa = MEASUREMENT_ID;
    document.head.appendChild(script);
  }
  configured = true;
  return true;
}

export function getAnalyticsConsent() {
  try { return localStorage.getItem(CONSENT_KEY); } catch { return null; }
}

export function setAnalyticsConsent(choice) {
  const normalized = choice === 'granted' ? 'granted' : 'denied';
  try { localStorage.setItem(CONSENT_KEY, normalized); } catch { /* Continue without persistence. */ }
  ensureDataLayer();
  window.gtag('consent', 'update', {
    analytics_storage: normalized,
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  if (normalized === 'granted' && configureGoogleAnalytics()) {
    trackPageView(document.title, window.location.pathname);
  }
}

export function initAnalytics() {
  if (typeof window === 'undefined') return;
  ensureDataLayer();
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500,
  });
  if (getAnalyticsConsent() === 'granted') configureGoogleAnalytics();

  recordLocalEvent('session_start');
  const today = new Date().toISOString().split('T')[0];
  try {
    if (localStorage.getItem('fb_last_active') !== today) {
      recordLocalEvent('daily_active_user');
      localStorage.setItem('fb_last_active', today);
    }
  } catch { /* Ignore storage restrictions. */ }
}

export function trackEvent(eventName, params = {}) {
  if (!/^[a-z][a-z0-9_]{0,39}$/.test(eventName)) return;
  recordLocalEvent(eventName);
  if (getAnalyticsConsent() !== 'granted' || !configured || !window.gtag) return;
  window.gtag('event', eventName, cleanParams(params));
}

export function trackPageView(title, path = window.location.pathname) {
  const cleanPath = String(path || '/').split('?')[0].split('#')[0];
  trackEvent('page_view', {
    page_title: String(title || 'Full Balance').slice(0, 100),
    page_path: cleanPath,
    page_location: `${window.location.origin}${cleanPath}`,
  });
}

export const trackSignUp = (method = 'email') => trackEvent('sign_up', { method });
export const trackLogin = (method = 'email') => trackEvent('login', { method });
export const trackGeneratePlan = () => trackEvent('generate_plan');
export const trackCompleteWorkout = () => trackEvent('complete_workout');
export const trackLogWater = () => trackEvent('log_water');
export const trackLogSleep = () => trackEvent('log_sleep');
export const trackShare = (method) => trackEvent('share', { method });
export const trackReferral = () => trackEvent('referral_click');
export const trackChallengeComplete = () => trackEvent('challenge_complete');

export function getAnalyticsSummary(days = 30) {
  try {
    const data = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
    const result = {};
    const now = new Date();
    for (let index = 0; index < days; index += 1) {
      const date = new Date(now.getTime() - index * 86_400_000);
      const key = date.toISOString().split('T')[0];
      if (data[key]) result[key] = data[key];
    }
    return result;
  } catch { return {}; }
}
