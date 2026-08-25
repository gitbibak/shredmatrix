import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';
import { getDailyNotification } from './notificationContent.js';

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || '';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

webpush.setVapidDetails('mailto:info@fullbalance.app', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

function getLocalSchedule(timezone: string, now = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return { hour: Number(values.hour), date: `${values.year}-${values.month}-${values.day}` };
  } catch {
    return getLocalSchedule('UTC', now);
  }
}

async function sendPushNotification(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload), { TTL: 43200, urgency: 'normal' });
    return { success: true };
  } catch (error) {
    const status = Number(error?.statusCode || error?.status || 0);
    return { success: false, expired: status === 404 || status === 410, status };
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'POST' },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const cronSecret = req.headers.get('x-cron-secret') || '';
    const { data: authorized, error: authError } = await supabase.rpc('verify_push_cron_secret', { candidate: cronSecret });
    if (authError || authorized !== true) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth, language, timezone, notification_hour, last_notified_on');
    if (error) throw error;

    let sent = 0;
    let failed = 0;
    let skipped = 0;
    const expiredIds = [];

    for (const subscription of subscriptions || []) {
      const local = getLocalSchedule(subscription.timezone || 'UTC');
      const preferredHour = Number(subscription.notification_hour || 9);
      if (local.hour !== preferredHour || subscription.last_notified_on === local.date) {
        skipped += 1;
        continue;
      }

      const message = getDailyNotification(subscription.language, local.date, subscription.id);
      const result = await sendPushNotification(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
        message,
      );

      if (result.success) {
        sent += 1;
        await supabase.from('push_subscriptions').update({ last_notified_on: local.date }).eq('id', subscription.id);
      } else {
        failed += 1;
        if (result.expired) expiredIds.push(subscription.id);
      }
    }

    if (expiredIds.length > 0) {
      await supabase.from('push_subscriptions').delete().in('id', expiredIds);
    }

    return new Response(JSON.stringify({ sent, failed, skipped, expired_cleaned: expiredIds.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error?.message || 'Push delivery failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
