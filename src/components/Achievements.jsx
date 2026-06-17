import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, Star, Medal } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { getWorkoutLogs, getWaterHistory, getWater, getProgress, getFirstLogin, getMeasurements } from '../lib/dataService';

// ── helpers ──────────────────────────────────────────────

/** Compute the current consecutive-day water streak from loaded data */
function computeWaterStreak(waterHistory, todayWaterData) {
  const history = [...(waterHistory || [])];

  // Also check today's water data
  const todayStr = new Date().toISOString().slice(0, 10);
  if (todayWaterData && todayWaterData.glasses >= 8 && !history.includes(todayStr)) {
    history.push(todayStr);
  }

  if (history.length === 0) return 0;

  // Sort descending and count consecutive days from today backward
  const sorted = [...new Set(history)].sort().reverse();
  let streak = 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(now);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().slice(0, 10);

    if (sorted[i] === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/** How many days since the very first login */
function computeDaysSinceFirstLogin(firstLoginDate) {
  if (!firstLoginDate) return 0;
  const diff = Date.now() - new Date(firstLoginDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Count workout log entries within same ISO week */
function computeMaxWorkoutsInAWeek(logs) {
  if (!logs || logs.length === 0) return 0;

  // Group by ISO week (year-week)
  const weeks = {};
  logs.forEach((log) => {
    const d = new Date(log.date || log.createdAt || Date.now());
    // Get ISO week number
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const dayIndex = Math.floor((d - jan1) / 86400000);
    const weekNum = Math.ceil((dayIndex + jan1.getDay() + 1) / 7);
    const key = `${d.getFullYear()}-W${weekNum}`;
    weeks[key] = (weeks[key] || 0) + 1;
  });

  return Math.max(...Object.values(weeks), 0);
}

/** Find max weight improvement across any same exercise */
function computeMaxWeightImprovement(logs) {
  if (!logs || logs.length < 2) return 0;

  // Group by exercise name
  const exercises = {};
  logs.forEach((log) => {
    const entries = log.exercises || [log];
    entries.forEach((ex) => {
      const name = (ex.name || ex.exercise || '').toLowerCase().trim();
      if (!name) return;
      const weight = parseFloat(ex.weight) || 0;
      if (weight <= 0) return;
      if (!exercises[name]) exercises[name] = [];
      exercises[name].push({ weight, date: log.date || log.createdAt });
    });
  });

  let maxImprovement = 0;
  Object.values(exercises).forEach((records) => {
    if (records.length < 2) return;
    const sorted = records.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const first = sorted[0].weight;
    const last = sorted[sorted.length - 1].weight;
    const diff = last - first;
    if (diff > maxImprovement) maxImprovement = diff;
  });

  return maxImprovement;
}

// ── Achievement definitions ─────────────────────────────
function buildAchievements(plan, { workoutLogs, progressEntries, waterStreak, daysSinceFirst, maxWorkoutsWeek, maxWeightGain }) {

  return [
    {
      id: 'first_step',
      emoji: '🌱',
      title: 'İlk Adım',
      description: 'İlk antrenman kaydını oluşturdun',
      unlocked: workoutLogs.length >= 1,
      progress: Math.min(workoutLogs.length, 1),
      target: 1,
    },
    {
      id: 'iron_fist',
      emoji: '💪',
      title: 'Demir Yumruk',
      description: '10 antrenman kaydı tamamladın',
      unlocked: workoutLogs.length >= 10,
      progress: Math.min(workoutLogs.length, 10),
      target: 10,
    },
    {
      id: 'water_monster',
      emoji: '💧',
      title: 'Su Canavarı',
      description: '7 gün üst üste su hedefini tuttun',
      unlocked: waterStreak >= 7,
      progress: Math.min(waterStreak, 7),
      target: 7,
    },
    {
      id: 'weight_tracker',
      emoji: '⚖️',
      title: 'Tartı Takipçisi',
      description: '5 kilo ölçümü kaydettin',
      unlocked: progressEntries.length >= 5,
      progress: Math.min(progressEntries.length, 5),
      target: 5,
    },
    {
      id: 'macro_master',
      emoji: '🎯',
      title: 'Makro Ustası',
      description: 'Programını oluşturdun',
      unlocked: !!plan,
      progress: plan ? 1 : 0,
      target: 1,
    },
    {
      id: 'week_warrior',
      emoji: '🔥',
      title: 'Hafta Savaşçısı',
      description: '4 antrenmanı bir haftada tamamladın',
      unlocked: maxWorkoutsWeek >= 4,
      progress: Math.min(maxWorkoutsWeek, 4),
      target: 4,
    },
    {
      id: 'consistency_king',
      emoji: '👑',
      title: 'Tutarlılık Kralı',
      description: '30 gün boyunca uygulamayı kullandın',
      unlocked: daysSinceFirst >= 30,
      progress: Math.min(daysSinceFirst, 30),
      target: 30,
    },
    {
      id: 'power_up',
      emoji: '📈',
      title: 'Güç Artışı',
      description: 'Bir egzersizde 10kg ilerleme kaydettin',
      unlocked: maxWeightGain >= 10,
      progress: Math.min(Math.round(maxWeightGain), 10),
      target: 10,
    },
  ];
}

// ── Animation variants ──────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 22 },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Badge Card ──────────────────────────────────────────
function BadgeCard({ achievement }) {
  const { emoji, title, description, unlocked, progress, target } = achievement;
  const pct = target > 0 ? Math.round((progress / target) * 100) : 0;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={unlocked ? { scale: 1.03, y: -4 } : { scale: 1.01 }}
      className={[
        'relative rounded-2xl border p-5 flex flex-col items-center text-center transition-all duration-300',
        unlocked
          ? 'bg-slate-900 border-orange-500/40 shadow-[0_0_25px_rgba(255,109,0,0.12)]'
          : 'bg-slate-900/60 border-dashed border-slate-700 opacity-40 grayscale',
      ].join(' ')}
    >
      {/* Lock overlay for locked badges */}
      {!unlocked && (
        <div className="absolute top-3 right-3">
          <Lock size={16} className="text-slate-600" />
        </div>
      )}

      {/* Unlocked glow decoration */}
      {unlocked && (
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-orange-500/10 via-transparent to-blue-500/10 pointer-events-none" />
      )}

      {/* Emoji */}
      <motion.div
        className="text-4xl mb-3 leading-none"
        animate={unlocked ? { scale: [1, 1.1, 1] } : {}}
        transition={unlocked ? { duration: 2, repeat: Infinity, repeatDelay: 3 } : {}}
      >
        {emoji}
      </motion.div>

      {/* Title */}
      <h3
        className={[
          'font-outfit font-bold text-sm mb-1',
          unlocked ? 'text-white' : 'text-slate-500',
        ].join(' ')}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className={[
          'text-xs leading-relaxed mb-3',
          unlocked ? 'text-slate-400' : 'text-slate-600',
        ].join(' ')}
      >
        {description}
      </p>

      {/* Progress bar */}
      <div className="w-full">
        <div className="flex items-center justify-between text-[10px] mb-1.5">
          <span className={unlocked ? 'text-orange-400 font-semibold' : 'text-slate-600'}>
            {unlocked ? '✓' : `${progress}/${target}`}
          </span>
          <span className={unlocked ? 'text-orange-400/70' : 'text-slate-600'}>
            %{pct}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className={[
              'h-full rounded-full',
              unlocked
                ? 'bg-gradient-to-r from-orange-500 to-blue-500'
                : 'bg-slate-600',
            ].join(' ')}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          />
        </div>
      </div>

      {/* Unlocked star badge */}
      {unlocked && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.5 }}
          className="absolute -top-2 -right-2 flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30"
        >
          <Star size={13} className="text-white" fill="white" />
        </motion.div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// Achievements — main export
// ═══════════════════════════════════════════════════════
export default function Achievements({ plan, user }) {
  const { t } = useTranslation();
  const [achievements, setAchievements] = useState([]);

  const badgeKeys = ['firstStep', 'ironFist', 'waterMonster', 'scaleTracker', 'macroMaster', 'weekWarrior', 'consistencyKing', 'strengthGain'];

  // Load data from dataService and compute achievements
  useEffect(() => {
    let cancelled = false;
    async function loadAchievements() {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const [workoutLogs, waterHistory, todayWaterData, progressEntries, firstLoginDate] = await Promise.all([
          getWorkoutLogs(),
          getWaterHistory(),
          getWater(todayStr),
          getProgress(),
          getFirstLogin(),
        ]);
        if (cancelled) return;

        const waterStreak = computeWaterStreak(waterHistory, todayWaterData);
        const daysSinceFirst = computeDaysSinceFirstLogin(firstLoginDate);
        const maxWorkoutsWeek = computeMaxWorkoutsInAWeek(workoutLogs);
        const maxWeightGain = computeMaxWeightImprovement(workoutLogs);

        const raw = buildAchievements(plan, {
          workoutLogs,
          progressEntries,
          waterStreak,
          daysSinceFirst,
          maxWorkoutsWeek,
          maxWeightGain,
        });
        // Attach translated titles/descriptions
        raw.forEach((a, i) => {
          const key = badgeKeys[i];
          if (key) {
            a.title = t(`achievements.badges.${key}.title`);
            a.description = t(`achievements.badges.${key}.desc`);
          }
        });
        setAchievements(raw);
      } catch (err) {
        console.error('Failed to load achievement data:', err);
      }
    }
    loadAchievements();
    return () => { cancelled = true; };
  }, [plan, t]);

  const unlockedCount = useMemo(
    () => achievements.filter((a) => a.unlocked).length,
    [achievements],
  );

  const totalCount = achievements.length;

  const overallPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-6"
    >
      {/* ── Header ───────────────────────────────────── */}
      <motion.div variants={headerVariants}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10">
              <Trophy size={20} className="text-orange-400" />
            </div>
            <div>
              <h2 className="font-outfit font-bold text-lg text-white leading-tight">
                {t('achievements.title')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('achievements.subtitle')}
              </p>
            </div>
          </div>

          {/* Summary badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/20">
              <Medal size={14} className="text-orange-400" />
              <span className="text-xs font-bold text-white font-outfit">
                {unlockedCount}
                <span className="text-slate-500 font-normal"> / {totalCount}</span>
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">
              %{overallPct}
            </span>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-4">
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            />
          </div>
          <p className="text-[10px] text-slate-600 mt-1.5 text-right">
            {unlockedCount === totalCount
              ? t('achievements.allUnlocked')
              : `${totalCount - unlockedCount} ${t('achievements.remaining')}`}
          </p>
        </div>
      </motion.div>

      {/* ── Badge Grid ───────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {achievements.map((achievement) => (
          <BadgeCard key={achievement.id} achievement={achievement} />
        ))}
      </motion.div>

      {/* ── Footer hint ──────────────────────────────── */}
      <motion.div
        variants={headerVariants}
        className="flex items-center justify-center gap-2 pt-2"
      >
        <Trophy size={12} className="text-slate-600" />
        <p className="text-[10px] text-slate-600">
          {t('achievements.footerHint')}
        </p>
      </motion.div>
    </motion.section>
  );
}
