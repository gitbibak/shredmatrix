import { useEffect, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { getWorkoutLogs } from '../lib/dataService';
import { trackEvent } from '../lib/analytics';
import {
  dismissPushPrompt,
  getPermissionStatus,
  isPushSupported,
  subscribeToPush,
  wasRecentlyDismissed,
} from '../lib/pushService';

export default function PushPermission({ daysSinceJoin = 0 }) {
  const { t, lang } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const decide = async () => {
      if (!isPushSupported() || getPermissionStatus() !== 'default' || wasRecentlyDismissed()) return;
      const logs = await getWorkoutLogs().catch(() => []);
      if (!active || (daysSinceJoin < 2 && logs.length === 0)) return;
      setVisible(true);
      trackEvent('reminder_prompt_view', { language: lang, trigger: logs.length > 0 ? 'first_workout' : 'return_visit' });
    };
    decide();
    return () => { active = false; };
  }, [daysSinceJoin, lang]);

  const allow = async () => {
    setSubscribing(true);
    setError(false);
    const result = await subscribeToPush({ language: lang });
    setSubscribing(false);
    trackEvent('reminder_permission_result', { language: lang, result: result.success ? 'granted' : result.reason });
    if (result.success) {
      setDone(true);
      return;
    }
    setError(true);
  };

  const dismiss = () => {
    dismissPushPrompt();
    trackEvent('reminder_prompt_dismiss', { language: lang });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <section className="relative flex items-start gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
        {done ? <Check size={18} /> : <Bell size={18} />}
      </span>
      <div className="min-w-0 flex-1 pr-7">
        <h2 className="font-outfit text-sm font-bold text-white">
          {done ? t('push.enabled') : t('push.contextTitle')}
        </h2>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          {done ? t('push.enabledDesc') : t('push.contextDesc')}
        </p>
        {!done && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={allow}
              disabled={subscribing}
              className="min-h-10 rounded-lg bg-cyan-600 px-4 text-xs font-bold text-white disabled:opacity-50"
            >
              {subscribing ? t('push.enabling') : error ? t('push.retry') : t('push.allow')}
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
