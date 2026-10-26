import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, ChevronLeft, ChevronRight, Flag, Minus, Play, Plus, Timer, X } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { sessionText } from '../i18n/workoutSessionCopy';
import { getExerciseInfo } from '../data/exerciseDatabase';
import { getExerciseVideo } from '../data/exerciseVideos';
import { trackEvent } from '../lib/analytics';
import {
  addSet,
  completeSet,
  isExerciseDone,
  saveSessionDraft,
  sessionProgressBucket,
  summarizeSession,
  updateSet,
} from '../lib/workoutSession';

function formatClock(totalSeconds) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

function beep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.25;
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
    osc.onended = () => ctx.close().catch(() => {});
  } catch { /* audio blocked */ }
}

function NumberStepper({ value, onChange, step, label }) {
  const shown = value === null || value === undefined ? '' : String(value);
  return (
    <div className="flex min-w-0 items-center rounded-xl border border-slate-700 bg-slate-950">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, (Number(value) || 0) - step))}
        className="flex h-11 w-8 shrink-0 items-center justify-center text-slate-400 hover:text-white"
        aria-label={`${label} -${step}`}
      >
        <Minus size={14} />
      </button>
      <input
        type="text"
        inputMode="decimal"
        value={shown}
        placeholder="0"
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="h-11 w-full min-w-0 bg-transparent text-center text-base font-bold text-white outline-none placeholder:text-slate-600"
      />
      <button
        type="button"
        onClick={() => onChange((Number(value) || 0) + step)}
        className="flex h-11 w-8 shrink-0 items-center justify-center text-slate-400 hover:text-white"
        aria-label={`${label} +${step}`}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export default function WorkoutSession({ session: initialSession, onFinish, onClose, onShowDemo, onShowVideo, saving = false }) {
  const { lang } = useTranslation();
  const s = (key, values) => sessionText(lang, key, values);
  const [session, setSession] = useState(initialSession);
  const [now, setNow] = useState(() => Date.now());
  const [restEndsAt, setRestEndsAt] = useState(null);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [notice, setNotice] = useState('');
  const chipsRef = useRef(null);
  const closeReportedRef = useRef(false);
  const finishPendingRef = useRef(false);

  const index = Math.min(session.exerciseIndex || 0, session.exercises.length - 1);
  const exercise = session.exercises[index];
  const lookupName = exercise ? exercise.sourceName || exercise.name : null;
  const info = lookupName ? getExerciseInfo(lookupName) : null;
  const video = lookupName ? getExerciseVideo(lookupName, lang) : null;
  const summary = summarizeSession(session, now);
  const restLeft = restEndsAt ? Math.ceil((restEndsAt - now) / 1000) : 0;
  const isLast = index === session.exercises.length - 1;

  const handleClose = useCallback((exitMethod) => {
    if (closeReportedRef.current) return;
    closeReportedRef.current = true;
    if (!finishPendingRef.current) {
      trackEvent('workout_session_abandoned', {
        progressBucket: sessionProgressBucket(summarizeSession(session)),
        exitMethod,
      });
    }
    onClose?.();
  }, [onClose, session]);

  useEffect(() => { saveSessionDraft(session); }, [session]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!restEndsAt || now < restEndsAt) return;
    setRestEndsAt(null);
    setNotice(s('restDone'));
    if (navigator.vibrate) navigator.vibrate([180, 80, 180]);
    beep();
  }, [now, restEndsAt]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => { if (event.key === 'Escape') handleClose('escape'); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [handleClose]);

  useEffect(() => {
    chipsRef.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView?.({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [index]);

  if (!exercise) return null;

  const goTo = (next) => {
    setSession((current) => ({ ...current, exerciseIndex: Math.max(0, Math.min(next, current.exercises.length - 1)) }));
  };

  const toggleSet = (setIndex) => {
    const wasDone = exercise.sets[setIndex].done;
    const next = completeSet(session, index, setIndex);
    setSession(next);
    if (wasDone) return;
    const nextExercise = next.exercises[index];
    const finishedExercise = isExerciseDone(nextExercise);
    const finishedAll = next.exercises.every(isExerciseDone);
    if (exercise.restSec > 0 && !finishedAll) setRestEndsAt(Date.now() + exercise.restSec * 1000);
    if (finishedExercise && !isLast) {
      window.setTimeout(() => setSession((current) => (current.exerciseIndex === index ? { ...current, exerciseIndex: index + 1 } : current)), 450);
    }
  };

  const requestFinish = () => {
    if (summary.setsDone === 0) {
      setNotice(s('nothingDone'));
      return;
    }
    if (summary.setsDone < summary.totalSets && !confirmFinish) {
      setConfirmFinish(true);
      return;
    }
    setConfirmFinish(false);
    if (finishPendingRef.current) return;
    finishPendingRef.current = true;
    Promise.resolve().then(() => onFinish?.(session, summarizeSession(session))).then(
      (saved) => { if (saved !== true) finishPendingRef.current = false; },
      () => { finishPendingRef.current = false; },
    );
  };

  const setsDoneHere = exercise.sets.filter((set) => set.done).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col bg-slate-950"
      role="dialog"
      aria-modal="true"
      aria-labelledby="workout-session-title"
    >
      {/* Header */}
      <div className="shrink-0 border-b border-slate-800 bg-slate-950/95 px-4 pb-3" style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}>
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <button
            type="button"
            onClick={() => handleClose('button')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 text-slate-400 hover:text-white"
            aria-label={s('close')}
          >
            <X size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <h2 id="workout-session-title" className="truncate font-outfit text-sm font-bold text-white">{session.dayFocus}</h2>
            <p className="text-[11px] text-slate-500">
              {s('progress', { done: summary.setsDone, total: summary.totalSets })}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-300" aria-label={s('elapsed')}>
            <Timer size={13} className="text-emerald-400" />
            {formatClock((now - new Date(session.startedAt).getTime()) / 1000)}
          </div>
        </div>
        <div className="mx-auto mt-3 h-1.5 max-w-xl overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-[width] duration-300"
            style={{ width: `${summary.totalSets ? (summary.setsDone / summary.totalSets) * 100 : 0}%` }}
          />
        </div>
        <div ref={chipsRef} className="mx-auto mt-3 flex max-w-xl gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {session.exercises.map((item, i) => {
            const done = isExerciseDone(item);
            return (
              <button
                key={`${item.name}-${i}`}
                type="button"
                data-index={i}
                onClick={() => goTo(i)}
                aria-current={i === index ? 'step' : undefined}
                aria-label={`${s('exercise')} ${i + 1}: ${item.name}`}
                className={[
                  'flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg border px-2 text-xs font-bold transition-colors',
                  i === index ? 'border-orange-400 bg-orange-500/15 text-orange-200' : done ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-slate-800 text-slate-500',
                ].join(' ')}
              >
                {done ? <Check size={13} /> : i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercise */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
            className="mx-auto max-w-xl"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
              {exercise.section === 'core' ? s('core') : `${s('exercise')} ${index + 1}${s('of')}${session.exercises.length}`}
            </p>
            <h3 className="mt-1 font-outfit text-2xl font-extrabold leading-tight text-white">{exercise.name}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1">
                {s('target')}: <strong className="text-slate-200">{exercise.targetSets} × {exercise.targetReps}</strong>
              </span>
              {exercise.restSec > 0 && (
                <span className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1">
                  {s('rest')}: <strong className="text-slate-200">{exercise.rest}</strong>
                </span>
              )}
              {exercise.previous && exercise.usesWeight && exercise.previous.weight > 0 && (
                <span className="rounded-lg border border-blue-500/25 bg-blue-500/10 px-2 py-1 text-blue-200">
                  {s('last')}: {exercise.previous.weight} kg × {exercise.previous.reps}
                </span>
              )}
              {video && (
                <button
                  type="button"
                  onClick={() => onShowVideo?.({ video, title: exercise.name })}
                  className="inline-flex items-center gap-1 rounded-lg border border-orange-500/30 bg-orange-500/10 px-2 py-1 font-semibold text-orange-300"
                >
                  <Play size={11} fill="currentColor" /> {s('techniqueVideo')}
                </button>
              )}
              {info?.formSteps?.length > 0 && (
                <button
                  type="button"
                  onClick={() => onShowDemo?.({ name: exercise.name, ...info })}
                  className="inline-flex items-center gap-1 rounded-lg border border-orange-500/30 bg-orange-500/10 px-2 py-1 font-semibold text-orange-300"
                >
                  <BookOpen size={11} /> {s('demo')}
                </button>
              )}
            </div>
            {/* exerciseDatabase tips are written in Turkish only so far. */}
            {lang === 'tr' && info?.tip && <p className="mt-3 text-xs leading-relaxed text-slate-500">💡 {info.tip}</p>}
            {exercise.timed && <p className="mt-3 text-xs text-slate-500">{s('timedHint')}</p>}

            <div className="mt-4 space-y-2">
              <div className={`grid gap-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 ${exercise.usesWeight ? 'grid-cols-[1.5rem_1fr_1fr_3rem]' : 'grid-cols-[1.5rem_1fr_3rem]'}`}>
                <span className="text-center">{s('set')}</span>
                {exercise.usesWeight && <span className="text-center">{s('kg')}</span>}
                <span className="text-center">{exercise.timed ? s('target') : s('reps')}</span>
                <span />
              </div>
              {exercise.sets.map((set, setIndex) => (
                <div
                  key={setIndex}
                  className={`grid items-center gap-2 rounded-2xl border p-2 transition-colors ${set.done ? 'border-emerald-500/30 bg-emerald-500/[0.07]' : 'border-slate-800 bg-slate-900'} ${exercise.usesWeight ? 'grid-cols-[1.5rem_1fr_1fr_3rem]' : 'grid-cols-[1.5rem_1fr_3rem]'}`}
                >
                  <span className="text-center text-sm font-bold text-slate-500">{setIndex + 1}</span>
                  {exercise.usesWeight && (
                    <NumberStepper
                      value={set.weight}
                      step={2.5}
                      label={`${s('set')} ${setIndex + 1} ${s('kg')}`}
                      onChange={(value) => setSession((current) => updateSet(current, index, setIndex, { weight: value }))}
                    />
                  )}
                  {!exercise.timed ? (
                    <NumberStepper
                      value={set.reps}
                      step={1}
                      label={`${s('set')} ${setIndex + 1} ${s('reps')}`}
                      onChange={(value) => setSession((current) => updateSet(current, index, setIndex, { reps: value }))}
                    />
                  ) : (
                    <span className="px-2 text-sm font-semibold text-slate-300">{exercise.targetReps}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleSet(setIndex)}
                    aria-pressed={set.done}
                    aria-label={`${s('set')} ${setIndex + 1} ${s('done')}`}
                    className={`flex h-11 w-12 items-center justify-center rounded-xl border transition-colors ${set.done ? 'border-emerald-400 bg-emerald-500 text-slate-950' : 'border-slate-600 text-slate-400 hover:border-emerald-400 hover:text-emerald-300'}`}
                  >
                    <Check size={20} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSession((current) => addSet(current, index))}
              className="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-slate-400 hover:text-white"
            >
              <Plus size={14} /> {s('addSet')}
            </button>

            {!isLast && (
              <p className="mt-4 text-xs text-slate-600">
                {s('upNext')}: <span className="text-slate-400">{session.exercises[index + 1].name}</span>
              </p>
            )}
            <p className="sr-only" aria-live="polite">{`${setsDoneHere}/${exercise.sets.length}`}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rest timer */}
      <AnimatePresence>
        {restEndsAt && restLeft > 0 && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="shrink-0 border-t border-emerald-500/30 bg-emerald-950/60 px-4 py-3"
            role="timer"
            aria-live="off"
          >
            <div className="mx-auto flex max-w-xl items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">{s('rest')}</span>
              <span className="flex-1 font-outfit text-3xl font-black tabular-nums text-white">{formatClock(restLeft)}</span>
              <button type="button" onClick={() => setRestEndsAt((value) => (value || Date.now()) + 30000)} className="min-h-10 rounded-xl border border-emerald-500/30 px-3 text-xs font-bold text-emerald-200">
                {s('addRest')}
              </button>
              <button type="button" onClick={() => setRestEndsAt(null)} className="min-h-10 rounded-xl bg-emerald-500 px-4 text-xs font-bold text-slate-950">
                {s('skipRest')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {notice && (
        <div role="status" className="pointer-events-none absolute inset-x-4 top-1/3 mx-auto max-w-sm rounded-2xl border border-slate-700 bg-slate-900/95 px-4 py-3 text-center text-sm font-semibold text-white shadow-2xl">
          {notice}
        </div>
      )}

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-800 bg-slate-950 px-4 pt-3" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
        {confirmFinish ? (
          <div className="mx-auto max-w-xl">
            <p className="mb-2 text-center text-xs text-slate-300">{s('finishConfirm')}</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setConfirmFinish(false)} className="min-h-12 rounded-xl border border-slate-700 text-sm font-bold text-slate-200">
                {s('finishNo')}
              </button>
              <button type="button" onClick={requestFinish} disabled={saving} className="min-h-12 rounded-xl bg-orange-500 text-sm font-bold text-white disabled:opacity-50">
                {saving ? s('saving') : s('finishYes')}
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto grid max-w-xl grid-cols-[auto_1fr] gap-2">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              className="flex min-h-12 items-center gap-1 rounded-xl border border-slate-800 px-3 text-sm font-semibold text-slate-300 disabled:opacity-30"
              aria-label={s('previousExercise')}
            >
              <ChevronLeft size={18} />
            </button>
            {isLast || summary.setsDone === summary.totalSets ? (
              <button
                type="button"
                onClick={requestFinish}
                disabled={saving}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-sm font-bold text-white shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                <Flag size={16} /> {saving ? s('saving') : s('finish')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-800 text-sm font-bold text-white hover:bg-slate-700"
              >
                {s('nextExercise')} <ChevronRight size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
