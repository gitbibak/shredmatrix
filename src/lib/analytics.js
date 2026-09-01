import { supabase } from './supabase';
import { getAcquisitionContext, getFirstTouchAttribution, readCreatorCode, readReferralCode } from './acquisition';
import { validateGrowthEvent } from './analyticsEventSchema';

const CONSENT_KEY = 'fullbalance_analytics_consent';
const LOCAL_KEY = 'fb_analytics';
const QUEUE_KEY = 'fb_growth_event_queue';
const ANONYMOUS_ID_KEY = 'fb_anonymous_id';
const DEBUG_KEY = 'fb_analytics_debug';
const VISITOR_SESSION_KEY = 'fb_visitor_started';
const AUTH_INTENT_KEY = 'fb_analytics_auth_intent';
const MAX_QUEUE_SIZE = 100;
const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-FEVV3EFSW2';
const SENSITIVE_PARAM_PATTERN = /name|email|phone|weight|bmi|body|fat|allerg|health|condition|sleep_hours|message|subject|user_id/i;

let configured = false;
let identifiedUserId = null;
let flushTimer = null;

function randomId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const value = Math.floor(Math.random() * 16);
    return (character === 'x' ? value : (value & 0x3) | 0x8).toString(16);
  });
}

export function getAnonymousId() {
  try {
    const stored = localStorage.getItem(ANONYMOUS_ID_KEY);
    if (/^[0-9a-f-]{36}$/i.test(stored || '')) return stored;
    const id = randomId();
    localStorage.setItem(ANONYMOUS_ID_KEY, id);
    return id;
  } catch {
    return randomId();
  }
}

function ensureDataLayer() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
}

function cleanParams(params = {}) {
  return Object.fromEntries(Object.entries(params).filter(([key, value]) => {
    if (SENSITIVE_PARAM_PATTERN.test(key)) return false;
    if (!['string', 'number', 'boolean'].includes(typeof value)) return false;
    if (typeof value === 'number' && !Number.isFinite(value)) return false;
    return String(value).length <= 100;
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

function readQueue() {
  try {
    const value = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    return Array.isArray(value) ? value.slice(-MAX_QUEUE_SIZE) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE_SIZE))); } catch { /* Optional queue. */ }
}

function debugLog(action, payload) {
  if (!import.meta.env.DEV) return;
  try {
    if (localStorage.getItem(DEBUG_KEY) === '1') console.debug(`[GrowthAnalytics] ${action}`, payload);
  } catch { /* Debugging is optional. */ }
}

export function setAnalyticsDebug(enabled) {
  try { localStorage.setItem(DEBUG_KEY, enabled ? '1' : '0'); } catch { /* Debugging is optional. */ }
}

function enqueueEvent(eventName, properties) {
  if (typeof window === 'undefined') return;
  const queue = readQueue();
  queue.push({
    client_event_id: randomId(),
    anonymous_id: getAnonymousId(),
    event_name: eventName,
    event_version: 1,
    properties,
    page_path: String(window.location.pathname || '/').slice(0, 160),
    app_language: ['tr', 'en', 'es'].includes(document.documentElement.lang) ? document.documentElement.lang : null,
    occurred_at: new Date().toISOString(),
  });
  writeQueue(queue);
  debugLog('queued', queue.at(-1));
}

function scheduleFlush() {
  if (!identifiedUserId || flushTimer) return;
  flushTimer = globalThis.setTimeout(() => {
    flushTimer = null;
    flushAnalyticsQueue().catch(() => {});
  }, 50);
}

export async function flushAnalyticsQueue() {
  if (!supabase || !identifiedUserId) return false;
  const queue = readQueue();
  if (queue.length === 0) return true;
  try {
    const payload = queue.map((event) => ({ ...event, user_id: identifiedUserId }));
    const { error } = await supabase.from('growth_events').insert(payload);
    if (error) throw error;
    const sentIds = new Set(queue.map((event) => event.client_event_id));
    writeQueue(readQueue().filter((event) => !sentIds.has(event.client_event_id)));
    debugLog('flushed', { count: payload.length });
    return true;
  } catch (error) {
    debugLog('flush_failed', error?.message || error);
    return false;
  }
}

async function syncFirstTouchProfile(userId, language) {
  if (!supabase || !userId) return;
  const firstTouch = getFirstTouchAttribution(language);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('first_source,first_medium,first_campaign,first_referral_code,first_creator_code,first_landing_page')
      .eq('id', userId)
      .single();
    if (error || !data) return;
    const missing = Object.fromEntries(Object.entries(firstTouch).filter(([key, value]) => value && !data[key]));
    if (Object.keys(missing).length > 0) await supabase.from('profiles').update(missing).eq('id', userId);
  } catch (error) {
    debugLog('identity_sync_failed', error?.message || error);
  }
}

export function identifyUser(userId, language) {
  if (!/^[0-9a-f-]{36}$/i.test(String(userId || ''))) return;
  identifiedUserId = userId;
  void syncFirstTouchProfile(userId, language);
  scheduleFlush();
}

export function clearAnalyticsIdentity() {
  identifiedUserId = null;
}

function configureGoogleAnalytics() {
  if (typeof window === 'undefined' || configured || !MEASUREMENT_ID || !/^G-[A-Z0-9]+$/i.test(MEASUREMENT_ID)) return false;
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
  if (normalized === 'granted' && configureGoogleAnalytics()) trackPageView(document.title, window.location.pathname);
}

export function initAnalytics(language) {
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
    if (!sessionStorage.getItem(VISITOR_SESSION_KEY)) {
      sessionStorage.setItem(VISITOR_SESSION_KEY, '1');
      const acquisition = getAcquisitionContext(language);
      trackEvent('visitor_started', {
        source: acquisition.acquisition_source || 'direct',
        language: acquisition.app_language || language || 'en',
      });
    }
  } catch { /* Storage restrictions must not affect the app. */ }
}

/**
 * @template {import('./analyticsTypes').GrowthEventName} T
 * @param {T} eventName
 * @param {import('./analyticsTypes').GrowthEventProperties<T>} [params]
 */
export function trackEvent(eventName, params = {}) {
  try {
    if (!/^[a-z][a-z0-9_]{0,39}$/.test(eventName)) return;
    const clean = cleanParams(params);
    const validation = validateGrowthEvent(eventName, clean);
    if (!validation.valid) {
      debugLog('invalid_event', { eventName, properties: clean });
      return;
    }
    recordLocalEvent(eventName);
    enqueueEvent(eventName, validation.properties);
    scheduleFlush();
    if (getAnalyticsConsent() === 'granted' && configured && window.gtag) window.gtag('event', eventName, validation.properties);
  } catch (error) {
    debugLog('track_failed', error?.message || error);
  }
}

function trackLegacyEvent(eventName, params = {}) {
  try {
    if (!/^[a-z][a-z0-9_]{0,39}$/.test(eventName)) return;
    const clean = cleanParams(params);
    recordLocalEvent(eventName);
    enqueueEvent(eventName, clean);
    scheduleFlush();
    if (getAnalyticsConsent() === 'granted' && configured && window.gtag) window.gtag('event', eventName, clean);
  } catch (error) {
    debugLog('legacy_track_failed', error?.message || error);
  }
}

export function trackPageView(title, path = window.location.pathname) {
  const cleanPath = String(path || '/').split('?')[0].split('#')[0];
  trackLegacyEvent('page_view', {
    page_title: String(title || 'Full Balance').slice(0, 100),
    page_path: cleanPath,
    page_location: `${window.location.origin}${cleanPath}`,
  });
}

function signupProperties(method) {
  const acquisition = getAcquisitionContext();
  return {
    method,
    acquisitionSource: acquisition.acquisition_source || 'direct',
    referralCode: readReferralCode() || undefined,
    creatorCode: readCreatorCode() || undefined,
    campaign: acquisition.acquisition_campaign || undefined,
  };
}

function writeAuthIntent(kind, method) {
  try { localStorage.setItem(AUTH_INTENT_KEY, JSON.stringify({ kind, method })); } catch { /* Optional attribution. */ }
}

function clearAuthIntent() {
  try { localStorage.removeItem(AUTH_INTENT_KEY); } catch { /* Optional attribution. */ }
}

export const trackSignUpStart = (method = 'email') => {
  writeAuthIntent('signup', method);
  trackEvent('signup_started', signupProperties(method));
};
export const trackSignUp = (method = 'email') => {
  clearAuthIntent();
  const properties = signupProperties(method);
  trackEvent('signup_completed', properties);
  if (properties.referralCode) trackEvent('referral_signup_completed', { ...properties, referralCode: properties.referralCode });
  if (properties.creatorCode) trackEvent('creator_signup_completed', { ...properties, creatorCode: properties.creatorCode });
};
export const trackLoginStart = (method = 'email') => {
  writeAuthIntent('login', method);
  trackLegacyEvent('login_start', { method });
};
export const trackLogin = (method = 'email') => {
  clearAuthIntent();
  trackEvent('login_completed', { method });
};
export function trackPendingAuthCompletion() {
  try {
    const intent = JSON.parse(localStorage.getItem(AUTH_INTENT_KEY) || 'null');
    if (!intent || !['signup', 'login'].includes(intent.kind)) return;
    clearAuthIntent();
    if (intent.kind === 'signup') trackSignUp(intent.method || 'oauth');
    else trackLogin(intent.method || 'oauth');
  } catch {
    clearAuthIntent();
  }
}
export const trackGeneratePlan = (params = {}) => trackEvent('plan_generation_started', params);
export const trackPlanCreated = (params = {}) => trackEvent('plan_generated', {
  language: params.language,
  goalType: params.goal || params.goalType,
  environment: params.environment,
});

// Compatibility helpers keep existing UI modules decoupled from analytics providers.
export const trackAuthView = () => trackLegacyEvent('auth_view');
export const trackLandingCta = (placement = 'unknown') => trackLegacyEvent('landing_cta_click', { placement });
export const trackCompleteWorkout = (module) => trackEvent('workout_completed', { module });
export const trackLogWater = (targetReached = false) => trackEvent('water_logged', { targetReached });
export const trackLogSleep = () => trackEvent('sleep_logged', {});
export const trackShare = (method) => trackLegacyEvent('share', { method });
export const trackReferral = () => {
  const referralCode = readReferralCode();
  if (referralCode) trackEvent('referral_link_opened', { referralCode, source: 'invite_link' });
};
export const trackChallengeComplete = (challengeId = 'daily') => trackEvent('challenge_completed', {
  challengeId,
  challengeType: 'daily',
  source: 'dashboard',
});

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
