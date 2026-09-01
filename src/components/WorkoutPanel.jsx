import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { getWorkoutLogs, recordProductStep, saveWorkoutFeedback, saveWorkoutLog } from '../lib/dataService';

const InviteFriendsCard = lazy(() => import('./InviteFriendsCard'));
import { trackEvent } from '../lib/analytics';
import { getExerciseInfo, getDifficultyLabel } from '../data/exerciseDatabase';
import { useTranslation } from '../i18n/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './ToastProvider';
import ExerciseDemo from './ExerciseDemo';
import { getWorkoutDayImage } from '../data/moduleAssets';
import { adaptNextWorkout, chooseAdaptation } from '../data/workoutAdaptation';
import { computeStreaks, getRestDayIndexes, mondayOf, toDateStr, workoutDatesFromLogs } from '../utils/streaks';
import confetti from 'canvas-confetti';
import {
  Calendar,
  ChevronDown,
  Repeat,
  Hash,
  Timer,
  Dumbbell,
  Play,
  Target,
  Activity,
  Info,
  BookOpen,
  Gauge,
  HeartPulse,
  TriangleAlert,
  Zap,
} from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

const exerciseRowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.045, type: 'spring', stiffness: 300, damping: 26 },
  }),
  exit: { opacity: 0, x: -12, transition: { duration: 0.15 } },
};

function isRestDay(day) {
  const focus = day.focus?.toLowerCase() ?? '';
  return (
    focus.includes('dinlenme') ||
    focus.includes('rest') ||
    focus.includes('off') ||
    focus.includes('descanso')
  );
}

function resolveGoalKey(goal) {
  const value = String(goal || '').toLowerCase();
  if (value.includes('yağ') || value.includes('fat')) return 'fat_loss';
  if (value.includes('medit')) return 'meditation';
  if (value.includes('yoga')) return 'yoga';
  if (value.includes('pilates')) return 'pilates';
  if (value.includes('reformer')) return 'reformer';
  return 'muscle';
}

function ExerciseRow({ exercise, index, t, onShowDemo }) {
  const [showTip, setShowTip] = useState(false);
  const databaseInfo = getExerciseInfo(exercise.name);
  const hasStructuredMetadata = Object.hasOwn(exercise, 'equipment');
  const info = hasStructuredMetadata
    ? { ...exercise }
    : databaseInfo;
  const muscles = exercise.muscles || info?.muscles;
  const difficulty = exercise.difficulty || info?.difficulty;
  const diff = difficulty ? getDifficultyLabel(difficulty) : null;
  const videoUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + ' form technique')}`;
  return (
    <motion.div
      custom={index}
      variants={exerciseRowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-slate-950 rounded-lg overflow-hidden"
    >
      <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {info?.emoji && <span className="text-base shrink-0">{info.emoji}</span>}
          <div className="min-w-0">
            <span className="font-semibold text-slate-100 text-sm block truncate">
              {exercise.name}
            </span>
            {muscles && (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {muscles.map(m => (
                  <span key={m} className="text-[8px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium">
                    {m}
                  </span>
                ))}
                {diff && (
                  <span className={`text-[8px] px-1.5 py-0.5 rounded ${diff.bg} ${diff.color} font-medium`}>
                    {diff.text}
                  </span>
                )}
                {exercise.equipment && exercise.equipment !== 'none' && (
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                    {{ dumbbell: 'Dumbbell', resistance_band: 'Direnç bandı', stable_surface: 'Sabit destek' }[exercise.equipment] || exercise.equipment}
                  </span>
                )}
                {exercise.tempo && (
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 font-medium">
                    {exercise.tempo}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Repeat size={13} className="text-orange-400" />
            <span className="text-slate-300">{exercise.sets}</span>
          </span>
          <span className="flex items-center gap-1">
            <Hash size={13} className="text-blue-400" />
            <span className="text-slate-300">{exercise.reps}</span>
          </span>
          <span className="flex items-center gap-1">
            <Timer size={13} className="text-emerald-400" />
            <span className="text-slate-300">{exercise.rest}</span>
          </span>
          {info?.formSteps && info.formSteps.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onShowDemo?.({ name: exercise.name, ...info }); }}
              className="flex items-center justify-center w-9 h-9 rounded-full border bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20 hover:scale-110 transition-all cursor-pointer"
              title={t('exerciseDemo.title')}
              aria-label={t('exerciseDemo.title')}
            >
              <BookOpen size={11} />
            </button>
          )}
          {info?.tip && (
            <button
              onClick={() => setShowTip(!showTip)}
              className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all cursor-pointer ${
                showTip ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' : 'bg-slate-800/60 border-slate-700/30 text-slate-500 hover:text-cyan-400'
              }`}
              title="Form İpucu"
              aria-label="Form ipucu"
            >
              <Info size={11} />
            </button>
          )}
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={t('video.watch')}
            aria-label="Video izle"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:scale-110 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <Play size={9} fill="currentColor" />
          </a>
        </div>
      </div>

      {/* Form tip expandable */}
      <AnimatePresence>
        {showTip && info?.tip && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0">
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                <Info size={12} className="text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-cyan-300/80 leading-relaxed">
                  💡 {info.tip}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DayCard({ day, index, isOpen, onToggle, t, onShowDemo, goalKey }) {
  const rest = isRestDay(day);
  const exerciseCount = day.exercises?.length ?? 0;
  const dayImage = getWorkoutDayImage(goalKey, day.image);

  return (
    <motion.div variants={cardVariants}>
      <div
        className={[
          'rounded-xl border transition-colors duration-200 overflow-hidden',
          rest
            ? 'bg-slate-900/50 border-slate-800/60'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700',
          isOpen && !rest ? 'border-l-2 border-l-orange-500' : '',
        ].join(' ')}
      >
        {/* Workout image — shown when card is open and has an image */}
        <AnimatePresence initial={false}>
          {isOpen && !rest && dayImage && (
            <motion.div
              key="image"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 140, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="relative overflow-hidden"
            >
              <img
                src={dayImage}
                alt={day.focus}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <span className="text-sm font-bold text-white font-outfit drop-shadow-lg">
                  {day.focus}
                </span>
                <span className="text-xs font-medium bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30 backdrop-blur-sm">
                  {exerciseCount} {t('workout.totalExercises')}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed header */}
        <button
          type="button"
          onClick={() => onToggle(index)}
          aria-expanded={isOpen}
          className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer focus:outline-none"
        >
          <span className="text-xl leading-none">{day.emoji}</span>

          <div className="flex-1 min-w-0">
            <p
              className={[
                'font-outfit font-semibold text-sm truncate',
                rest ? 'text-slate-500' : 'text-slate-100',
              ].join(' ')}
            >
              {day.day}
            </p>
            <p
              className={[
                'text-xs truncate',
                rest ? 'text-slate-600' : 'text-slate-400',
              ].join(' ')}
            >
              {day.focus}
            </p>
          </div>

          {!rest && exerciseCount > 0 && !isOpen && (
            <span className="shrink-0 text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
              {exerciseCount} {t('workout.totalExercises')}
            </span>
          )}

          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="shrink-0"
          >
            <ChevronDown
              size={16}
              className={rest ? 'text-slate-600' : 'text-slate-400'}
            />
          </motion.span>
        </button>

        {/* Expanded exercises */}
        <AnimatePresence initial={false}>
          {isOpen && !rest && exerciseCount > 0 && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 flex flex-col gap-2">
                {day.quality && (
                  <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                        <Info size={13} />
                        {day.quality.goal}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                        {day.quality.expectedDuration}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                        {day.quality.intensity}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 text-[11px] leading-relaxed text-slate-400">
                      <p><span className="text-slate-300 font-semibold">{t('workout.warmup')}:</span> {day.quality.warmup}</p>
                      <p><span className="text-slate-300 font-semibold">{t('workout.progression')}:</span> {day.quality.progressionRule}</p>
                      <p><span className="text-slate-300 font-semibold">{t('workout.regression')}:</span> {day.quality.regressionOption}</p>
                      <p><span className="text-slate-300 font-semibold">{t('workout.safety')}:</span> {day.quality.safetyNotes}</p>
                    </div>
                  </div>
                )}

                {day.adaptationAction && day.adaptationAction !== 'maintain' && (
                  <div className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[11px] leading-relaxed ${day.adaptationAction === 'hold' ? 'border-amber-500/30 bg-amber-500/10 text-amber-100' : 'border-blue-500/25 bg-blue-500/10 text-blue-100'}`}>
                    <TriangleAlert size={14} className="mt-0.5 shrink-0" />
                    <span>{t(`workout.adaptation.${day.adaptationAction}`)}</span>
                  </div>
                )}

                {/* Column labels */}
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500 px-3 pb-1">
                  <span>{t('workout.totalExercises')}</span>
                  <div className="flex gap-4">
                    <span>{t('workout.sets')}</span>
                    <span>{t('workout.reps')}</span>
                    <span>{t('workout.rest')}</span>
                  </div>
                </div>

                {day.exercises.map((exercise, i) => (
                  <ExerciseRow
                    key={exercise.name + i}
                    exercise={exercise}
                    index={i}
                    t={t}
                    onShowDemo={onShowDemo}
                  />
                ))}

                {/* ── Core Finisher Section ── */}
                {day.coreFinisher && day.coreFinisher.length > 0 && (
                  <div className="mt-3">
                    <div className="h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent mb-3" />
                    <div className="flex items-center gap-2 px-3 mb-2">
                      <Target size={14} className="text-orange-400" />
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-orange-400">
                        {t('workout.coreFinisher')}
                      </span>
                      {day.coreCategory && (
                        <span className="text-[9px] bg-orange-500/10 text-orange-400/70 px-2 py-0.5 rounded-full border border-orange-500/20">
                          {day.coreCategory}
                        </span>
                      )}
                    </div>
                    {day.coreFinisher.map((exercise, i) => (
                      <ExerciseRow
                        key={'core-' + exercise.name + i}
                        exercise={exercise}
                        index={i}
                        t={t}
                        onShowDemo={onShowDemo}
                      />
                    ))}
                  </div>
                )}

                {/* ── Cardio Recommendation ── */}
                {day.cardioNote && (
                  <div className="mt-3">
                    <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent mb-3" />
                    <div className="flex items-center gap-2.5 bg-blue-500/5 border border-blue-500/15 rounded-xl px-3.5 py-2.5">
                      <Activity size={15} className="text-blue-400 shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-400 mb-0.5">
                          {t('workout.cardioNote')}
                        </p>
                        <p className="text-xs text-slate-400">
                          {day.cardioNote}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {isOpen && rest && (
            <motion.div
              key="rest-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="bg-slate-950/60 rounded-lg p-4 text-center text-slate-500 text-sm">
                  {t('workout.restMsg')}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function WorkoutPanel({ plan, onPlanUpdate }) {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(() => {
    // Map JS getDay() (0=Sun) to plan array index (0=Mon)
    const idx = (new Date().getDay() + 6) % 7;
    const len = plan?.workoutSplit?.length || 7;
    return idx < len ? idx : 0;
  });
  const [completedDays, setCompletedDays] = useState({});
  const [celebration, setCelebration] = useState(null);
  const [inviteMoment, setInviteMoment] = useState(null);
  const [feedbackEffort, setFeedbackEffort] = useState(null);
  const [feedbackPain, setFeedbackPain] = useState(null);
  const [feedbackEnergy, setFeedbackEnergy] = useState(null);
  const [feedbackDuration, setFeedbackDuration] = useState(45);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [demoExercise, setDemoExercise] = useState(null);
  const toast = useToast();

  // Load completed workouts from dataService
  useEffect(() => {
    getWorkoutLogs().then((saved) => {
      const today = new Date().toISOString().split('T')[0];
      const todayMap = {};
      saved.forEach((entry) => {
        if (entry.date === today) {
          todayMap[entry.dayFocus || entry.day_focus] = true;
        }
      });
      setCompletedDays(todayMap);
    }).catch((err) => { console.warn('[WorkoutPanel]', err?.message || err); });
  }, []);

  useEffect(() => {
    if (!plan) return;
    recordProductStep('workout_plan_viewed').catch((error) => console.warn('[Activation]', error?.message || error));
  }, [plan]);

  useEffect(() => {
    if (openIndex < 0 || !plan?.workoutSplit?.[openIndex]) return;
    trackEvent('workout_started', {
      module: resolveGoalKey(plan.goal || plan.primaryGoal || ''),
      source: 'workout_panel',
    });
    recordProductStep('workout_day_opened').catch((error) => console.warn('[Activation]', error?.message || error));
  }, [openIndex, plan]);

  useEffect(() => {
    if (!celebration) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [celebration]);

  if (!plan) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'3rem 1rem',textAlign:'center',color:'#94a3b8'}}>
      <Dumbbell size={48} style={{marginBottom:'1rem',opacity:0.3}} />
      <p style={{fontSize:'1.1rem',fontWeight:600,color:'#e2e8f0'}}>{t('workout.noPlan')}</p>
      <p style={{fontSize:'0.875rem',marginTop:'0.5rem'}}>{t('workout.noPlanDesc')}</p>
    </div>
  );

  const { workoutSplit = [], goal = '' } = plan;
  const goalKey = resolveGoalKey(goal);

  const handleToggle = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  const handleCompleteWorkout = async (day) => {
    const today = new Date().toISOString().split('T')[0];
    const focus = day.focus;

    // Check if already completed today
    if (completedDays[focus]) return;

    const entry = {
      date: today,
      dayFocus: focus,
      day_focus: focus,
      exercises: (day.exercises || []).map((ex) => ({
        name: ex.name,
        sets: Array.from({ length: parseInt(ex.sets) || 4 }, () => ({
          weight: 0,
          reps: parseInt(ex.reps) || 10,
          completed: true,
        })),
      })),
      ...(day.coreFinisher?.length > 0 ? {
        coreFinisher: day.coreFinisher.map((ex) => ({
          name: ex.name,
          sets: Array.from({ length: parseInt(ex.sets) || 3 }, () => ({
            weight: 0,
            reps: parseInt(ex.reps) || 15,
            completed: true,
          })),
        })),
      } : {}),
    };

    try {
      const savedLog = await saveWorkoutLog(entry);
      setCompletedDays((prev) => ({ ...prev, [focus]: true }));
      setFeedbackEffort(null);
      setFeedbackPain(null);
      setFeedbackEnergy(null);
      setFeedbackDuration(45);
      setFeedbackError('');
      trackEvent('workout_completed', { module: goalKey, source: 'workout_panel' });
      if (goalKey === 'meditation') trackEvent('meditation_completed', { source: 'workout_panel' });
      recordProductStep('workout_completed').catch((error) => console.warn('[Activation]', error?.message || error));

      // 🎉 CELEBRATION!
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(200);

      // Confetti burst
      const burst = (opts) => confetti({ ...opts, disableForReducedMotion: true });
      burst({ particleCount: 80, spread: 100, origin: { y: 0.7 } });
      setTimeout(() => burst({ particleCount: 50, spread: 120, origin: { x: 0.3, y: 0.6 } }), 200);
      setTimeout(() => burst({ particleCount: 50, spread: 120, origin: { x: 0.7, y: 0.6 } }), 400);

      // Show celebration overlay
      setCelebration({
        focus,
        logId: savedLog?.id,
        date: today,
        exercises: (day.exercises || []).length,
        sets: (day.exercises || []).reduce((s, ex) => s + (parseInt(ex.sets) || 4), 0),
      });
    } catch {
      toast.error(t('errors.saveFailed'));
    }
  };

  const handleSaveFeedback = async () => {
    if (!celebration || !feedbackEffort || feedbackPain === null || !feedbackEnergy || feedbackSaving) return;
    setFeedbackSaving(true);
    setFeedbackError('');
    try {
      const previousLogs = await getWorkoutLogs();
      const recentFeedback = previousLogs
        .filter((entry) => entry.feedback_at)
        .filter((entry) => entry.id !== celebration.logId)
        .slice(0, 3);
      const adaptationAction = chooseAdaptation({
        perceivedExertion: feedbackEffort,
        painReported: feedbackPain,
        energyAfter: feedbackEnergy,
      }, recentFeedback, goalKey);
      const savedFeedback = await saveWorkoutFeedback({
        id: celebration.logId,
        date: celebration.date,
        dayFocus: celebration.focus,
        perceivedExertion: feedbackEffort,
        painReported: feedbackPain,
        energyAfter: feedbackEnergy,
        sessionDurationMinutes: feedbackDuration,
        adaptationAction,
      });
      const adaptation = adaptNextWorkout(plan, celebration.focus, adaptationAction, savedFeedback?.id || celebration.logId);
      if (adaptation.changed) await onPlanUpdate?.(adaptation.plan);
      // Health-related answers remain first-party data and are never sent to analytics.
      trackEvent('workout_feedback_saved', { adaptation: adaptationAction });
      if (feedbackPain) toast.info(t('workout.feedbackPainAdvice'));
      else toast.success(t('workout.feedbackSaved'));
      setCelebration(null);
      // Emotional peak: the workout is logged and feedback is saved. Offer the
      // invite once here instead of interrupting the feedback form.
      if (!feedbackPain) {
        const workoutDates = workoutDatesFromLogs(previousLogs);
        const weekStart = toDateStr(mondayOf(new Date()));
        setInviteMoment({
          workoutCount: Math.max(1, previousLogs.length),
          streak: computeStreaks(workoutDates, { restDayIndexes: getRestDayIndexes(plan) }).current,
          weekCount: [...workoutDates].filter((date) => date >= weekStart).length,
          focus: celebration.focus,
          exercises: celebration.exercises,
          sets: celebration.sets,
        });
        trackEvent('invite_prompt_view', { surface: 'workout' });
      }
    } catch (error) {
      setFeedbackError(t('workout.feedbackError'));
      console.warn('[WorkoutFeedback]', error?.message || error);
      toast.error(t('errors.saveFailed'));
    } finally {
      setFeedbackSaving(false);
    }
  };

  const trainingDays = workoutSplit.filter((d) => !isRestDay(d));

  // Program age calculation
  const planCreatedAt = plan.createdAt || localStorage.getItem('shredmatrix_plan_created');
  const programAgeDays = planCreatedAt
    ? Math.floor((Date.now() - new Date(planCreatedAt).getTime()) / 86400000)
    : 0;
  const showProgramWarning = programAgeDays >= 90; // 3 months

  return (
    <section className="flex flex-col gap-5 h-full">
      {/* ─── Header ─── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10">
            <Calendar size={20} className="text-orange-400" />
          </div>
          <div>
            <h2 className="font-outfit font-bold text-lg text-slate-100 leading-tight">
              {t('workout.title')}
            </h2>
            {goal && (
              <p className="text-xs text-slate-400 mt-0.5">
                {goal} {t('workout.program')}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 text-[10px] font-semibold bg-orange-500/10 text-orange-400 px-2.5 py-1 rounded-full border border-orange-500/20">
            {t('workout.weekly')} {trainingDays.length} {t('workout.days')}
          </span>
          <span className="shrink-0 text-[10px] font-semibold bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20">
            7 {t('workout.split')}
          </span>
          {plan.planQuality?.equipmentLabel && (
            <span className="shrink-0 text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/20">
              {plan.planQuality.equipmentLabel}
            </span>
          )}
        </div>
      </div>

      {plan.planQuality?.requiresMedicalClearance && plan.planQuality.medicalNotice && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5">
          <TriangleAlert size={16} className="mt-0.5 shrink-0 text-amber-400" />
          <p className="text-[11px] leading-relaxed text-amber-200">
            {plan.planQuality.medicalNotice}
          </p>
        </div>
      )}

      {/* ─── Program age warning ─── */}
      {showProgramWarning && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <span className="text-amber-400 text-sm">⚠️</span>
          <p className="text-[11px] text-amber-300 flex-1">
            {t('workout.programWarning', { days: programAgeDays })}
          </p>
        </div>
      )}

      {/* ─── Day Cards ─── */}
      <motion.div
        className="flex flex-col gap-2.5 lg:overflow-y-auto lg:pr-1 lg:custom-scrollbar"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {workoutSplit.map((day, index) => {
          const rest = isRestDay(day);
          const isDone = completedDays[day.focus];
          return (
            <div key={day.day + index}>
              <DayCard
                day={day}
                index={index}
                isOpen={openIndex === index}
                onToggle={handleToggle}
                t={t}
                onShowDemo={setDemoExercise}
                goalKey={goalKey}
              />
              {/* Complete workout button — only for training days when card is open */}
              {openIndex === index && !rest && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1"
                >
                  {isDone ? (
                    <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <span className="text-base">✅</span>
                      <span className="text-xs font-semibold font-outfit">{t('workout.completed')}</span>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCompleteWorkout(day)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold font-outfit shadow-lg shadow-orange-500/20 cursor-pointer"
                    >
                      <Dumbbell size={16} />
                      {t('workout.completeBtn')}
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* ─── Footer ─── */}
      <div className="mt-auto pt-3 border-t border-slate-800/60 flex items-center gap-2 text-xs text-slate-500">
        <Dumbbell size={14} className="text-slate-600" />
        <span>
          {t('workout.total')}{' '}
          <span className="text-slate-400 font-medium">
            {workoutSplit.reduce(
              (sum, d) => sum + (d.exercises?.length ?? 0),
              0
            )}
          </span>{' '}
          {t('workout.totalExercises')} · {trainingDays.length} {t('workout.trainingDays')} · 
          {workoutSplit.length - trainingDays.length} {t('workout.restDays')}
        </span>
      </div>

      {/* 🎉 Celebration Overlay */}
      <AnimatePresence>
        {celebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="workout-feedback-title"
          >
            <motion.div
              initial={{ y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 48, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-3xl border border-slate-700 bg-slate-900 p-4 text-center shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-5"
              style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-slate-700 sm:hidden" />
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-2xl">✓</div>
              <h2 id="workout-feedback-title" className="text-xl font-black font-outfit text-white mb-1">
                {t('celebration.title')}
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                {celebration.focus}
              </p>

              {/* Stats */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center gap-8 mb-4 rounded-xl border border-slate-800 bg-slate-950/50 py-2.5"
              >
                <div className="text-center">
                  <p className="text-xl font-bold text-white font-outfit">{celebration.exercises}</p>
                  <p className="text-[9px] text-slate-500">{t('celebration.exercises')}</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white font-outfit">{celebration.sets}</p>
                  <p className="text-[9px] text-slate-500">{t('celebration.sets')}</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-emerald-400 font-outfit">✅</p>
                  <p className="text-[9px] text-slate-500">{t('celebration.complete')}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.72 }}
                className="mb-4 space-y-4 rounded-2xl border border-slate-700 bg-slate-950/60 p-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <Gauge size={14} className="text-orange-300" />
                  <p className="text-xs font-bold text-slate-100">{t('workout.feedbackTitle')}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFeedbackEffort(value)}
                      className={`min-h-11 rounded-xl border px-2 text-[11px] font-bold transition-colors ${feedbackEffort === value ? 'border-orange-400 bg-orange-500/15 text-orange-200' : 'border-slate-700 bg-slate-900 text-slate-400'}`}
                    >
                      {t(`workout.feedbackEffort${value}`)}
                    </button>
                  ))}
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                    <Zap size={13} className="text-cyan-300" /> {t('workout.feedbackEnergy')}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFeedbackEnergy(value)}
                        className={`min-h-11 rounded-xl border px-2 text-[11px] font-bold transition-colors ${feedbackEnergy === value ? 'border-cyan-400 bg-cyan-500/15 text-cyan-100' : 'border-slate-700 bg-slate-900 text-slate-400'}`}
                      >
                        {t(`workout.feedbackEnergy${value}`)}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block">
                  <span className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                    <Timer size={13} className="text-emerald-300" /> {t('workout.feedbackDuration')}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max="600"
                      value={feedbackDuration}
                      onChange={(event) => setFeedbackDuration(Math.max(1, Math.min(600, Number(event.target.value) || 1)))}
                      className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm font-bold text-white outline-none focus:border-emerald-400"
                    />
                    <span className="shrink-0 text-xs text-slate-500">{t('workout.feedbackMinutes')}</span>
                  </div>
                </label>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                    <HeartPulse size={13} className="text-rose-300" />
                    {t('workout.feedbackPain')}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[false, true].map((value) => (
                      <button
                        key={String(value)}
                        type="button"
                        onClick={() => setFeedbackPain(value)}
                        className={`min-h-11 min-w-16 rounded-lg border px-3 py-2 text-[11px] font-bold transition-colors ${feedbackPain === value ? 'border-orange-400 bg-orange-500/15 text-orange-200' : 'border-slate-700 bg-slate-900 text-slate-400'}`}
                      >
                        {value ? t('workout.feedbackYes') : t('workout.feedbackNo')}
                      </button>
                    ))}
                  </div>
                </div>
                {feedbackPain && <p className="text-[10px] leading-relaxed text-amber-200/80">{t('workout.feedbackPainAdvice')}</p>}
                {feedbackError && <p role="alert" className="text-[11px] font-semibold text-rose-300">{feedbackError}</p>}
              </motion.div>

              <motion.button
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveFeedback}
                disabled={!feedbackEffort || feedbackPain === null || !feedbackEnergy || !feedbackDuration || feedbackSaving}
                className="min-h-12 w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {feedbackSaving ? t('workout.feedbackSaving') : t('workout.feedbackSave')}
              </motion.button>
              <button type="button" onClick={() => setCelebration(null)} className="mt-2 min-h-11 px-4 text-[11px] font-semibold text-slate-500 hover:text-slate-300">
                {t('workout.feedbackSkip')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🤝 Post-workout invite moment */}
      <AnimatePresence>
        {inviteMoment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="workout-invite-title"
          >
            <motion.div
              initial={{ y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 48, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="w-full rounded-t-3xl border border-slate-700 bg-slate-900 p-4 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-5"
              style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-slate-700 sm:hidden" />
              <h2 id="workout-invite-title" className="sr-only">{t('referral.workoutTitle')}</h2>
              <Suspense fallback={null}>
                <InviteFriendsCard
                  surface="workout"
                  userName={plan?.userName}
                  workoutCount={inviteMoment.workoutCount}
                  streak={inviteMoment.streak}
                  title={t('referral.workoutTitle')}
                  description={t('referral.workoutDesc')}
                  imageCard={{
                    eyebrow: t('referral.imageEyebrow'),
                    headline: t('referral.imageHeadlineWorkout', { count: inviteMoment.workoutCount }),
                    subline: inviteMoment.focus || '',
                    stats: [
                      { label: t('referral.statExercises'), value: inviteMoment.exercises || 0 },
                      { label: t('referral.statSets'), value: inviteMoment.sets || 0 },
                      { label: t('referral.statStreak'), value: inviteMoment.streak || 0 },
                      { label: t('referral.statWeek'), value: inviteMoment.weekCount || 0 },
                    ],
                  }}
                />
              </Suspense>
              <button type="button" onClick={() => setInviteMoment(null)} className="mt-3 min-h-11 w-full rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white">
                {t('workout.feedbackSkip')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎓 Exercise Demo Modal */}
      <AnimatePresence>
        {demoExercise && (
          <ExerciseDemo
            exercise={demoExercise}
            onClose={() => setDemoExercise(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
