import { supabase, isSupabaseReady } from './supabase';
import { normalizeReminders } from '../../supabase/functions/send-push/reminderSchedule';

async function currentUser() {
  if (!isSupabaseReady()) throw new Error('not-connected');
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) throw new Error('not-signed-in');
  return data.user;
}

export async function loadReminderPreferences() {
  const user = await currentUser();
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('reminder_settings,notification_hour,timezone')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  return {
    subscribed: Boolean(data),
    settings: normalizeReminders(
      data?.reminder_settings,
      data?.notification_hour,
    ),
    timezone: data?.timezone,
  };
}

export async function saveReminderPreferences(settings, language) {
  const user = await currentUser();
  const normalized = normalizeReminders(settings);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const { data, error } = await supabase
    .from('push_subscriptions')
    .update({
      reminder_settings: normalized,
      language,
      timezone,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('not-subscribed');
  return normalized;
}
