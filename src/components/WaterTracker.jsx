import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Plus, Minus, RotateCcw } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { saveWater, getWater } from '../lib/dataService';


const TARGET_GLASSES = 8;
const ML_PER_GLASS = 250;
const TARGET_ML = TARGET_GLASSES * ML_PER_GLASS;

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}



// getMessage is now inside the component to use t()

// SVG circle constants
const RADIUS = 70;
const STROKE_WIDTH = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const VIEW_SIZE = (RADIUS + STROKE_WIDTH) * 2;
const CENTER = VIEW_SIZE / 2;

export default function WaterTracker({ compact = false }) {
  const { t } = useTranslation();
  const [glasses, setGlasses] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const getMessage = (pct) => {
    if (pct >= 100) return t('water.messages.done');
    if (pct >= 75) return t('water.messages.almost');
    if (pct >= 50) return t('water.messages.half');
    if (pct >= 25) return t('water.messages.good');
    return t('water.messages.start');
  };

  // Load today's water on mount
  useEffect(() => {
    getWater(getTodayStr()).then(d => {
      setGlasses(d.glasses || 0);
      setLoaded(true);
    }).catch((err) => { console.warn('[WaterTracker]', err); setLoaded(true); });
  }, []);

  // Persist on every change
  useEffect(() => {
    if (!loaded) return; // skip until initial data is loaded
    saveWater(getTodayStr(), glasses, glasses >= TARGET_GLASSES).catch((err) => { console.warn('[WaterTracker]', err); });
  }, [glasses, loaded]);

  // Auto-reset check when tab regains focus
  useEffect(() => {
    const check = () => {
      getWater(getTodayStr()).then(d => setGlasses(d.glasses || 0)).catch((err) => { console.warn('[WaterTracker]', err); });
    };
    window.addEventListener('focus', check);
    return () => window.removeEventListener('focus', check);
  }, []);

  const add = useCallback(() => {
    setGlasses((g) => g + 1);
  }, []);

  const remove = useCallback(() => {
    setGlasses((g) => Math.max(g - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setGlasses(0);
  }, []);

  const percentage = Math.round((glasses / TARGET_GLASSES) * 100);
  const mlConsumed = glasses * ML_PER_GLASS;
  const dashOffset = CIRCUMFERENCE - (CIRCUMFERENCE * Math.min(percentage, 100)) / 100;
  const message = getMessage(percentage);

  if (compact) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[132px] flex-col rounded-2xl border border-blue-500/20 bg-slate-900 p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
              <Droplets size={18} className="text-[#00b0ff]" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white font-outfit">{t('water.title')}</h3>
              <p className="text-[10px] text-slate-500">{mlConsumed} ml</p>
            </div>
          </div>
          <p className="text-lg font-extrabold text-white font-outfit">
            {glasses}<span className="text-xs font-medium text-slate-500">/{TARGET_GLASSES}</span>
          </p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
          <motion.div
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            className="h-full rounded-full bg-[#00b0ff]"
          />
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <button
            type="button"
            onClick={remove}
            disabled={glasses <= 0}
            aria-label="-1"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 disabled:opacity-30"
          >
            <Minus size={15} />
          </button>
          <span className="truncate text-[10px] text-slate-500">{message}</span>
          <button
            type="button"
            onClick={add}
            aria-label="+1"
            className="flex h-9 w-12 shrink-0 items-center justify-center gap-1 rounded-xl bg-blue-500 text-sm font-bold text-white"
          >
            <Plus size={15} />1
          </button>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
    >
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-blue-500/10">
          <Droplets size={16} className="text-[#00b0ff]" />
        </div>
        <h3 className="text-sm font-outfit font-bold text-white tracking-tight">
          {t('water.title')}
        </h3>
      </div>

      {/* ── Circular Progress ──────────────────────── */}
      <div className="flex justify-center mb-4">
        <div className="relative" style={{ width: VIEW_SIZE, height: VIEW_SIZE }}>
          <svg
            width={VIEW_SIZE}
            height={VIEW_SIZE}
            viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
            className="transform -rotate-90"
          >
            {/* Background track */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="#1e293b"
              strokeWidth={STROKE_WIDTH}
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff6d00" />
                <stop offset="100%" stopColor="#00b0ff" />
              </linearGradient>
            </defs>

            {/* Animated progress arc */}
            <motion.circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="url(#waterGradient)"
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
            <motion.span
              key={glasses}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="text-3xl font-outfit font-bold text-white leading-none"
            >
              {glasses}
            </motion.span>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5">
              / {TARGET_GLASSES} {t('water.glasses')}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-950/60 rounded-xl px-3 py-2 text-center">
          <p className="text-[11px] text-slate-500 mb-0.5">{t('water.consumed')}</p>
          <p className="text-sm font-bold text-white font-outfit">
            {mlConsumed} <span className="text-[10px] text-slate-500 font-normal">ml</span>
          </p>
        </div>
        <div className="bg-slate-950/60 rounded-xl px-3 py-2 text-center">
          <p className="text-[11px] text-slate-500 mb-0.5">{t('water.completed')}</p>
          <p className="text-sm font-bold font-outfit">
            <span className="gradient-text">%{percentage}</span>
          </p>
        </div>
      </div>

      {/* ── Motivational message ───────────────────── */}
      <AnimatePresence mode="wait">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="text-center text-xs text-slate-400 mb-4"
        >
          {message}
        </motion.p>
      </AnimatePresence>

      {/* ── Controls ───────────────────────────────── */}
      <div className="flex items-center justify-center gap-2">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={remove}
          disabled={glasses <= 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-medium
                     hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <Minus size={12} />
          <span>1</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={add}
          className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ff6d00] to-[#00b0ff] text-white text-xs font-bold
                     shadow-lg shadow-orange-500/20 cursor-pointer transition-colors"
        >
          <Plus size={12} />
          <span>+1</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={reset}
          disabled={glasses === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-medium
                     hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <RotateCcw size={12} />
          <span>{t('water.reset')}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
