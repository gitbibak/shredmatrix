// ══════════════════════════════════════════════
// Full Balance — Push Notification Edge Function
// Sends scheduled push notifications to all subscribers
// ══════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || '';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// ── Notification Templates ──────────────────────
const NOTIFICATION_SCHEDULES = {
  morning: {
    hours: [8, 9, 10], // 08:00-10:00 arası
    messages: [
      { title: '🏋️ Günaydın!', body: 'Bugünkü antrenman planın hazır. Harekete geç! 💪', category: 'workout' },
      { title: '☀️ Günaydın!', body: 'Güne bir bardak su ile başla! Metabolizmanı ateşle 🔥', category: 'water' },
      { title: '💪 Antrenman Zamanı!', body: 'Bugün kendini daha güçlü hissetmek için 1 saat yeter!', category: 'workout' },
    ],
  },
  midday: {
    hours: [12, 13, 14], // 12:00-14:00 arası
    messages: [
      { title: '💧 Su İçme Zamanı', body: 'Günün yarısı geçti! Su hedefine ne kadar yakınsın?', category: 'water' },
      { title: '🍽️ Öğle Molası', body: 'Protein ağırlıklı bir öğün, kas gelişimini destekler!', category: 'motivation' },
    ],
  },
  afternoon: {
    hours: [15, 16, 17], // 15:00-17:00 arası
    messages: [
      { title: '⚡ Öğleden Sonra Motivasyonu', body: 'Bugün antrenmanını yaptın mı? Her gün bir adım daha!', category: 'workout' },
      { title: '💧 Su Hatırlatması', body: 'Bir bardak daha! Günlük hedefe ulaş 💪', category: 'water' },
    ],
  },
  evening: {
    hours: [20, 21, 22], // 20:00-22:00 arası
    messages: [
      { title: '🌙 İyi Geceler!', body: 'Yarın daha güçlü olmak için bugün erken yat! 😴', category: 'sleep' },
      { title: '📊 Günlük Özet', body: 'Bugünkü hedeflerini kontrol et. Yarın daha iyisini yapabilirsin!', category: 'streak' },
    ],
  },
  streak_reminder: {
    hours: [18, 19], // 18:00-19:00 arası (giriş yapmayanlara)
    messages: [
      { title: '🔥 Serini Koru!', body: 'Bugün henüz giriş yapmadın! Serin kırılmasın 💥', category: 'streak' },
      { title: '🎯 Hedefini Unutma!', body: 'Bugünkü antrenmanını tamamla, harika gidiyorsun!', category: 'motivation' },
    ],
  },
};

// ── Web Push with VAPID (RFC 8291 + RFC 8188) ──
// Simplified push sender using fetch to push service endpoint

async function importVapidKeys() {
  // Decode URL-safe base64 private key
  const padding = '='.repeat((4 - (VAPID_PRIVATE_KEY.length % 4)) % 4);
  const base64 = (VAPID_PRIVATE_KEY + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawKey = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    rawKey,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  return privateKey;
}

function base64UrlEncode(data) {
  const str = typeof data === 'string' ? data : String.fromCharCode(...new Uint8Array(data));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createVapidAuthHeader(endpoint) {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 3600,
    sub: 'mailto:info@fullbalance.app',
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(unsignedToken);

  try {
    const privateKey = await importVapidKeys();
    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      privateKey,
      data
    );

    // Convert DER signature to raw r||s format (64 bytes)
    const sigArray = new Uint8Array(signature);
    let r, s;
    if (sigArray.length === 64) {
      r = sigArray.slice(0, 32);
      s = sigArray.slice(32, 64);
    } else {
      // DER format
      const rLen = sigArray[3];
      r = sigArray.slice(4, 4 + rLen);
      const sLen = sigArray[5 + rLen];
      s = sigArray.slice(6 + rLen, 6 + rLen + sLen);
      // Pad/trim to 32 bytes
      if (r.length > 32) r = r.slice(r.length - 32);
      if (s.length > 32) s = s.slice(s.length - 32);
      if (r.length < 32) r = new Uint8Array([...new Array(32 - r.length).fill(0), ...r]);
      if (s.length < 32) s = new Uint8Array([...new Array(32 - s.length).fill(0), ...s]);
    }
    const rawSig = new Uint8Array([...r, ...s]);
    const signatureB64 = base64UrlEncode(rawSig);

    return {
      authorization: `vapid t=${unsignedToken}.${signatureB64}, k=${VAPID_PUBLIC_KEY}`,
    };
  } catch (err) {
    console.error('VAPID signing failed:', err);
    throw err;
  }
}

async function sendPushNotification(subscription, payload) {
  try {
    const vapidHeaders = await createVapidAuthHeader(subscription.endpoint);

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        ...vapidHeaders,
        'Content-Type': 'application/json',
        'TTL': '86400',
        'Urgency': 'normal',
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 201 || response.status === 200) {
      return { success: true };
    } else if (response.status === 404 || response.status === 410) {
      // Subscription expired — should be removed
      return { success: false, expired: true, status: response.status };
    } else {
      const text = await response.text();
      console.warn(`Push failed (${response.status}):`, text);
      return { success: false, status: response.status };
    }
  } catch (err) {
    console.error('Push send error:', err);
    return { success: false, error: err.message };
  }
}

// ── Main Handler ────────────────────────────────

Deno.serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Determine current time slot (UTC+3 for Turkey)
    const now = new Date();
    const turkeyHour = (now.getUTCHours() + 3) % 24;

    // Find matching schedule
    let selectedMessages = [];
    for (const [, schedule] of Object.entries(NOTIFICATION_SCHEDULES)) {
      if (schedule.hours.includes(turkeyHour)) {
        selectedMessages = [...selectedMessages, ...schedule.messages];
      }
    }

    // If no schedule matches, use a random motivation message
    if (selectedMessages.length === 0) {
      return new Response(JSON.stringify({
        message: `No notifications scheduled for hour ${turkeyHour} (Turkey time)`,
        sent: 0,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Pick a random message from matched ones
    const message = selectedMessages[Math.floor(Math.random() * selectedMessages.length)];

    // Get all push subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error) throw error;
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriptions found', sent: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send to all subscribers
    let sent = 0;
    let failed = 0;
    const expiredIds = [];

    for (const sub of subscriptions) {
      const result = await sendPushNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        {
          title: message.title,
          body: message.body,
          category: message.category,
          url: '/dashboard',
        }
      );

      if (result.success) {
        sent++;
      } else {
        failed++;
        if (result.expired) {
          expiredIds.push(sub.id);
        }
      }
    }

    // Clean up expired subscriptions
    if (expiredIds.length > 0) {
      await supabase.from('push_subscriptions').delete().in('id', expiredIds);
    }

    return new Response(JSON.stringify({
      message: `Push notifications sent (Turkey hour: ${turkeyHour})`,
      notification: message,
      sent,
      failed,
      expired_cleaned: expiredIds.length,
      total_subscribers: subscriptions.length,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
