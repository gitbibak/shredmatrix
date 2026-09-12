import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';
import { getDailyNotification } from './notificationContent.js';
import { dueReminders, scheduledMessage } from './reminderSchedule.js';

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || '';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

webpush.setVapidDetails(
  'mailto:info@fullbalance.app',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
);

async function sendPushNotification(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload), {
      TTL: 600,
      urgency: 'normal',
      timeout: 10000,
    });
    return { success: true };
  } catch (error) {
    const status = Number(error?.statusCode || error?.status || 0);
    return {
      success: false,
      expired: status === 404 || status === 410,
      status,
    };
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

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select(
        'id, endpoint, p256dh, auth, language, timezone, notification_hour, last_notified_on, reminder_settings',
      );
    if (error) throw error;

    let sent = 0;
    let failed = 0;
    let skipped = 0;
    const expiredIds = [];

    for (const subscription of subscriptions || []) {
      const reminders = dueReminders(subscription);
      if (!reminders.length) {
        skipped += 1;
        continue;
      }

      for (const reminder of reminders) {
        const claim = {
          subscription_id: subscription.id,
          local_date: reminder.date,
          kind: reminder.kind,
          scheduled_time: reminder.time,
        };
        const { data: claimed, error: claimError } = await supabase
          .from('push_deliveries')
          .upsert(claim, {
            onConflict: 'subscription_id,local_date,kind,scheduled_time',
            ignoreDuplicates: true,
          })
          .select('subscription_id');
        if (claimError) {
          failed += 1;
          continue;
        }
        if (!claimed?.length) {
          skipped += 1;
          continue;
        }
        const message = subscription.reminder_settings
          ? scheduledMessage(subscription.language, reminder)
          : getDailyNotification(
              subscription.language,
              reminder.date,
              subscription.id,
            );
        const result = await sendPushNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          message,
        );

        if (result.success) {
          sent += 1;
          if (reminder.kind === 'workout')
            await supabase
              .from('push_subscriptions')
              .update({ last_notified_on: reminder.date })
              .eq('id', subscription.id);
        } else {
          failed += 1;
          if (result.expired) expiredIds.push(subscription.id);
          // Release failed deliveries for one retry within the short due window.
          await supabase.from('push_deliveries').delete().match(claim);
        }
      }
    }

    if (expiredIds.length > 0) {
      await supabase.from('push_subscriptions').delete().in('id', expiredIds);
    }
    await supabase
      .from('push_deliveries')
      .delete()
      .lt('created_at', new Date(Date.now() - 14 * 86400000).toISOString());

    return new Response(
      JSON.stringify({
        sent,
        failed,
        skipped,
        expired_cleaned: expiredIds.length,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error?.message || 'Push delivery failed' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
});
