import { useEffect, useState } from 'react';
import { Bell, Check, Share, X } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { getWorkoutLogs } from '../lib/dataService';
import { trackEvent } from '../lib/analytics';
import {
  dismissPushPrompt,
  getPermissionStatus,
  isPushSupported,
  needsHomeScreenForPush,
  subscribeToPush,
  wasRecentlyDismissed,
} from '../lib/pushService';

// Reminder opt-in. On Today it waits for a returning member; right after a
// finished workout (placement "workout_complete") it asks at once, because
// that is when people say yes. On iPhone Safari, where push needs the app on
// the home screen, it explains that step instead of asking.
export default function PushPermission({ daysSinceJoin = 0, placement = 'today' }) {
  const { t, lang } = useTranslation();
  const [mode, setMode] = useState(null); // 'ask' | 'ios'
  const [subscribing, setSubscribing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  const afterWorkout = placement === 'workout_complete';

  useEffect(() => {
    let active = true;
    const decide = async () => {
      if (wasRecentlyDismissed()) return;
      if (!isPushSupported()) {
        if (!needsHomeScreenForPush()) return;
        setMode('ios');
        trackEvent('reminder_prompt_view', { language: lang, trigger: 'ios_home_screen', placement });
        return;
      }
      if (getPermissionStatus() !== 'default') return;
      let trigger = 'workout_complete';
      if (!afterWorkout) {
        const logs = await getWorkoutLogs().catch(() => []);
        if (!active || (daysSinceJoin < 2 && logs.length === 0)) return;
        trigger = logs.length > 0 ? 'first_workout' : 'return_visit';
      }
      if (!active) return;
      setMode('ask');
      trackEvent('reminder_prompt_view', { language: lang, trigger, placement });
    };
    decide();
    return () => { active = false; };
  }, [afterWorkout, daysSinceJoin, lang, placement]);

  const allow = async () => {
    setSubscribing(true);
    setError(false);
    const result = await subscribeToPush({ language: lang });
    setSubscribing(false);
    trackEvent('reminder_permission_result', { language: lang, result: result.success ? 'granted' : result.reason, placement });
    if (result.success) {
      setDone(true);
      return;
    }
    setError(true);
  };

  const dismiss = () => {
    dismissPushPrompt();
    trackEvent('reminder_prompt_dismiss', { language: lang, placement });
    setMode(null);
  };

  if (!mode) return null;

  if (mode === 'ios') {
    return (
      <section className={`relative flex items-start gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 ${afterWorkout ? 'p-3 text-left' : 'p-4'}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300"><Share size={18} /></span>
        <div className="min-w-0 flex-1 pr-7">
          <h2 className="font-outfit text-sm font-bold text-white">{t('push.iosTitle')}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">{t('push.iosDesc')}</p>
          <button type="button" onClick={dismiss} className="mt-2 min-h-10 px-1 text-xs font-semibold text-cyan-300">{t('push.iosOk')}</button>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative flex items-start gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 ${afterWorkout ? 'p-3 text-left' : 'p-4'}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
        {done ? <Check size={18} /> : <Bell size={18} />}
      </span>
      <div className="min-w-0 flex-1 pr-7">
        <h2 className="font-outfit text-sm font-bold text-white">
          {done ? t('push.enabled') : afterWorkout ? t('push.workoutTitle') : t('push.contextTitle')}
        </h2>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          {done ? t('push.enabledDesc') : afterWorkout ? t('push.workoutDesc') : t('push.contextDesc')}
        </p>
        {!done && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={allow}
              disabled={subscribing}
              className="min-h-10 rounded-lg bg-cyan-600 px-4 text-xs font-bold text-white disabled:opacity-50"
            >
              {subscribing ? t('push.enabling') : error ? t('push.retry') : afterWorkout ? t('push.workoutAllow') : t('push.allow')}
            </button>
            <button type="button" onClick={dismiss} className="min-h-10 px-3 text-xs font-semibold text-slate-400">
              {t('push.later')}
            </button>
          </div>
        )}
        {error && <p className="mt-2 text-[11px] text-red-300">{t('push.error')}</p>}
      </div>
      {!done && (
        <button type="button" onClick={dismiss} aria-label={t('push.later')} className="absolute right-3 top-3 p-2 text-slate-500">
          <X size={16} />
        </button>
      )}
    </section>
  );
}
