import { useEffect, useState } from 'react';
import { Check, Megaphone, X } from 'lucide-react';
import { getProfile, updateProfileStrict } from '../lib/dataService';
import { HEARD_FROM_OPTIONS, heardFromCopy } from '../i18n/heardFromCopy';

// One optional question per member: "How did you hear about Full Balance?"
// Hidden until the profile is loaded and the heard_from column exists, so it
// stays invisible if the app ships before the database migration.
const dismissKey = (userId) => `fb_heard_from_dismissed:${userId}`;

export default function HeardFromCard({ userId, lang = 'tr' }) {
  const c = heardFromCopy[lang] || heardFromCopy.en;
  const [state, setState] = useState('hidden');
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    if (!userId) return undefined;
    try { if (localStorage.getItem(dismissKey(userId))) return undefined; } catch { /* Storage is optional. */ }
    getProfile().then((profile) => {
      if (active && profile && 'heard_from' in profile && !profile.heard_from) setState('ask');
    }).catch(() => {});
    return () => { active = false; };
  }, [userId]);

  const answer = async (value) => {
    if (state === 'saving') return;
    setState('saving');
    setError(false);
    try {
      await updateProfileStrict({ heard_from: value, heard_from_at: new Date().toISOString() });
      setState('thanks');
    } catch {
      setError(true);
      setState('ask');
    }
  };

  const dismiss = () => {
    try { localStorage.setItem(dismissKey(userId), '1'); } catch { /* Still hide in this session. */ }
    setState('hidden');
  };

  if (state === 'hidden') return null;
  if (state === 'thanks') {
    return (
      <section role="status" className="flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-3 text-sm font-semibold text-emerald-200">
        <Check size={16} aria-hidden="true" /> {c.thanks}
      </section>
    );
  }

  return (
    <section aria-labelledby="heard-from-title" className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Megaphone size={18} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" />
          <div className="min-w-0">
            <h3 id="heard-from-title" className="font-outfit text-sm font-bold text-white">{c.title}</h3>
            <p className="mt-0.5 text-xs leading-5 text-slate-400">{c.desc}</p>
          </div>
        </div>
        <button type="button" onClick={dismiss} aria-label={c.dismiss} className="-mr-2 -mt-2 grid h-11 w-11 shrink-0 place-items-center text-slate-500 hover:text-slate-300">
          <X size={18} />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {HEARD_FROM_OPTIONS.map((value) => (
          <button
            key={value}
            type="button"
            disabled={state === 'saving'}
            onClick={() => answer(value)}
            className="min-h-10 rounded-full border border-slate-700 px-3.5 text-xs font-semibold text-slate-200 hover:border-cyan-400/60 hover:text-white disabled:opacity-50"
          >
            {c.options[value]}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-amber-300">{c.error}</p>}
    </section>
  );
}
