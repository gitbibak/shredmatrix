import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Flame, Share2, Trophy } from 'lucide-react';
import { getWorkoutLogs } from '../lib/dataService';
import { getAcquisitionContext } from '../lib/acquisition';
import { trackEvent } from '../lib/analytics';
import { CHALLENGE28, challengeStatus } from '../lib/challenge28';
import { CHALLENGE_PATHS, challengeText } from '../i18n/challengeCopy';
import { toDateStr, workoutDatesFromLogs } from '../utils/streaks';

const InviteFriendsCard = lazy(() => import('./InviteFriendsCard'));
const EVENT = { challengeId: CHALLENGE28.id, challengeType: 'workout' };
const LOCALES = { tr: 'tr-TR', en: 'en-US', es: 'es-ES' };

function cameFromChallengePage() {
  try {
    const context = getAcquisitionContext();
    const path = context?.first_landing_page || context?.landing_path || '';
    return Object.values(CHALLENGE_PATHS).includes(path);
  } catch {
    return false;
  }
}

export default function Challenge28Card({ plan, onPlanUpdate, lang = 'tr' }) {
  const s = (key, values) => challengeText(lang, key, values);
  const [dates, setDates] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const viewed = useRef(false);
  const challenge = plan?.challenge28 || null;
  const today = toDateStr(new Date());

  useEffect(() => {
    let active = true;
    getWorkoutLogs(60)
      .then((logs) => { if (active) setDates(workoutDatesFromLogs(logs || [])); })
      .catch(() => { if (active) setDates(new Set()); });
    return () => { active = false; };
  }, [challenge?.startedAt]);

  const status = useMemo(() => challengeStatus(challenge, dates || [], today), [challenge, dates, today]);
  const invited = status.state === 'none' && cameFromChallengePage();

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    trackEvent('challenge_viewed', { ...EVENT, source: invited ? 'challenge_landing' : 'today' });
  }, [invited]);

  // Record completion once so the trophy stays even if old logs age out.
  useEffect(() => {
    if (status.state !== 'completed' || !challenge || challenge.completedAt || !dates) return;
    onPlanUpdate?.({ ...plan, challenge28: { ...challenge, completedAt: today } });
    trackEvent('challenge_completed', EVENT);
  }, [status.state, challenge, dates, plan, onPlanUpdate, today]);

  const save = async (next) => {
    if (saving) return;
    setSaving(true);
    try { await onPlanUpdate?.({ ...plan, challenge28: next }); } finally { setSaving(false); }
  };
  const join = () => {
    trackEvent('challenge_joined', { ...EVENT, source: invited ? 'challenge_landing' : 'today' });
    save({ startedAt: today });
  };
  const share = async () => {
    const url = `https://fullbalance.app${CHALLENGE_PATHS[lang] || CHALLENGE_PATHS.en}`;
    trackEvent('challenge_shared', EVENT);
    try {
      if (navigator.share) await navigator.share({ text: s('shareText'), url });
      else await navigator.clipboard?.writeText(`${s('shareText')} ${url}`);
    } catch { /* share sheet dismissed */ }
  };

  if (status.state === 'none') {
    return (
      <section className={`rounded-2xl border p-4 sm:p-5 ${invited ? 'border-orange-400/50 bg-orange-500/[0.08]' : 'border-slate-800 bg-slate-900'}`}>
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-orange-400"><Flame size={13} aria-hidden="true" /> {s('eyebrow')}</p>
        <h3 className="mt-1 font-outfit text-lg font-extrabold text-white">{s('title')}</h3>
        {invited && <p className="mt-1 text-xs font-semibold text-orange-200">{s('invited')}</p>}
        <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{s('pitch')}</p>
        <button type="button" onClick={join} disabled={saving} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 text-sm font-bold text-white disabled:opacity-50">
          {s('join')}
        </button>
      </section>
    );
  }

  const finished = status.state === 'completed';
  // Completion needed 12 workouts; older logs may have aged out of the 60-day read.
  const sharedDone = challenge?.completedAt ? Math.max(status.done, CHALLENGE28.target) : status.done;
  const ended = status.state === 'ended';
  return (
    <section className={`rounded-2xl border p-4 sm:p-5 ${finished ? 'border-amber-400/40 bg-amber-500/[0.07]' : 'border-slate-800 bg-slate-900'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-orange-400"><Flame size={13} aria-hidden="true" /> {s('eyebrow')}</p>
          <h3 className="mt-1 font-outfit text-lg font-extrabold text-white">
            {finished ? s('doneTitle') : ended ? s('endedTitle') : s('title')}
          </h3>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-outfit text-2xl font-black tabular-nums text-white">{status.done}<span className="text-sm text-slate-500">/12</span></p>
          {!finished && !ended && <p className="text-[11px] text-slate-500">{s('day', { day: status.day })}</p>}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2" aria-label={s('progress', { done: status.done })}>
        {status.weeks.map((count, index) => (
          <div key={index} className={`rounded-xl border p-2 ${index === status.currentWeek && !finished && !ended ? 'border-orange-400/50' : 'border-slate-800'}`}>
            <p className="text-[10px] text-slate-500">{s('week', { n: index + 1 })}</p>
            <div className="mt-1 flex gap-1">
              {[0, 1, 2].map((slot) => (
                <span key={slot} className={`flex h-5 flex-1 items-center justify-center rounded-md ${slot < count ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}>
                  {slot < count && <Check size={12} strokeWidth={3} aria-hidden="true" />}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-sm text-slate-300">
        {finished ? s('doneText')
          : ended ? s('endedText', { done: status.done })
            : status.leftThisWeek > 0 ? s('behind', { left: status.leftThisWeek }) : s('onTrack')}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {finished && (
          <button type="button" aria-expanded={showShare} onClick={() => { if (!showShare) trackEvent('challenge_shared', EVENT); setShowShare((value) => !value); }} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-amber-500 px-3 text-sm font-bold text-slate-950">
            <Trophy size={15} aria-hidden="true" /> {s('share')}
          </button>
        )}
        {(finished || ended) && (
          <button type="button" onClick={() => save({ startedAt: today })} disabled={saving} className="inline-flex min-h-10 items-center rounded-xl border border-slate-700 px-3 text-sm font-semibold text-slate-200 disabled:opacity-50">
            {s('restart')}
          </button>
        )}
        {!finished && !ended && (
          <button type="button" onClick={share} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-2 text-xs font-semibold text-slate-400 hover:text-white">
            <Share2 size={14} aria-hidden="true" /> {s('share')}
          </button>
        )}
        {!finished && (
          <button type="button" onClick={() => save(null)} disabled={saving} className="ml-auto min-h-10 px-2 text-[11px] font-semibold text-slate-500 hover:text-slate-300 disabled:opacity-50">
            {s('leave')}
          </button>
        )}
      </div>

      {finished && showShare && (
        <Suspense fallback={null}>
          <InviteFriendsCard
            surface="challenge"
            compact
            className="mt-4"
            userName={plan?.userName}
            title={s('shareTitle')}
            description={s('shareDesc')}
            imageCard={{
              variant: 'workout',
              theme: plan?.primaryGoal,
              dateLabel: new Date(`${challenge?.completedAt || today}T12:00:00`).toLocaleDateString(LOCALES[lang] || LOCALES.en, { day: 'numeric', month: 'short', year: 'numeric' }),
              progress: { value: sharedDone, total: CHALLENGE28.target, label: s('statWorkouts') },
              eyebrow: s('imageEyebrow'),
              headline: s('imageHeadline', { done: sharedDone }),
              subline: s('imageSubline'),
              stats: [
                { label: s('statDays'), value: CHALLENGE28.days },
                { label: s('statWeeks'), value: 4 },
              ],
            }}
          />
        </Suspense>
      )}
    </section>
  );
}
