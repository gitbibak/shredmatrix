/**
 * Full Balance Analytics — Event Tracking
 * GA4 + Local storage fallback
 */

export function trackEvent(eventName, params = {}) {
  // GA4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
  // Local storage for admin dashboard
  try {
    const key = 'fb_analytics';
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    const today = new Date().toISOString().split('T')[0];
    if (!data[today]) data[today] = {};
    data[today][eventName] = (data[today][eventName] || 0) + 1;
    // Keep only last 90 days
    const keys = Object.keys(data).sort();
    if (keys.length > 90) {
      keys.slice(0, keys.length - 90).forEach(k => delete data[k]);
    }
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* ignore */ }
}

// ── Convenience Functions ─────────────────────────────
export const trackSignUp = (method = 'email') => trackEvent('sign_up', { method });
export const trackLogin = (method = 'email') => trackEvent('login', { method });
export const trackGeneratePlan = (goal) => trackEvent('generate_plan', { goal });
export const trackCompleteWorkout = (focus) => trackEvent('complete_workout', { focus });
export const trackLogWater = (glasses) => trackEvent('log_water', { glasses });
export const trackLogSleep = (hours) => trackEvent('log_sleep', { hours });
export const trackShare = (method) => trackEvent('share', { method });
export const trackPageView = (page) => trackEvent('page_view', { page_title: page });
export const trackReferral = (code) => trackEvent('referral_click', { ref_code: code });
export const trackChallengeComplete = (id) => trackEvent('challenge_complete', { challenge: id });

// ── Session Init ──────────────────────────────────────
export function initAnalytics() {
  trackEvent('session_start');
  const today = new Date().toISOString().split('T')[0];
  const lastActive = localStorage.getItem('fb_last_active');
  if (lastActive !== today) {
    trackEvent('daily_active_user');
    localStorage.setItem('fb_last_active', today);
  }
}

// ── Get analytics summary (for admin) ─────────────────
export function getAnalyticsSummary(days = 30) {
  try {
    const data = JSON.parse(localStorage.getItem('fb_analytics') || '{}');
    const result = {};
    const now = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().split('T')[0];
      if (data[key]) result[key] = data[key];
    }
    return result;
  } catch { return {}; }
}
