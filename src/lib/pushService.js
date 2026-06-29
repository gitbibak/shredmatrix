// ══════════════════════════════════════════════
// Full Balance — Push Notification Service
// Web Push API + Supabase subscription storage
// ══════════════════════════════════════════════

import { supabase, isSupabaseReady } from './supabase';

// VAPID public key
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

const PUSH_PREF_KEY = 'fb_push_permission';
const PUSH_SUB_KEY = 'fb_push_subscription';

/**
 * Detect iOS and its version
 */
function getIOSVersion() {
  const match = navigator.userAgent.match(/OS (\d+)_(\d+)/);
  if (!match) return null;
  return { major: parseInt(match[1]), minor: parseInt(match[2]) };
}

/**
 * Check if running as standalone PWA (home screen app)
 */
export function isStandalone() {
  return (
    ('standalone' in navigator && navigator.standalone) ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

/**
 * Check if push notifications are supported on this device
 */
export function isPushSupported() {
  // Basic feature detection
  if (!('serviceWorker' in navigator)) return false;
  if (!('PushManager' in window)) return false;
  if (!('Notification' in window)) return false;

  // iOS version check: need 16.4+ and must be standalone PWA
  const ios = getIOSVersion();
  if (ios) {
    // iOS < 16.4 doesn't support web push at all
    if (ios.major < 16 || (ios.major === 16 && ios.minor < 4)) return false;
    // iOS requires standalone mode (added to home screen) for push
    if (!isStandalone()) return false;
  }

  return true;
}

/**
 * Get reason why push is not supported (for UI messaging)
 */
export function getPushUnsupportedReason() {
  if (!('serviceWorker' in navigator)) return 'no-sw';
  if (!('PushManager' in navigator)) return 'no-push-api';
  if (!('Notification' in window)) return 'no-notification-api';

  const ios = getIOSVersion();
  if (ios) {
    if (ios.major < 16 || (ios.major === 16 && ios.minor < 4)) return 'ios-old';
    if (!isStandalone()) return 'ios-not-standalone';
  }

  return 'unknown';
}

/**
 * Get current notification permission status
 */
export function getPermissionStatus() {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission; // 'default', 'granted', 'denied'
}

/**
 * Check if user has dismissed the push prompt recently (24h cooldown)
 */
export function wasRecentlyDismissed() {
  try {
    const dismissed = localStorage.getItem(PUSH_PREF_KEY);
    if (!dismissed) return false;
    return (Date.now() - parseInt(dismissed)) < 24 * 60 * 60 * 1000;
  } catch { return false; }
}

/**
 * Mark push prompt as dismissed
 */
export function dismissPushPrompt() {
  try { localStorage.setItem(PUSH_PREF_KEY, String(Date.now())); } catch {}
}

/**
 * Convert URL-safe base64 to Uint8Array for VAPID key
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribe to push notifications
 * Returns { success: true, subscription } or { success: false, reason: string }
 */
export async function subscribeToPush() {
  // Pre-flight checks
  if (!VAPID_PUBLIC_KEY) {
    return { success: false, reason: 'vapid-missing' };
  }

  if (!isPushSupported()) {
    return { success: false, reason: getPushUnsupportedReason() };
  }

  try {
    // Step 1: Request permission (must be triggered by user gesture on iOS)
    let permission;
    try {
      permission = await Notification.requestPermission();
    } catch (permErr) {
      // Some browsers need callback style
      permission = await new Promise((resolve) => {
        Notification.requestPermission(resolve);
      });
    }

    if (permission !== 'granted') {
      return { success: false, reason: permission === 'denied' ? 'denied' : 'dismissed' };
    }

    // Step 2: Get service worker registration
    let registration;
    try {
      registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error('SW timeout')), 10000)),
      ]);
    } catch (swErr) {
      return { success: false, reason: 'sw-not-ready' };
    }

    // Step 3: Subscribe to push
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      } catch (subErr) {
        return { success: false, reason: 'subscribe-failed', detail: subErr?.message };
      }
    }

    // Step 4: Save to Supabase
    await saveSubscription(subscription);

    // Step 5: Cache locally
    try {
      localStorage.setItem(PUSH_SUB_KEY, JSON.stringify(subscription.toJSON()));
    } catch {}

    // Step 6: Send welcome notification
    try {
      await registration.showNotification('🔔 Bildirimler Açık!', {
        body: 'Antrenman hatırlatmaları ve motivasyon mesajları alacaksın!',
        icon: '/icon-192.png',
        badge: '/favicon-32.png',
        tag: 'fb-welcome',
        vibrate: [100, 50, 100],
      });
    } catch {}

    return { success: true, subscription };
  } catch (err) {
    return { success: false, reason: 'unknown', detail: err?.message };
  }
}

/**
 * Save push subscription to Supabase
 */
async function saveSubscription(subscription) {
  if (!isSupabaseReady()) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const sub = subscription.toJSON();
    await supabase.from('push_subscriptions').upsert({
      user_id: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys?.p256dh || '',
      auth: sub.keys?.auth || '',
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });
  } catch (err) {
    console.warn('[Push] Save subscription failed:', err?.message || err);
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }

    // Remove from Supabase
    if (isSupabaseReady()) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('push_subscriptions').delete().eq('user_id', user.id);
      }
    }

    localStorage.removeItem(PUSH_SUB_KEY);
  } catch (err) {
    console.warn('[Push] Unsubscribe failed:', err?.message || err);
  }
}

/**
 * Send a local notification (for testing / instant feedback)
 */
export async function sendLocalNotification(title, body, tag = 'fb-local') {
  if (Notification.permission !== 'granted') return;

  try {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/favicon-32.png',
      tag,
      vibrate: [100, 50, 100],
      data: { url: '/dashboard' },
    });
  } catch (err) {
    console.warn('[Push] Local notification failed:', err?.message || err);
  }
}
