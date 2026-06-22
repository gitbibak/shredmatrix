import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, AlertTriangle, CheckCircle, Clock, Flame, Droplets, Sparkles, Leaf, ChevronDown } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

const itemV = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ── Goal key mapping ── */
function resolveGoalKey(goal) {
  if (!goal) return 'muscle';
  const g = goal.toLowerCase();
  if (g.includes('yağ') || g.includes('fat')) return 'fat_loss';
  if (g.includes('medit')) return 'meditation';
  if (g.includes('yoga')) return 'yoga';
  if (g.includes('pilates')) return 'pilates';
  if (g.includes('reformer')) return 'reformer';
  return 'muscle';
}

/* ── Static data per goal (emoji + importance only — language-independent) ── */
const supplementMeta = {
  muscle: [
    { emoji: '⚡', importance: 'high' },
    { emoji: '🥛', importance: 'high' },
    { emoji: '🐟', importance: 'medium' },
    { emoji: '☀️', importance: 'medium' },
    { emoji: '🌙', importance: 'low' },
    { emoji: '🧬', importance: 'low' },
  ],
  fat_loss: [
    { emoji: '☕', importance: 'high' },
    { emoji: '🥛', importance: 'high' },
    { emoji: '🔥', importance: 'medium' },
    { emoji: '🍵', importance: 'medium' },
    { emoji: '🐟', importance: 'medium' },
    { emoji: '💊', importance: 'low' },
  ],
  meditation: [
    { emoji: '🧠', importance: 'high' },
    { emoji: '🍵', importance: 'high' },
    { emoji: '🌿', importance: 'medium' },
    { emoji: '🐟', importance: 'medium' },
    { emoji: '💊', importance: 'low' },
  ],
  yoga: [
    { emoji: '✨', importance: 'high' },
    { emoji: '☀️', importance: 'high' },
    { emoji: '🦴', importance: 'medium' },
    { emoji: '🟡', importance: 'medium' },
    { emoji: '🐟', importance: 'low' },
  ],
  pilates: [
    { emoji: '🦴', importance: 'high' },
    { emoji: '✨', importance: 'high' },
    { emoji: '☀️', importance: 'medium' },
    { emoji: '💧', importance: 'medium' },
    { emoji: '💊', importance: 'low' },
  ],
  reformer: [
    { emoji: '🦴', importance: 'high' },
    { emoji: '🥛', importance: 'high' },
    { emoji: '✨', importance: 'medium' },
    { emoji: '🟡', importance: 'medium' },
    { emoji: '💧', importance: 'low' },
  ],
};

/* ── Build translated supplement data ── */
function buildSupplements(t, goalKey) {
  const meta = supplementMeta[goalKey] || supplementMeta.muscle;
  return meta.map((m, i) => ({
    ...m,
    name: t(`supplement.${goalKey}_${i}_name`),
    dose: t(`supplement.${goalKey}_${i}_dose`),
    freq: t(`supplement.${goalKey}_${i}_freq`),
    schedule: t(`supplement.${goalKey}_${i}_schedule`),
    why: t(`supplement.${goalKey}_${i}_why`),
    detail: t(`supplement.${goalKey}_${i}_detail`),
  }));
}

/* ── Goal labels ── */
const goalLabels = {
  muscle: 'muscleGoal', fat_loss: 'fatGoal',
  meditation: 'meditationGoal', yoga: 'yogaGoal',
  pilates: 'pilatesGoal', reformer: 'reformerGoal',
};

/* ── Section titles per goal type ── */
const sectionConfig = {
  muscle: { icon: Pill, titleKey: 'title' },
  fat_loss: { icon: Pill, titleKey: 'title' },
  meditation: { icon: Leaf, titleKey: 'titleWellness' },
  yoga: { icon: Leaf, titleKey: 'titleWellness' },
  pilates: { icon: Sparkles, titleKey: 'title' },
  reformer: { icon: Sparkles, titleKey: 'title' },
};

const importanceIcons = { high: CheckCircle, medium: Flame, low: Clock };
const importanceColors = { high: '#22c55e', medium: '#f59e0b', low: '#64748b' };

export default function SupplementGuide({ goal }) {
  const { t } = useTranslation();
  const goalKey = resolveGoalKey(goal);
  const supplements = useMemo(() => buildSupplements(t, goalKey), [t, goalKey]);
  const importanceLabels = { high: t('supplement.important'), medium: t('supplement.useful'), low: t('supplement.optional') };
  const config = sectionConfig[goalKey] || sectionConfig.muscle;
  const HeaderIcon = config.icon;
  const [expanded, setExpanded] = useState(null);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
    >
      {/* Header */}
      <motion.div variants={itemV} className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HeaderIcon size={16} className="text-orange-400" />
          <h3 className="text-sm font-bold font-outfit text-white">
            {t(`supplement.${config.titleKey}`)}
          </h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
          {t(`supplement.${goalLabels[goalKey]}`)}
        </span>
      </motion.div>

      {/* Warning */}
      <motion.div variants={itemV} className="flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-500/5 border border-amber-500/10 mb-4">
        <AlertTriangle size={12} className="text-amber-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-slate-400 leading-relaxed">
          {t(`supplement.warning_${goalKey}`) || t('supplement.warning')}
        </p>
      </motion.div>

      {/* Daily Schedule Summary */}
      <motion.div variants={itemV} className="mb-4 p-2.5 rounded-xl bg-slate-800/30 border border-slate-700/20">
        <h4 className="text-[10px] font-bold font-outfit text-slate-400 mb-2 flex items-center gap-1.5">
          <Clock size={10} className="text-blue-400" />
          {t('supplement.dailySchedule')}
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { time: '☀️', label: t('supplement.morning'), items: supplements.filter(s => s.schedule.includes('☀️')) },
            { time: '💪', label: t('supplement.workout'), items: supplements.filter(s => s.schedule.includes('💪')) },
            { time: '🍽️', label: t('supplement.withMeal'), items: supplements.filter(s => s.schedule.includes('🍽️')) },
            { time: '🌙', label: t('supplement.evening'), items: supplements.filter(s => s.schedule.includes('🌙')) },
          ].filter(slot => slot.items.length > 0).map(slot => (
            <div key={slot.label} className="px-2 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800/30">
              <p className="text-[9px] font-bold text-white mb-0.5">{slot.time} {slot.label}</p>
              {slot.items.map(s => (
                <p key={s.name} className="text-[8px] text-slate-500 leading-tight">{s.emoji} {s.name}</p>
              ))}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Supplement cards — compact with expandable detail */}
      <div className="space-y-1.5">
        {supplements.map((sup) => {
          const ImpIcon = importanceIcons[sup.importance];
          const isOpen = expanded === sup.name;
          return (
            <motion.div
              key={sup.name}
              variants={itemV}
              className="rounded-xl bg-slate-950/50 border border-slate-800/50 overflow-hidden"
            >
              {/* Compact row — always visible */}
              <button
                onClick={() => setExpanded(isOpen ? null : sup.name)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left cursor-pointer"
              >
                <span className="text-base">{sup.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-white font-outfit truncate">{sup.name}</span>
                    <span
                      className="flex items-center gap-0.5 text-[8px] px-1 py-px rounded-full shrink-0"
                      style={{ backgroundColor: `${importanceColors[sup.importance]}15`, color: importanceColors[sup.importance] }}
                    >
                      <ImpIcon size={7} />
                      {importanceLabels[sup.importance]}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 truncate">{sup.dose} · {sup.freq} · {sup.schedule}</p>
                </div>
                <ChevronDown size={12} className={`text-slate-600 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Expandable detail */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 pt-0 border-t border-slate-800/30">
                      <p className="text-[10px] text-slate-300 mt-2 mb-1.5 leading-relaxed">{sup.why}</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed italic mb-2">{sup.detail}</p>
                      <div className="flex flex-wrap gap-1.5 text-[8px]">
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-800/60 text-orange-400">
                          <Droplets size={8} /> {sup.dose}
                        </span>
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-800/60 text-blue-400">
                          <Clock size={8} /> {sup.freq}
                        </span>
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-800/60 text-emerald-400">
                          {sup.schedule}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
