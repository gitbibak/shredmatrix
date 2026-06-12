import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, RefreshCw } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';



function getDayIndex() {
  const start = new Date(2024, 0, 1);
  const now = new Date();
  return Math.floor((now - start) / 86400000);
}

export default function DailyMotivation() {
  const { t } = useTranslation();
  const quotes = t('motivation.quotes') || [];
  const tips = t('motivation.tips') || [];
  const dayIdx = getDayIndex();
  const [refreshCount, setRefreshCount] = useState(0);

  const quote = useMemo(() => quotes.length ? quotes[(dayIdx + refreshCount) % quotes.length] : {}, [dayIdx, refreshCount, quotes]);
  const tip = useMemo(() => tips.length ? tips[(dayIdx + refreshCount) % tips.length] : '', [dayIdx, refreshCount, tips]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      {/* Quote */}
      <div className="flex items-start justify-between mb-3">
        <Flame size={16} className="text-orange-400 mt-0.5 shrink-0" />
        <motion.button
          whileHover={{ rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setRefreshCount((c) => c + 1)}
          className="text-slate-600 hover:text-orange-400 transition-colors cursor-pointer"
        >
          <RefreshCw size={13} />
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={refreshCount}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm font-semibold text-white font-outfit leading-relaxed mb-1.5">
            "{quote.text}"
          </p>
          <p className="text-[10px] text-slate-500 mb-3">— {quote.author}</p>

          {/* Tip */}
          <div className="px-3 py-2 rounded-lg bg-slate-950/50 border border-slate-800/50">
            <p className="text-[10px] text-slate-400 leading-relaxed">{tip}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
