import { useEffect, useState } from 'react';
import { Bell, Plus, Trash2, Save, Droplets, Dumbbell } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { reminderCopy } from '../i18n/reminderCopy';
import {
  loadReminderPreferences,
  saveReminderPreferences,
} from '../lib/reminderPreferences';
import { subscribeToPush, getPermissionStatus } from '../lib/pushService';

export default function ReminderSettings() {
  const { lang } = useTranslation();
  const c = reminderCopy[lang] || reminderCopy.en;
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadReminderPreferences()
      .then((result) => {
        if (!cancelled) {
          setSettings(result.settings);
          setSubscribed(result.subscribed);
          setMessage('');
        }
      })
      .catch(() => {
        if (!cancelled) setMessage(c.error);
      });
    return () => {
      cancelled = true;
    };
  }, [open, attempt, c.error]);
  const update = (kind, values) => {
    setMessage('');
    setSettings((s) => ({ ...s, [kind]: { ...s[kind], ...values } }));
  };
  const activate = async () => {
    setBusy(true);
    try {
      const result = await subscribeToPush({ language: lang });
      if (!result.success) throw new Error();
      setSubscribed(true);
      setMessage('');
    } catch {
      setMessage(c.permission);
    } finally {
      setBusy(false);
    }
  };
  const save = async () => {
    setBusy(true);
    setMessage('');
    try {
      setSettings(await saveReminderPreferences(settings, lang));
      setMessage(c.saved);
    } catch {
      setMessage(c.error);
    } finally {
      setBusy(false);
    }
  };
  const valid =
    settings &&
    (!settings.workout.enabled ||
      (settings.workout.time && settings.workout.days.length)) &&
    (!settings.water.enabled ||
      (settings.water.times.length &&
        settings.water.times.every(Boolean) &&
        settings.water.days.length &&
        new Set(settings.water.times).size === settings.water.times.length));
  return (
    <section className="my-4 border-y border-slate-800 py-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex min-h-11 w-full items-center gap-2 text-left text-sm font-semibold text-white"
      >
        <Bell size={18} className="text-orange-400" />
        {c.title}
      </button>
      {open && (
        <div className="space-y-4 pb-2">
          {!settings ? (
            <p role="status" className="text-sm text-slate-300">
              {message || c.loading}
              {message && (
                <button
                  onClick={() => setAttempt(attempt + 1)}
                  className="ml-3 underline"
                >
                  {c.retry}
                </button>
              )}
            </p>
          ) : (
            <>
              <p className="text-xs text-slate-400">
                {c.timezone}: {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </p>
              {['workout', 'water'].map((kind) => (
                <fieldset
                  key={kind}
                  disabled={busy}
                  className="min-w-0 space-y-3 border-b border-slate-800 pb-4"
                >
                  <label className="flex min-h-11 items-center gap-2 font-semibold text-slate-100">
                    {kind === 'water' ? (
                      <Droplets size={17} className="text-cyan-400" />
                    ) : (
                      <Dumbbell size={17} className="text-orange-400" />
                    )}
                    <span className="flex-1">{c[kind]}</span>
                    <input
                      type="checkbox"
                      checked={settings[kind].enabled}
                      onChange={(e) =>
                        update(kind, { enabled: e.target.checked })
                      }
                      className="h-5 w-5 accent-orange-500"
                    />
                  </label>
                  {settings[kind].enabled && (
                    <>
                      <div className="grid grid-cols-7 gap-1">
                        {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                          <label
                            key={day}
                            className={`flex min-h-11 min-w-0 cursor-pointer items-center justify-center rounded border text-[11px] ${settings[kind].days.includes(day) ? 'border-orange-500 text-orange-300' : 'border-slate-700 text-slate-400'}`}
                          >
                            <input
                              className="sr-only"
                              type="checkbox"
                              aria-label={`${c[kind]} ${c.days[day]}`}
                              checked={settings[kind].days.includes(day)}
                              onChange={(e) =>
                                update(kind, {
                                  days: e.target.checked
                                    ? [...settings[kind].days, day]
                                    : settings[kind].days.filter(
                                        (d) => d !== day,
                                      ),
                                })
                              }
                            />
                            {c.days[day]}
                          </label>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {(kind === 'workout'
                          ? [settings.workout.time]
                          : settings.water.times
                        ).map((time, index) => (
                          <div
                            key={index}
                            className="flex min-w-0 items-center gap-1"
                          >
                            <input
                              type="time"
                              step="60"
                              aria-label={`${c[kind]} ${c.time} ${index + 1}`}
                              value={time}
                              onChange={(e) =>
                                update(
                                  kind,
                                  kind === 'workout'
                                    ? { time: e.target.value }
                                    : {
                                        times: settings.water.times.map(
                                          (v, i) =>
                                            i === index ? e.target.value : v,
                                        ),
                                      },
                                )
                              }
                              className="min-h-11 min-w-0 w-full rounded border border-slate-700 bg-slate-950 px-2 text-sm text-white [color-scheme:dark]"
                            />
                            {kind === 'water' && (
                              <button
                                type="button"
                                title={c.remove}
                                aria-label={`${c.remove} ${index + 1}`}
                                onClick={() =>
                                  update(kind, {
                                    times: settings.water.times.filter(
                                      (_, i) => i !== index,
                                    ),
                                  })
                                }
                                className="flex min-h-11 w-10 shrink-0 items-center justify-center text-slate-400"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {kind === 'water' && settings.water.times.length < 8 && (
                        <button
                          type="button"
                          onClick={() =>
                            update(kind, {
                              times: [...settings.water.times, ''],
                            })
                          }
                          className="flex min-h-11 items-center gap-2 text-sm text-cyan-300"
                        >
                          <Plus size={16} />
                          {c.add}
                        </button>
                      )}
                    </>
                  )}
                </fieldset>
              ))}
              <p className="text-xs leading-relaxed text-slate-400">{c.note}</p>
              {(!subscribed || getPermissionStatus() !== 'granted') && (
                <button
                  disabled={busy}
                  onClick={activate}
                  className="min-h-11 rounded border border-orange-500/40 px-3 text-sm text-orange-300"
                >
                  {c.enable}
                </button>
              )}
              <button
                disabled={busy || !subscribed || !valid}
                onClick={save}
                className="flex min-h-11 items-center gap-2 rounded bg-orange-600 px-4 text-sm font-semibold text-white disabled:opacity-40"
              >
                <Save size={16} />
                {c.save}
              </button>
              {message && (
                <p role="status" className="text-sm text-slate-200">
                  {message}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
