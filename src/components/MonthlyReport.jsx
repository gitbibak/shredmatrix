import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays, Dumbbell, Flame, Droplets, Moon,
  TrendingUp, TrendingDown, Minus, Trophy, Star,
  Award, Zap,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, Area, AreaChart,
} from 'recharts';
import { useTranslation } from '../i18n/LanguageContext';
import { getWorkoutLogs, getWaterHistory, getProgress, getSleep } from '../lib/dataService';

const containerV = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemV = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Helpers ── */
function getMonthRange(date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0, 23, 59, 59);
  return { start, end };
}

function getPrevMonthRange(date) {
  const y = date.getMonth() === 0 ? date.getFullYear() - 1 : date.getFullYear();
  const m = date.getMonth() === 0 ? 11 : date.getMonth() - 1;
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0, 23, 59, 59);
  return { start, end };
}

function formatMonthYear(date, locale) {
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, sub, color = '#ff6d00', trend, trendLabel }) {
  return (
    <motion.div
      variants={itemV}
      className="rounded-xl bg-slate-950/60 border border-slate-800/50 p-3.5 relative overflow-hidden"
    >
      {/* Subtle gradient glow */}
      <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20" style={{ backgroundColor: color }} />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <Icon size={13} style={{ color }} />
          </div>
          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-medium">{label}</span>
        </div>
        <p className="text-lg font-bold text-white font-outfit">{value}</p>
        {sub && <p className="text-[9px] text-slate-500 mt-0.5">{sub}</p>}
        {trend !== undefined && trend !== null && (
          <div className={`mt-1.5 inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${trend > 0 ? 'bg-green-500/15 text-green-400' : trend < 0 ? 'bg-red-500/15 text-red-400' : 'bg-slate-700/30 text-slate-400'}`}>
            {trend > 0 ? <TrendingUp size={8} /> : trend < 0 ? <TrendingDown size={8} /> : <Minus size={8} />}
            {trend > 0 ? '+' : ''}{trend}% {trendLabel}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Custom Tooltip for chart ── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[10px] text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-white font-outfit">{payload[0].value} kg</p>
    </div>
  );
}

/* ── Main Component ── */
export default function MonthlyReport({ plan }) {
  const { t, lang } = useTranslation();
  const localeMap = { tr: 'tr-TR', en: 'en-US', es: 'es-ES' };
  const locale = localeMap[lang] || 'tr-TR';

  const [workoutData, setWorkoutData] = useState([]);
  const [waterData, setWaterData] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [sleepData, setSleepData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [logs, water, progress, sleep] = await Promise.all([
          getWorkoutLogs(),
          getWaterHistory(60),
          getProgress(),
          getSleep(60),
        ]);
        if (cancelled) return;
        setWorkoutData(logs || []);
        setWaterData(water || []);
        setProgressData(progress || []);
        setSleepData(sleep || []);
      } catch (err) {
        console.error('Failed to load monthly report data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [plan]);

  const report = useMemo(() => {
    const now = new Date();
    const { start: monthStart, end: monthEnd } = getMonthRange(now);
    const { start: prevStart, end: prevEnd } = getPrevMonthRange(now);
    const daysInMonth = monthEnd.getDate();
    const dayOfMonth = now.getDate();

    // ── Workouts ──
    const monthWorkouts = workoutData.filter(l => {
      const d = new Date(l.date);
      return d >= monthStart && d <= monthEnd;
    });
    const prevWorkouts = workoutData.filter(l => {
      const d = new Date(l.date);
      return d >= prevStart && d <= prevEnd;
    });
    const workoutCount = monthWorkouts.length;
    const prevWorkoutCount = prevWorkouts.length;
    const workoutTrend = prevWorkoutCount > 0 ? Math.round(((workoutCount - prevWorkoutCount) / prevWorkoutCount) * 100) : null;

    // ── Top 5 exercises ──
    const exerciseCounts = {};
    monthWorkouts.forEach(log => {
      (log.exercises || []).forEach(ex => {
        const name = ex.name || ex.exercise || 'Unknown';
        exerciseCounts[name] = (exerciseCounts[name] || 0) + 1;
      });
    });
    const topExercises = Object.entries(exerciseCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // ── Average daily calories ──
    let avgCalories = plan?.dailyCalories ? Math.round(plan.dailyCalories) : 0;

    // ── Water consistency ──
    const waterTarget = 8; // default target
    const monthWater = waterData.filter(w => {
      const d = new Date(w.date);
      return d >= monthStart && d <= monthEnd;
    });
    const waterDaysMet = monthWater.filter(w => (w.glasses || 0) >= waterTarget || w.target_met).length;
    const waterConsistency = dayOfMonth > 0 ? Math.round((waterDaysMet / dayOfMonth) * 100) : 0;

    const prevMonthWater = waterData.filter(w => {
      const d = new Date(w.date);
      return d >= prevStart && d <= prevEnd;
    });
    const prevWaterDaysMet = prevMonthWater.filter(w => (w.glasses || 0) >= waterTarget || w.target_met).length;
    const prevDaysInMonth = prevEnd.getDate();
    const prevWaterConsistency = prevDaysInMonth > 0 ? Math.round((prevWaterDaysMet / prevDaysInMonth) * 100) : 0;
    const waterTrend = prevWaterConsistency > 0 ? Math.round(((waterConsistency - prevWaterConsistency) / prevWaterConsistency) * 100) : null;

    // ── Sleep average ──
    const monthSleep = sleepData.filter(s => {
      const d = new Date(s.date);
      return d >= monthStart && d <= monthEnd;
    });
    const sleepAvg = monthSleep.length > 0
      ? +(monthSleep.reduce((sum, s) => sum + (s.hours || 0), 0) / monthSleep.length).toFixed(1)
      : 0;

    const prevMonthSleep = sleepData.filter(s => {
      const d = new Date(s.date);
      return d >= prevStart && d <= prevEnd;
    });
    const prevSleepAvg = prevMonthSleep.length > 0
      ? +(prevMonthSleep.reduce((sum, s) => sum + (s.hours || 0), 0) / prevMonthSleep.length).toFixed(1)
      : 0;
    const sleepTrend = prevSleepAvg > 0 ? Math.round(((sleepAvg - prevSleepAvg) / prevSleepAvg) * 100) : null;

    // ── Weight trend chart ──
    const monthProgress = progressData
      .filter(p => {
        const d = new Date(p.date);
        return d >= monthStart && d <= monthEnd;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(p => ({
        date: new Date(p.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
        weight: p.weight || p.body_weight,
      }));

    // ── Longest streak ──
    let longestStreak = 0;
    let currentStreak = 0;
    const workoutDates = new Set(monthWorkouts.map(l => new Date(l.date).toDateString()));
    for (let d = 1; d <= dayOfMonth; d++) {
      const dateStr = new Date(now.getFullYear(), now.getMonth(), d).toDateString();
      if (workoutDates.has(dateStr)) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    // ── Motivational message ──
    let performance = 'stable';
    if (workoutTrend !== null) {
      if (workoutTrend > 10) performance = 'improving';
      else if (workoutTrend < -10) performance = 'declining';
    }

    return {
      monthLabel: formatMonthYear(now, locale),
      workoutCount,
      prevWorkoutCount,
      workoutTrend,
      avgCalories,
      waterConsistency,
      waterTrend,
      sleepAvg,
      sleepTrend,
      weightChart: monthProgress,
      topExercises,
      longestStreak,
      performance,
    };
  }, [workoutData, waterData, progressData, sleepData, plan, lang, locale]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerV}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4"
    >
      {/* ── Header ── */}
      <motion.div variants={itemV} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-orange-400" />
          <h3 className="text-sm font-bold font-outfit text-white">{t('report.monthlyTitle')}</h3>
        </div>
        <span className="text-[10px] text-slate-500 bg-slate-800 px-2.5 py-0.5 rounded-full capitalize">{report.monthLabel}</span>
      </motion.div>

      {/* ── Stats Grid (2×2) ── */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          icon={Dumbbell}
          label={t('report.workouts')}
          value={report.workoutCount}
          sub={`${report.prevWorkoutCount} ${t('report.vsLastMonth')}`}
          color="#ff6d00"
          trend={report.workoutTrend}
          trendLabel={t('report.vsLastMonth')}
        />
        <StatCard
          icon={Flame}
          label={t('report.avgCalories')}
          value={`${report.avgCalories}`}
          sub="kcal/gün"
          color="#f59e0b"
        />
        <StatCard
          icon={Droplets}
          label={t('report.waterConsistency')}
          value={`%${report.waterConsistency}`}
          sub={t('report.waterConsistency')}
          color="#00b0ff"
          trend={report.waterTrend}
          trendLabel={t('report.vsLastMonth')}
        />
        <StatCard
          icon={Moon}
          label={t('report.avgSleep')}
          value={`${report.sleepAvg}h`}
          sub={report.sleepAvg >= 7 ? '✓' : '⚠️'}
          color="#8b5cf6"
          trend={report.sleepTrend}
          trendLabel={t('report.vsLastMonth')}
        />
      </div>

      {/* ── Weight Trend Chart ── */}
      {report.weightChart.length >= 2 && (
        <motion.div variants={itemV} className="rounded-xl bg-slate-950/50 border border-slate-800/50 p-3">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={13} className="text-orange-400" />
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{t('report.weightTrend')}</p>
          </div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.weightChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6d00" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ff6d00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="weight" stroke="#ff6d00" strokeWidth={2} fill="url(#weightGradient)" dot={{ fill: '#ff6d00', r: 3, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* ── Top 5 Exercises ── */}
      {report.topExercises.length > 0 && (
        <motion.div variants={itemV} className="rounded-xl bg-slate-950/50 border border-slate-800/50 p-3">
          <div className="flex items-center gap-2 mb-3">
            <Star size={13} className="text-orange-400" />
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{t('report.topExercises')}</p>
          </div>
          <div className="space-y-1.5">
            {report.topExercises.map((ex, i) => {
              const maxCount = report.topExercises[0].count;
              return (
                <motion.div
                  key={ex.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-[9px] font-bold text-slate-600 w-4 text-right">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] text-white font-medium truncate max-w-[140px]">{ex.name}</span>
                      <span className="text-[9px] text-orange-400 font-bold">{ex.count}×</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(ex.count / maxCount) * 100}%` }}
                        transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-blue-500"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Streak Info ── */}
      <motion.div variants={itemV} className="flex items-center gap-3 rounded-xl bg-slate-950/50 border border-slate-800/50 px-3 py-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/15">
          <Trophy size={14} className="text-amber-400" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500">{t('report.longestStreak')}</p>
          <p className="text-sm font-bold text-white font-outfit">{report.longestStreak} {report.longestStreak === 1 ? 'gün' : 'gün'}</p>
        </div>
      </motion.div>

      {/* ── Motivational Message ── */}
      <motion.div
        variants={itemV}
        className="text-center py-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/10"
      >
        <Zap size={22} className="text-orange-400 mx-auto mb-1.5" />
        <p className="text-xs font-bold text-white font-outfit px-4">
          {report.performance === 'improving'
            ? t('report.improving')
            : report.performance === 'declining'
              ? t('report.declining')
              : t('report.stable')}
        </p>
      </motion.div>

      {/* ── No Data Fallback ── */}
      {report.workoutCount === 0 && report.weightChart.length === 0 && (
        <motion.div variants={itemV} className="text-center py-6">
          <p className="text-xs text-slate-500">{t('report.noData')}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
