import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Dumbbell,
  Flame,
  Moon,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { getWorkoutLogs } from '../lib/dataService';

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
  const remainingWorkouts = Math.max(trainingDays - completedThisWeek, 0);
  const todayExerciseCount = todayRow?.dayPlan?.exercises?.length || 0;
  const todayCompleted = todayRow?.completed;
  const restToday = todayRow?.rest;

  const dayLabels = DAY_NAMES[lang] || DAY_NAMES.tr;
  const title = restToday ? t('todayFocus.restTitle') : t('todayFocus.workoutTitle');
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
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4 mb-5">
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
            <h2 className="text-2xl sm:text-3xl font-outfit font-extrabold text-white leading-tight">
              {title}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mt-2">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-bold text-slate-300 shrink-0">
          <Flame size={14} className="text-orange-400" />
          {completedThisWeek}/{trainingDays || 0}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
          <p className="text-[10px] text-slate-500 mb-1">{t('todayFocus.weekTarget')}</p>
          <p className="text-lg font-outfit font-bold text-white">
            {completedThisWeek}/{trainingDays || 0}
          </p>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
          <p className="text-[10px] text-slate-500 mb-1">{t('todayFocus.remaining')}</p>
          <p className="text-lg font-outfit font-bold text-white">
            {remainingWorkouts}
          </p>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 col-span-2 sm:col-span-1">
          <p className="text-[10px] text-slate-500 mb-1">{t('todayFocus.todayLoad')}</p>
          <p className="text-lg font-outfit font-bold text-white">
            {restToday ? t('todayFocus.rest') : `${todayExerciseCount} ${t('todayFocus.exercise')}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-5">
        {weekRows.map((row, index) => (
          <div
            key={row.key}
            className={[
              'min-h-[56px] rounded-xl border px-1 py-2 text-center flex flex-col items-center justify-center gap-1',
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

      <button
        type="button"
        onClick={() => onNavigate?.(ctaTarget)}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm font-outfit font-bold text-orange-300 hover:bg-orange-500/15 transition-colors"
      >
        {todayCompleted ? t('todayFocus.completedCta') : ctaLabel}
        <ArrowRight size={16} />
      </button>

      <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <CalendarCheck size={12} className="text-orange-400" />
          {t('todayFocus.legendToday')}
        </span>
        <span>{t('todayFocus.legendDone')}</span>
        <span>{t('todayFocus.legendRest')}</span>
      </div>
    </motion.section>
  );
}
