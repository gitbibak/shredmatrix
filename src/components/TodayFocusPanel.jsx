import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Dumbbell,
  Flame,
  Moon,
  ChevronDown,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { getWorkoutLogs } from '../lib/dataService';
import { trackEvent } from '../lib/analytics';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_NAMES = {
  tr: ['Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt', 'Paz'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  es: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
};

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function getMonday(date = new Date()) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const day = result.getDay();
  const mondayOffset = day === 0 ? 6 : day - 1;
  result.setDate(result.getDate() - mondayOffset);
  return result;
}

function toISO(date) {
  return date.toISOString().split('T')[0];
}

function isRestDay(day) {
  if (!day) return true;
  const text = `${day.day || ''} ${day.focus || ''}`.toLowerCase();
  return Boolean(day.isRest || text.includes('dinlen') || text.includes('rest') || text.includes('descanso'));
}

function getWeekRows(plan, workoutDates) {
  const monday = getMonday();
  const today = todayISO();
  const todayIndex = (new Date().getDay() + 6) % 7;

  return DAY_KEYS.map((key, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const iso = toISO(date);
    const dayPlan = plan?.workoutSplit?.[index] || null;
    const rest = isRestDay(dayPlan);
    const completed = workoutDates.has(iso);

    let status = 'upcoming';
    if (rest) status = 'rest';
    if (completed) status = 'done';
    if (index < todayIndex && !completed && !rest) status = 'missed';
    if (index === todayIndex && !completed && !rest) status = 'today';
    if (index === todayIndex && rest) status = 'todayRest';

    return {
      key,
      index,
      iso,
      dayPlan,
      rest,
      completed,
      isToday: index === todayIndex,
      status,
    };
  });
}

export default function TodayFocusPanel({ plan, onNavigate }) {
  const { t, lang } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [showWeek, setShowWeek] = useState(false);

  useEffect(() => {
    getWorkoutLogs()
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch(() => setLogs([]));
  }, []);

  const workoutDates = useMemo(() => {
    return new Set(
      logs
        .map((entry) => (entry.date || entry.createdAt || entry.created_at || '').slice(0, 10))
        .filter(Boolean),
    );
  }, [logs]);

  const weekRows = useMemo(() => getWeekRows(plan, workoutDates), [plan, workoutDates]);
  const todayRow = weekRows.find((row) => row.isToday) || weekRows[0];
  const trainingDays = weekRows.filter((row) => !row.rest).length || plan?.trainingDays || 0;
  const completedThisWeek = weekRows.filter((row) => row.completed).length;
  const todayExerciseCount = todayRow?.dayPlan?.exercises?.length || 0;
  const todayCompleted = todayRow?.completed;
  const restToday = todayRow?.rest;
  const goalKey = plan?.primaryGoal || 'muscle';
  const supportedGoals = ['muscle', 'fat_loss', 'yoga', 'pilates', 'reformer', 'meditation'];
  const moduleKey = supportedGoals.includes(goalKey) ? goalKey : 'muscle';
  const nextTraining = weekRows.find((row) => row.index > todayRow.index && !row.rest)
    || weekRows.find((row) => !row.rest);
  const latestFeedback = useMemo(() => {
    return logs
      .filter((entry) => entry.feedback_at || entry.feedbackAt)
      .sort((a, b) => {
        const aTime = new Date(a.feedback_at || a.feedbackAt || a.created_at || a.date || 0).getTime();
        const bTime = new Date(b.feedback_at || b.feedbackAt || b.created_at || b.date || 0).getTime();
        return bTime - aTime;
      })[0] || null;
  }, [logs]);
  const recoveryNotice = latestFeedback?.pain_reported
    ? t('todayFocus.painFollowUp')
    : Number(latestFeedback?.perceived_exertion) === 3
      ? t('todayFocus.hardFollowUp')
      : null;

  const dayLabels = DAY_NAMES[lang] || DAY_NAMES.tr;
  const title = restToday ? t('todayFocus.restTitle') : t(`todayFocus.modules.${moduleKey}.title`);
  const subtitle = restToday
    ? t('todayFocus.restSubtitle')
    : t('todayFocus.workoutSubtitle', {
      focus: todayRow?.dayPlan?.focus || t('todayFocus.training'),
    });
  const ctaLabel = restToday ? t('todayFocus.restCta') : t('todayFocus.workoutCta');
  const ctaTarget = restToday ? 'nutrition' : 'workout';

  const statusClass = {
    done: 'border-emerald-400/50 bg-emerald-400/15 text-emerald-300',
    today: 'border-orange-400/60 bg-orange-500/15 text-orange-300',
    todayRest: 'border-purple-400/50 bg-purple-500/15 text-purple-300',
    missed: 'border-rose-400/40 bg-rose-500/10 text-rose-300',
    rest: 'border-slate-700/80 bg-slate-950/60 text-slate-500',
    upcoming: 'border-slate-700/80 bg-slate-950/60 text-slate-400',
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 shrink-0">
            {restToday ? (
              <Moon size={20} className="text-purple-300" />
            ) : (
              <Dumbbell size={20} className="text-orange-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide font-bold text-orange-400 mb-1">
              {t('todayFocus.eyebrow')}
            </p>
            <h2 className="text-xl sm:text-2xl font-outfit font-extrabold text-white leading-tight">
              {title}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mt-1.5">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-bold text-slate-300 shrink-0">
          <Flame size={14} className="text-orange-400" />
          {completedThisWeek}/{trainingDays || 0}
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          trackEvent('primary_action_click', { destination: ctaTarget, module: moduleKey, completed: todayCompleted });
          onNavigate?.(ctaTarget);
        }}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm font-outfit font-bold text-orange-300 hover:bg-orange-500/15 transition-colors"
      >
        {todayCompleted ? t('todayFocus.completedCta') : ctaLabel}
        <ArrowRight size={16} />
      </button>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2.5 text-xs">
        <span className="text-slate-500">
          {t('todayFocus.weekTarget')} <strong className="ml-1 text-slate-200">{completedThisWeek}/{trainingDays || 0}</strong>
        </span>
        <span className="text-right text-slate-500">
          {t('todayFocus.todayLoad')} <strong className="ml-1 text-slate-200">{restToday ? t('todayFocus.rest') : `${todayExerciseCount} ${t('todayFocus.exercise')}`}</strong>
        </span>
      </div>

      {todayCompleted && nextTraining?.dayPlan?.focus && (
        <p className="mt-3 text-xs leading-relaxed text-emerald-300/80">
          <CheckCircle2 size={13} className="mr-1.5 inline" />
          {t('todayFocus.nextPreview', { focus: nextTraining.dayPlan.focus })}
        </p>
      )}

      {recoveryNotice && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2.5 text-xs leading-relaxed text-amber-100/90">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-300" />
          <span>{recoveryNotice}</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowWeek((value) => !value)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
      >
        <CalendarCheck size={13} />
        {showWeek ? t('todayFocus.hideWeek') : t('todayFocus.showWeek')}
        <ChevronDown size={13} className={`transition-transform ${showWeek ? 'rotate-180' : ''}`} />
      </button>

      {showWeek && (
        <div className="mt-3">
          <div className="grid grid-cols-7 gap-1.5">
            {weekRows.map((row, index) => (
              <div
                key={row.key}
                className={[
                  'min-h-[52px] rounded-xl border px-1 py-2 text-center flex flex-col items-center justify-center gap-1',
                  statusClass[row.status],
                ].join(' ')}
                title={row.dayPlan?.focus || ''}
              >
                <span className="text-[9px] font-semibold">{dayLabels[index]}</span>
                {row.completed ? (
                  <CheckCircle2 size={15} />
                ) : row.rest ? (
                  <Moon size={14} />
                ) : (
                  <Dumbbell size={14} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500">
            <span>{t('todayFocus.legendToday')}</span>
            <span>{t('todayFocus.legendDone')}</span>
            <span>{t('todayFocus.legendRest')}</span>
          </div>
        </div>
      )}
    </motion.section>
  );
}
