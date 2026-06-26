// ══════════════════════════════════════════════
// Full Balance — Push Notification Service
// Web Push API + Supabase subscription storage
// ══════════════════════════════════════════════

import { supabase, isSupabaseReady } from './supabase';

// VAPID public key — generate with: npx web-push generate-vapid-keys
// Replace this with your actual VAPID public key
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

const PUSH_PREF_KEY = 'fb_push_permission';
const PUSH_SUB_KEY = 'fb_push_subscription';

/**
 * Check if push notifications are supported
 */
export function isPushSupported() {
  return 'serviceWorker' in navigator &&
         'PushManager' in window &&
         'Notification' in window;
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
 */
export async function subscribeToPush() {
  if (!isPushSupported() || !VAPID_PUBLIC_KEY) {
    console.warn('[Push] Not supported or VAPID key missing');
    return null;
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[Push] Permission denied');
      return null;
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Create new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // Save to Supabase if available
    await saveSubscription(subscription);

    // Cache locally
    try {
      localStorage.setItem(PUSH_SUB_KEY, JSON.stringify(subscription.toJSON()));
    } catch {}

    console.log('[Push] Subscribed successfully');
    return subscription;
  } catch (err) {
    console.warn('[Push] Subscription failed:', err?.message || err);
    return null;
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
    console.log('[Push] Unsubscribed');
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
