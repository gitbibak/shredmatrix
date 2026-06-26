import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, Star, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { getDifficultyLabel } from '../data/exerciseDatabase';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 26 },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 30,
    transition: { duration: 0.2 },
  },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
};

// Pulse keyframes for the emoji animation
const pulseAnimation = {
  scale: [1, 1.15, 1],
  rotate: [0, -6, 6, 0],
  transition: {
    duration: 1.8,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export default function ExerciseDemo({ exercise, onClose }) {
  const { t } = useTranslation();
  const modalRef = useRef(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 200], [1, 0.3]);

  // Body scroll lock
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!exercise) return null;

  const { name, muscles = [], tip, difficulty, emoji, formSteps = [] } = exercise;
  const diff = getDifficultyLabel(difficulty);

  const handleDragEnd = (_, info) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="exercise-demo-backdrop"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-2 sm:px-4 pb-2 sm:pb-0"
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.3}
          onDragEnd={handleDragEnd}
          style={{ y, opacity }}
          className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl sm:rounded-2xl border border-slate-700/60 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-2xl custom-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle (mobile) */}
          <div className="sticky top-0 z-10 flex justify-center pt-3 pb-1 bg-gradient-to-b from-slate-900 to-transparent sm:hidden">
            <div className="w-10 h-1 rounded-full bg-slate-600" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
            aria-label={t('exerciseDemo.close')}
          >
            <X size={16} />
          </button>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="px-5 pb-6 pt-2 sm:pt-5"
          >
            {/* ── Emoji Animation ── */}
            <motion.div variants={fadeUp} className="flex justify-center mb-4">
              <motion.div
                animate={pulseAnimation}
                className="flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500/15 to-amber-500/10 border border-orange-500/20"
              >
                <span className="text-5xl select-none">{emoji || '🏋️'}</span>
              </motion.div>
            </motion.div>

            {/* ── Exercise Name ── */}
            <motion.h2
              variants={fadeUp}
              className="text-center font-outfit font-bold text-xl text-slate-100 mb-1"
            >
              {name}
            </motion.h2>

            {/* ── Difficulty ── */}
            <motion.div variants={fadeUp} className="flex justify-center items-center gap-1.5 mb-4">
              <span className={`text-xs font-medium ${diff.color}`}>
                {t(`exerciseDemo.${difficulty === 1 ? 'easy' : difficulty === 2 ? 'medium' : 'hard'}`)}
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3].map((i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i <= difficulty ? 'text-orange-400 fill-orange-400' : 'text-slate-700'}
                  />
                ))}
              </div>
            </motion.div>

            {/* ── Target Muscles ── */}
            {muscles.length > 0 && (
              <motion.div variants={fadeUp} className="mb-5">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                  {t('exerciseDemo.muscles')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {muscles.map((m) => (
                    <span
                      key={m}
                      className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-medium border border-blue-500/15"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Form Steps ── */}
            {formSteps.length > 0 && (
              <motion.div variants={fadeUp} className="mb-5">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-3">
                  {t('exerciseDemo.steps')}
                </p>
                <div className="flex flex-col gap-2.5">
                  {formSteps.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className="flex items-start gap-3"
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/15 border border-orange-500/25 shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-orange-400">{i + 1}</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{step}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Pro Tip ── */}
            {tip && (
              <motion.div variants={fadeUp} className="mb-5">
                <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-gradient-to-r from-cyan-500/8 to-blue-500/5 border border-cyan-500/15">
                  <span className="text-base shrink-0">💡</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold mb-1">
                      {t('exerciseDemo.proTip')}
                    </p>
                    <p className="text-[13px] text-cyan-300/80 leading-relaxed">{tip}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Common Mistakes ── */}
            {exercise.mistakes && exercise.mistakes.length > 0 && (
              <motion.div variants={fadeUp} className="mb-5">
                <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-500/5 border border-red-500/15">
                  <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-red-400 font-semibold mb-1.5">
                      {t('exerciseDemo.mistakes')}
                    </p>
                    <ul className="flex flex-col gap-1">
                      {exercise.mistakes.map((m, i) => (
                        <li key={i} className="text-[12px] text-red-300/70 leading-relaxed">
                          • {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Close Button ── */}
            <motion.div variants={fadeUp} className="flex justify-center pt-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-8 py-2.5 rounded-xl bg-slate-800 border border-slate-700/50 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
              >
                {t('exerciseDemo.close')}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
