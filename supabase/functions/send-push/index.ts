// ══════════════════════════════════════════════
// Full Balance — Push Notification Edge Function
// Sends scheduled push notifications to all subscribers
// ══════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

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

// ── Standards-compliant Web Push (RFC 8291) ──
webpush.setVapidDetails(
  'mailto:info@fullbalance.app',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
);

async function sendPushNotification(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload), {
      TTL: 86400,
      urgency: 'normal',
    });
    return { success: true };
  } catch (err) {
    const status = Number(err?.statusCode || err?.status || 0);
    if (status === 404 || status === 410) {
      return { success: false, expired: true, status };
    }
    console.error('Push send error:', err);
    return { success: false, status, error: err?.message || 'Push failed' };
  }
}

// ── Main Handler ────────────────────────────────

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const cronSecret = req.headers.get('x-cron-secret') || '';
    const { data: authorized, error: authError } = await supabase.rpc(
      'verify_push_cron_secret',
      { candidate: cronSecret },
    );

    if (authError || authorized !== true) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
