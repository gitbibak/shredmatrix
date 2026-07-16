import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n/LanguageContext';
import { Zap, Droplets, Moon, Dumbbell, ArrowRight, CalendarDays } from 'lucide-react';
import { getWorkoutLogs, getWaterHistory, getSleep } from '../lib/dataService';

function StatPill({ icon: Icon, label, value, accent }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-800/70 bg-slate-950/45 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <Icon size={13} className={accent} />
        <span className="truncate text-[10px] font-medium text-slate-500">{label}</span>
      </div>
      <p className="mt-0.5 truncate text-sm font-black font-outfit text-white">{value}</p>
    </div>
  );
}

export default function HeroCard({ plan, onNavigate }) {
  const { t, lang } = useTranslation();
  const [waterToday, setWaterToday] = useState(0);
  const [sleepToday, setSleepToday] = useState(null);
  const [workoutsThisWeek, setWorkoutsThisWeek] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadTodayData() {
      try {
        const [logs, water, sleep] = await Promise.all([
          getWorkoutLogs().catch(() => []),
          getWaterHistory(7).catch(() => []),
          getSleep(7).catch(() => []),
        ]);
        if (cancelled) return;

        const todayStr = new Date().toISOString().split('T')[0];
        const todayWater = water.find((item) => item.date === todayStr);
        const todaySleep = sleep.find((item) => item.date === todayStr);
        const weekAgo = new Date(Date.now() - 7 * 86400000);
        const recentLogs = logs.filter((item) => new Date(item.date || item.createdAt) >= weekAgo);

        setWaterToday(todayWater?.glasses || todayWater?.amount || 0);
        setSleepToday(todaySleep?.hours || null);
        setWorkoutsThisWeek(new Set(recentLogs.map((item) => (item.date || item.createdAt || '').split('T')[0])).size);
      } catch {
        if (!cancelled) {
          setWaterToday(0);
          setSleepToday(null);
          setWorkoutsThisWeek(0);
        }
      }
    }

    loadTodayData();
    return () => { cancelled = true; };
  }, []);

  const todayInfo = useMemo(() => {
    const dayNames = lang === 'tr'
      ? ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const turkishDayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const todayIndex = new Date().getDay();
    const todayPlan = plan?.workoutSplit?.find((day) => day.day === turkishDayNames[todayIndex] || day.day === dayNames[todayIndex]);

    const exerciseCount = todayPlan?.exercises?.length || 0;
    const focusText = String(todayPlan?.focus || todayPlan?.day || '').toLowerCase();
    const isRestLike = !todayPlan || todayPlan.isRest || exerciseCount === 0 || focusText.includes('dinlen') || focusText.includes('rest');

    if (isRestLike) {
      return {
        title: lang === 'tr' ? 'Dinlenme günü' : 'Rest day',
        subtitle: lang === 'tr'
          ? 'Bugün antrenman yok. Su, öğün ve uyku takibini tamamla.'
          : 'No workout today. Keep water, meals and sleep on track.',
        cta: lang === 'tr' ? 'Takibe geç' : 'Track today',
        targetTab: 'nutrition',
      };
    }

    return {
      title: todayPlan.focus || todayPlan.day,
      subtitle: lang === 'tr'
        ? `${exerciseCount} egzersiz hazır. Antrenmanı açıp doğrudan başlayabilirsin.`
        : `${exerciseCount} exercises ready. Open training and start directly.`,
      cta: lang === 'tr' ? 'Bugünü başlat' : 'Start today',
      targetTab: 'workout',
    };
  }, [lang, plan]);

  const weeklyTarget = plan?.workoutSplit?.filter((day) => !day.isRest).length || 4;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mb-4 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/55 p-3.5 shadow-lg shadow-black/10"
      aria-label={lang === 'tr' ? 'Bugün özeti' : 'Today summary'}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
          <CalendarDays size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-orange-400">
              {lang === 'tr' ? 'Bugün' : t('hero.todayWorkout')}
            </p>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <p className="truncate text-xs font-medium text-slate-500">{plan?.goal}</p>
          </div>
          <h2 className="mt-0.5 text-lg font-black font-outfit leading-tight text-white">
            {todayInfo.title}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            {todayInfo.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate?.(todayInfo.targetTab)}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-orange-500/25 bg-orange-500/10 px-3 py-2 text-xs font-bold text-orange-300 transition-colors hover:bg-orange-500/15"
        >
          {todayInfo.cta}
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatPill
          icon={Zap}
          label={lang === 'tr' ? 'Kalori hedefi' : t('hero.calories')}
          value={`${plan?.dailyCalories || '—'} kcal`}
          accent="text-orange-400"
        />
        <StatPill
          icon={Droplets}
          label={lang === 'tr' ? 'Su' : t('hero.water')}
          value={`${waterToday}/7`}
          accent="text-cyan-400"
        />
        <StatPill
          icon={Dumbbell}
          label={lang === 'tr' ? 'Haftalık' : t('hero.workout')}
          value={`${workoutsThisWeek}/${weeklyTarget}`}
          accent="text-emerald-400"
        />
        <StatPill
          icon={Moon}
          label={lang === 'tr' ? 'Uyku' : t('hero.sleep')}
          value={sleepToday ? `${sleepToday} sa` : '—'}
          accent="text-violet-400"
        />
      </div>
    </motion.section>
  );
}
