import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n/LanguageContext';
import { Zap, Droplets, Moon, Dumbbell, ArrowRight } from 'lucide-react';
import { getWorkoutLogs, getWaterHistory, getSleep } from '../lib/dataService';

function StatPill({ icon: Icon, label, value, accent }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-800/70 bg-slate-950/55 px-3 py-3">
      <div className="flex items-center gap-2">
        <Icon size={15} className={accent} />
        <span className="truncate text-[11px] font-medium text-slate-500">{label}</span>
      </div>
      <p className="mt-1 truncate text-base font-black font-outfit text-white">{value}</p>
    </div>
  );
}

export default function HeroCard({ plan }) {
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

    if (!todayPlan || todayPlan.isRest) {
      return {
        title: lang === 'tr' ? 'Dinlenme günü' : 'Rest day',
        subtitle: lang === 'tr'
          ? 'Bugün hafif yürüyüş, su ve uykuya odaklan.'
          : 'Keep it light today and focus on water and sleep.',
        cta: lang === 'tr' ? 'Bugünü takip et' : 'Track today',
      };
    }

    return {
      title: todayPlan.focus || todayPlan.day,
      subtitle: lang === 'tr'
        ? `${todayPlan.exercises?.length || 0} egzersiz hazır. Önce antrenmanı aç, sonra öğünleri takip et.`
        : `${todayPlan.exercises?.length || 0} exercises ready. Start with training, then track meals.`,
      cta: lang === 'tr' ? 'Bugünü başlat' : 'Start today',
    };
  }, [lang, plan]);

  const weeklyTarget = plan?.workoutSplit?.filter((day) => !day.isRest).length || 4;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mb-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-black/10"
      aria-label={lang === 'tr' ? 'Bugün özeti' : 'Today summary'}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-orange-400">
            {lang === 'tr' ? 'Bugün' : t('hero.todayWorkout')}
          </p>
          <h2 className="text-xl font-black font-outfit leading-tight text-white sm:text-2xl">
            {todayInfo.title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-400">
            {todayInfo.subtitle}
          </p>
        </div>

        <div className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-orange-500/25 bg-orange-500/10 px-4 py-3 text-sm font-bold text-orange-300">
          {todayInfo.cta}
          <ArrowRight size={16} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
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
