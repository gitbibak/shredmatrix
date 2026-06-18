import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

const PRESETS = [
  { label: '30s', seconds: 30 },
  { label: '45s', seconds: 45 },
  { label: '60s', seconds: 60 },
  { label: '90s', seconds: 90 },
  { labelKey: 'timer.twoMinutes', seconds: 120 },
];

function createBeep(ctx, frequency, duration) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = frequency;
  osc.type = 'square';
  gain.gain.value = 0.3;
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

async function playBeep() {
  let ctx;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    createBeep(ctx, 880, 0.15);
    // Double beep
    setTimeout(() => {
      createBeep(ctx, 1100, 0.2);
    }, 200);
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 500);
  } catch {
    if (ctx) ctx.close().catch(() => {});
    // Audio not supported
  }
}

export default function WorkoutTimer() {
  const { t } = useTranslation();
  const [totalSeconds, setTotalSeconds] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [status, setStatus] = useState('idle'); // idle | running | paused | finished
  const intervalRef = useRef(null);

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - progress);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const startTimer = () => {
    if (remaining <= 0) return;
    setStatus('running');
    clearTimer();
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setStatus('finished');
          playBeep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    clearTimer();
    setStatus('paused');
  };

  const resetTimer = () => {
    clearTimer();
    setRemaining(totalSeconds);
    setStatus('idle');
  };

  const selectPreset = (sec) => {
    clearTimer();
    setTotalSeconds(sec);
    setRemaining(sec);
    setStatus('idle');
  };

  const isNearEnd = remaining <= 3 && status === 'running';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Timer size={18} className="text-orange-400" />
        <h3 className="text-sm font-bold font-outfit text-white">{t('timer.title')}</h3>
      </div>

      {/* Presets */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {PRESETS.map((p) => {
          const active = totalSeconds === p.seconds && status === 'idle';
          return (
            <button
              key={p.seconds}
              onClick={() => selectPreset(p.seconds)}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                active
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600',
              ].join(' ')}
            >
              {p.labelKey ? t(p.labelKey) : p.label}
            </button>
          );
        })}
      </div>

      {/* Timer circle */}
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          <svg width="128" height="128" viewBox="0 0 120 120" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke="#1e293b"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <motion.circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke={status === 'finished' ? '#22c55e' : isNearEnd ? '#ef4444' : 'url(#timerGradient)'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6d00" />
                <stop offset="100%" stopColor="#00b0ff" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {status === 'finished' ? (
                <motion.p
                  key="done"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-xs font-bold text-emerald-400 font-outfit text-center leading-tight"
                >
                  {t('timer.finished').split(' ').map((w,i) => <span key={i}>{w}<br/></span>)}
                </motion.p>
              ) : (
                <motion.p
                  key="time"
                  animate={isNearEnd ? { scale: [1, 1.1, 1] } : {}}
                  transition={isNearEnd ? { duration: 0.5, repeat: Infinity } : {}}
                  className={`text-2xl font-bold font-outfit tabular-nums ${isNearEnd ? 'text-red-400' : 'text-white'}`}
                >
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Running glow */}
          {status === 'running' && (
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ boxShadow: ['0 0 0px rgba(255,109,0,0)', '0 0 20px rgba(255,109,0,0.3)', '0 0 0px rgba(255,109,0,0)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {status === 'running' ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={pauseTimer}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-sm font-semibold cursor-pointer"
            >
              <Pause size={16} />
              {t('timer.pause')}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startTimer}
              disabled={status === 'finished'}
              className={[
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer',
                status === 'finished'
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20',
              ].join(' ')}
            >
              <Play size={16} />
              {status === 'paused' ? t('timer.resume') : t('timer.start')}
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetTimer}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 text-sm font-medium hover:text-white cursor-pointer"
          >
            <RotateCcw size={14} />
            {t('timer.reset')}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
