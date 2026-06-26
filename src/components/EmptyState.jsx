import { motion } from 'framer-motion';
import { Droplets, Dumbbell, Moon, Ruler, TrendingUp, UtensilsCrossed } from 'lucide-react';

const PRESETS = {
  workout: {
    icon: Dumbbell,
    color: 'text-orange-400',
    bg: 'from-orange-500/10 to-amber-500/5',
  },
  nutrition: {
    icon: UtensilsCrossed,
    color: 'text-emerald-400',
    bg: 'from-emerald-500/10 to-green-500/5',
  },
  water: {
    icon: Droplets,
    color: 'text-cyan-400',
    bg: 'from-cyan-500/10 to-blue-500/5',
  },
  sleep: {
    icon: Moon,
    color: 'text-indigo-400',
    bg: 'from-indigo-500/10 to-purple-500/5',
  },
  progress: {
    icon: TrendingUp,
    color: 'text-green-400',
    bg: 'from-green-500/10 to-emerald-500/5',
  },
  measurements: {
    icon: Ruler,
    color: 'text-violet-400',
    bg: 'from-violet-500/10 to-purple-500/5',
  },
};

/**
 * Beautiful empty state component for when there's no data yet.
 * @param {string} type - One of: workout, nutrition, water, sleep, progress, measurements
 * @param {string} title - Main message
 * @param {string} subtitle - Secondary message
 * @param {string} ctaText - Button text (optional)
 * @param {function} onAction - Button callback (optional)
 */
export default function EmptyState({ type = 'workout', title, subtitle, ctaText, onAction }) {
  const preset = PRESETS[type] || PRESETS.workout;
  const Icon = preset.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`bg-gradient-to-br ${preset.bg} border border-slate-800/50 rounded-2xl p-8 text-center`}
    >
      {/* Animated icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mb-4 inline-flex"
      >
        <div className={`w-16 h-16 rounded-2xl bg-slate-900/60 border border-slate-700/30 flex items-center justify-center`}>
          <Icon size={28} className={preset.color} />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-base font-bold font-outfit text-white mb-1.5"
      >
        {title}
      </motion.h3>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xs text-slate-400 leading-relaxed max-w-[280px] mx-auto"
      >
        {subtitle}
      </motion.p>

      {/* CTA Button */}
      {ctaText && onAction && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold cursor-pointer shadow-lg shadow-orange-500/20"
        >
          {ctaText}
        </motion.button>
      )}
    </motion.div>
  );
}
