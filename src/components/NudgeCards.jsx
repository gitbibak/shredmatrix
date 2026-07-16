import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n/LanguageContext';
import {
  Droplets, Moon, Ruler, Scale, Dumbbell, X, ChevronRight,
  Flame, Trophy, Sparkles, Target,
} from 'lucide-react';
import {
  getWaterHistory, getSleep, getProgress,
  getMeasurements, getWorkoutLogs,
} from '../lib/dataService';

// ── Card Type Config ────────────────────────────────────
const CARD_CONFIGS = {
  water: {
    icon: Droplets,
    tint: 'bg-cyan-500/10',
    border: 'border-slate-800/75',
    iconColor: 'text-blue-400',
    priority: 1,
  },
  sleep: {
    icon: Moon,
    tint: 'bg-violet-500/10',
    border: 'border-slate-800/75',
    iconColor: 'text-indigo-400',
    priority: 2,
  },
  workout: {
    icon: Dumbbell,
    tint: 'bg-orange-500/10',
    border: 'border-slate-800/75',
    iconColor: 'text-orange-400',
    priority: 0,
  },
  measurement: {
    icon: Ruler,
    tint: 'bg-emerald-500/10',
    border: 'border-slate-800/75',
    iconColor: 'text-emerald-400',
    priority: 4,
  },
  progress: {
    icon: Scale,
    tint: 'bg-pink-500/10',
    border: 'border-slate-800/75',
    iconColor: 'text-pink-400',
    priority: 3,
  },
  streak: {
    icon: Flame,
    tint: 'bg-amber-500/10',
    border: 'border-slate-800/75',
    iconColor: 'text-amber-400',
    priority: 5,
  },
  milestone: {
    icon: Trophy,
    tint: 'bg-yellow-500/10',
    border: 'border-slate-800/75',
    iconColor: 'text-yellow-400',
    priority: -1, // highest
  },
};

// ── Dismiss Logic ───────────────────────────────────────
const DISMISS_KEY = 'fb_nudge_dismissed';

function getDismissed() {
  try {
    return JSON.parse(localStorage.getItem(DISMISS_KEY) || '{}');
  } catch (err) { console.warn('[NudgeCards]', err?.message || err); return {}; }
}

function dismissNudge(id) {
  try {
    const dismissed = getDismissed();
    dismissed[id] = Date.now();
    localStorage.setItem(DISMISS_KEY, JSON.stringify(dismissed));
  } catch (err) { console.warn('[NudgeCards]', err?.message || err); }
}

function isRecentlyDismissed(id, hours = 12) {
  const dismissed = getDismissed();
  if (!dismissed[id]) return false;
  return (Date.now() - dismissed[id]) < hours * 3600000;
}

// ── Single Nudge Card ───────────────────────────────────
function NudgeCard({ nudge, onDismiss, onAction }) {
  const config = CARD_CONFIGS[nudge.type] || CARD_CONFIGS.workout;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative group rounded-xl border ${config.border} bg-slate-900/45 px-3 py-2.5 cursor-pointer transition-colors hover:bg-slate-900/70`}
      onClick={() => onAction?.(nudge)}
    >
      {/* Dismiss button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(nudge.id); }}
        aria-label="Kapat"
        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-800/60 text-slate-500 hover:text-slate-300 hover:bg-slate-700/60 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        <X size={10} />
      </button>

      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`shrink-0 w-8 h-8 rounded-lg ${config.tint} flex items-center justify-center ${config.iconColor}`}>
          <Icon size={16} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white font-outfit leading-tight">
            {nudge.title}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
            {nudge.message}
          </p>
        </div>

        {/* Score boost badge */}
        {nudge.scoreBoost && (
          <div className="shrink-0 hidden items-center gap-0.5 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-2 py-1 sm:flex">
            <Target size={9} className="text-emerald-400" />
            <span className="text-[8px] font-bold text-emerald-400">+{nudge.scoreBoost}</span>
          </div>
        )}

        {/* Arrow */}
        <ChevronRight size={14} className="shrink-0 text-slate-600 group-hover:text-slate-400 transition-colors" />
      </div>
    </motion.div>
  );
}

// ── Milestone Card (Special - positive reinforcement) ───
function MilestoneCard({ nudge, onDismiss }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative rounded-xl border border-slate-800/75 bg-slate-900/45 px-3 py-2.5"
    >
      <button
        onClick={() => onDismiss(nudge.id)}
        aria-label="Kapat"
        className="absolute top-2 right-2 p-1 rounded-full bg-slate-800/60 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
      >
        <X size={10} />
      </button>
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
          <span className="text-lg">{nudge.emoji}</span>
        </div>
        <div>
          <p className="text-xs font-bold text-yellow-300 font-outfit">{nudge.title}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{nudge.message}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════
export default function NudgeCards({ plan, onNavigate }) {
  const { t } = useTranslation();
  const [nudges, setNudges] = useState([]);
  const [dismissed, setDismissed] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function checkData() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 86400000);
        const monthAgo = new Date(Date.now() - 30 * 86400000);

        const [logs, water, sleep, progress, measurements] = await Promise.all([
          getWorkoutLogs().catch(() => []),
          getWaterHistory(30).catch(() => []),
          getSleep(30).catch(() => []),
          getProgress().catch(() => []),
          getMeasurements().catch(() => []),
        ]);

        if (cancelled) return;

        const result = [];

        // ── 1. Bugün antrenman var mı, yapıldı mı? ──
        // Map JS getDay() (0=Sun) to plan array index (0=Mon)
        const todayIdx = (new Date().getDay() + 6) % 7;
        const todayPlan = plan?.workoutSplit?.[todayIdx];
        const isTrainingDay = todayPlan && !todayPlan.isRest && !todayPlan.focus?.toLowerCase().includes('dinlenme');
        const todayLogged = logs.some(l => (l.date || l.createdAt || '').startsWith(today));

        if (isTrainingDay && !todayLogged) {
          result.push({
            id: `workout_${today}`,
            type: 'workout',
            title: t('nudge.workout.title'),
            message: t('nudge.workout.message', { focus: todayPlan.focus }),
            scoreBoost: 15,
            tab: 'workout',
          });
        }

        // ── 2. Bugün su takibi yapıldı mı? ──
        const todayWater = water.find(w => w.date === today);
        if (!todayWater || (todayWater.glasses || todayWater.amount || 0) < 2) {
          result.push({
            id: `water_${today}`,
            type: 'water',
            title: t('nudge.water.title'),
            message: t('nudge.water.message'),
            scoreBoost: 8,
            tab: 'nutrition',
          });
        }

        // ── 3. Bugün uyku girişi var mı? ──
        const todaySleep = sleep.find(s => s.date === today);
        if (!todaySleep) {
          result.push({
            id: `sleep_${today}`,
            type: 'sleep',
            title: t('nudge.sleep.title'),
            message: t('nudge.sleep.message'),
            scoreBoost: 8,
            tab: 'progress',
          });
        }

        // ── 4. Son 2 haftada kilo girişi var mı? ──
        const recentProgress = progress.filter(p => new Date(p.date) >= new Date(Date.now() - 14 * 86400000));
        if (recentProgress.length === 0) {
          result.push({
            id: `progress_week`,
            type: 'progress',
            title: t('nudge.progress.title'),
            message: t('nudge.progress.message'),
            scoreBoost: 5,
            tab: 'progress',
          });
        }

        // ── 5. Son 30 günde ölçüm var mı? ──
        const recentMeasure = measurements.filter(m => new Date(m.date) >= monthAgo);
        if (recentMeasure.length === 0) {
          result.push({
            id: `measurement_month`,
            type: 'measurement',
            title: t('nudge.measurement.title'),
            message: t('nudge.measurement.message'),
            scoreBoost: 5,
            tab: 'progress',
          });
        }

        // ── 6. Streak teşviki ──
        const weekLogs = logs.filter(l => new Date(l.date || l.createdAt) >= weekAgo);
        const uniqueDays = new Set(weekLogs.map(l => (l.date || l.createdAt || '').split('T')[0]));
        if (uniqueDays.size >= 3 && uniqueDays.size < 5) {
          result.push({
            id: `streak_${uniqueDays.size}`,
            type: 'streak',
            title: t('nudge.streak.title', { count: uniqueDays.size }),
            message: t('nudge.streak.message'),
            tab: 'workout',
          });
        }

        // ── 7. Milestone (pozitif pekiştirme) ──
        if (uniqueDays.size >= 5) {
          result.push({
            id: `milestone_5`,
            type: 'milestone',
            emoji: '🏆',
            title: t('nudge.milestone.weekComplete'),
            message: t('nudge.milestone.weekCompleteMsg'),
          });
        }

        const totalLogs = logs.length;
        if (totalLogs === 1) {
          result.push({
            id: 'milestone_first',
            type: 'milestone',
            emoji: '🎉',
            title: t('nudge.milestone.firstWorkout'),
            message: t('nudge.milestone.firstWorkoutMsg'),
          });
        }

        // Filter dismissed & sort by priority
        const filtered = result.filter(n => !isRecentlyDismissed(n.id));
        filtered.sort((a, b) => {
          const pa = CARD_CONFIGS[a.type]?.priority ?? 99;
          const pb = CARD_CONFIGS[b.type]?.priority ?? 99;
          return pa - pb;
        });

        // Max 3 nudges at a time
        setNudges(filtered.slice(0, 3));
      } catch (err) { console.warn('[NudgeCards]', err?.message || err);
        setNudges([]);
      }
    }

    checkData();
    return () => { cancelled = true; };
  }, [plan, t]);

  const handleDismiss = (id) => {
    dismissNudge(id);
    setDismissed(prev => ({ ...prev, [id]: true }));
    setNudges(prev => prev.filter(n => n.id !== id));
  };

  const handleAction = (nudge) => {
    if (nudge.tab && onNavigate) {
      onNavigate(nudge.tab);
    }
  };

  const visibleNudges = nudges.filter(n => !dismissed[n.id]);

  if (visibleNudges.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mb-4 space-y-2"
    >
      {/* Section header */}
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles size={11} className="text-orange-400" />
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          {t('nudge.sectionTitle')}
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {visibleNudges.map((nudge) =>
          nudge.type === 'milestone' ? (
            <MilestoneCard
              key={nudge.id}
              nudge={nudge}
              onDismiss={handleDismiss}
            />
          ) : (
            <NudgeCard
              key={nudge.id}
              nudge={nudge}
              onDismiss={handleDismiss}
              onAction={handleAction}
            />
          )
        )}
      </AnimatePresence>
    </motion.div>
  );
}
