import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Check, Share2, Flame, Trophy } from 'lucide-react';
import { trackChallengeComplete } from '../lib/analytics';
import confetti from 'canvas-confetti';

const CHALLENGES = [
  { id: 'water_8', emoji: '💧', target: 8, unit: 'bardak su iç' },
  { id: 'workout_1', emoji: '🏋️', target: 1, unit: 'antrenman tamamla' },
  { id: 'sleep_7', emoji: '😴', target: 7, unit: 'saat uyu' },
  { id: 'water_10', emoji: '💧', target: 10, unit: 'bardak su iç' },
  { id: 'plank_3', emoji: '💪', target: 3, unit: 'dk plank yap' },
  { id: 'stretch_10', emoji: '🧘', target: 10, unit: 'dk stretching yap' },
  { id: 'no_sugar', emoji: '🍬', target: 1, unit: 'gün şekersiz geçir' },
  { id: 'protein_goal', emoji: '🥩', target: 1, unit: 'protein hedefine ulaş' },
  { id: 'early_sleep', emoji: '🌙', target: 1, unit: 'gece 23:00 öncesi yat' },
  { id: 'meditation_5', emoji: '🧘', target: 5, unit: 'dk meditasyon yap' },
  { id: 'water_12', emoji: '💧', target: 12, unit: 'bardak su iç' },
  { id: 'workout_intense', emoji: '🔥', target: 1, unit: 'yoğun antrenman yap' },
  { id: 'meal_log', emoji: '🥗', target: 3, unit: 'öğün kaydet' },
  { id: 'walk_30', emoji: '🚶', target: 30, unit: 'dk yürüyüş yap' },
];

const STORAGE_KEY = 'fb_daily_challenge';

function getDayIndex() {
  return Math.floor((Date.now() - new Date(2024, 0, 1).getTime()) / 86400000);
}

export default function DailyChallenge() {
  const [completed, setCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [justCompleted, setJustCompleted] = useState(false);

  const challenge = useMemo(() => CHALLENGES[getDayIndex() % CHALLENGES.length], []);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const today = new Date().toISOString().split('T')[0];
      setCompleted(!!data[today]);
      let s = 0;
      const d = new Date();
      while (true) {
        const key = d.toISOString().split('T')[0];
        if (data[key]) { s++; d.setDate(d.getDate() - 1); } else break;
      }
      setStreak(s);
    } catch {}
  }, []);

  const handleComplete = () => {
    if (completed) return;
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const today = new Date().toISOString().split('T')[0];
      data[today] = { challenge: challenge.id, completedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setCompleted(true);
      setJustCompleted(true);
      setStreak(s => s + 1);
      trackChallengeComplete(challenge.id);

      // 🎉 Confetti celebration
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.8 },
        colors: ['#ff6d00', '#22c55e', '#3b82f6', '#f59e0b'],
      });

      // Reset "just completed" animation after 3s
      setTimeout(() => setJustCompleted(false), 3000);
    } catch {}
  };

  const handleShare = async () => {
    const text = `${challenge.emoji} Günlük Challenge tamamlandı: ${challenge.target} ${challenge.unit}! 🔥 ${streak} gün üst üste! #FullBalance`;
    if (navigator.share) {
      await navigator.share({ title: 'Full Balance Challenge', text, url: 'https://fullbalance.app' }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text).catch(() => {});
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-cyan-400" />
          <span className="text-[10px] font-bold font-outfit text-white uppercase tracking-wider">
            Günlük Challenge
          </span>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/20">
            <Flame size={10} className="text-orange-400" />
            <span className="text-[9px] font-bold text-orange-400">{streak} gün</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-2xl">{challenge.emoji}</span>
        <div className="flex-1">
          <p className="text-sm font-bold text-white font-outfit">
            {challenge.target} {challenge.unit}
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5">Bugünün meydan okuması</p>
        </div>

        <AnimatePresence mode="wait">
          {completed ? (
            <motion.div
              key="done"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2"
            >
              {/* Success feedback */}
              {justCompleted && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[9px] font-bold text-emerald-400"
                >
                  Tamamlandı! 🎉
                </motion.span>
              )}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 cursor-pointer"
              >
                <Share2 size={14} />
              </motion.button>
              <motion.div
                className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"
                animate={justCompleted ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Check size={16} className="text-emerald-400" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.button
              key="do"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleComplete}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold cursor-pointer shadow-lg shadow-orange-500/20"
            >
              Tamamla ✓
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
