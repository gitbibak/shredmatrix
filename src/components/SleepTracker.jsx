import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { motion } from 'framer-motion';
import { Moon, Save } from 'lucide-react';
import { getSleep, saveSleep as saveSleepEntry } from '../lib/dataService';



function todayISO() { return new Date().toISOString().split('T')[0]; }

export default function SleepTracker() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [hours, setHours] = useState('');

  useEffect(() => {
    getSleep().then(setEntries).catch(() => { /* ignore */ });
  }, []);

  const todayEntry = entries.find(e => e.date === todayISO());

  const handleSave = async () => {
    const h = parseFloat(hours);
    if (!h || h <= 0 || h > 24) return;
    const today = todayISO();
    try {
      await saveSleepEntry(today, h);
      setEntries(prev => {
        const idx = prev.findIndex(e => e.date === today);
        const entry = { date: today, hours: h };
        if (idx >= 0) { const next = [...prev]; next[idx] = entry; return next; }
        return [...prev, entry].sort((a,b) => a.date.localeCompare(b.date));
      });
    } catch { /* ignore */ }
    setHours('');
  };

  // Last 7 days
  const last7 = entries.slice(-7);
  const avg7 = last7.length > 0
    ? (last7.reduce((s, e) => s + e.hours, 0) / last7.length).toFixed(1)
    : '–';

  const getQuality = (h) => {
    if (h >= 8) return { label: t('sleep.good'), color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (h >= 7) return { label: t('sleep.ok'), color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    return { label: t('sleep.bad'), color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
  };

  const displayHours = todayEntry?.hours || (avg7 !== '–' ? parseFloat(avg7) : null);
  const quality = displayHours ? getQuality(displayHours) : null;

  // Mini bar chart data
  const barMax = 12;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Moon size={16} className="text-indigo-400" />
          <h3 className="text-sm font-bold font-outfit text-white">{t('sleep.title')}</h3>
        </div>
        {quality && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${quality.bg} ${quality.color}`}>
            {quality.label}
          </span>
        )}
      </div>

      {/* Mini bar chart — last 7 days */}
      {last7.length > 0 && (
        <div className="flex items-end gap-1 h-16 mb-4">
          {last7.map((e, i) => {
            const pct = Math.min((e.hours / barMax) * 100, 100);
            const q = getQuality(e.hours);
            const dayLabel = new Date(e.date).toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <span className={`text-[8px] font-bold ${q.color}`}>{e.hours}h</span>
                <div className="w-full bg-slate-800 rounded-full overflow-hidden" style={{ height: '40px' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="w-full rounded-full mt-auto"
                    style={{
                      background: e.hours >= 8 ? '#22c55e' : e.hours >= 7 ? '#f59e0b' : '#ef4444',
                      position: 'relative', bottom: 0,
                      marginTop: 'auto',
                    }}
                  />
                </div>
                <span className="text-[8px] text-slate-600">{dayLabel}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-2.5 text-center">
          <p className="text-[9px] text-slate-500">{t('sleep.today')}</p>
          <p className="text-sm font-bold text-white font-outfit">
            {todayEntry ? `${todayEntry.hours} ${t('sleep.hours')}` : '–'}
          </p>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-2.5 text-center">
          <p className="text-[9px] text-slate-500">{t('sleep.avg7')}</p>
          <p className="text-sm font-bold text-indigo-400 font-outfit">
            {avg7 !== '–' ? `${avg7} ${t('sleep.hours')}` : '–'}
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="mb-3">
        <label className="text-[10px] text-slate-500 block mb-1.5">{t('sleep.inputLabel')}</label>
        <div className="flex gap-2">
          <input
            type="number" min="0" max="24" step="0.5" placeholder="7.5"
            value={hours} onChange={e => setHours(e.target.value)}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-indigo-500/50 transition-colors"
          />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-semibold cursor-pointer shadow-lg shadow-indigo-500/20">
            <Save size={14} />
          </motion.button>
        </div>
      </div>

      {/* Tip */}
      <p className="text-[10px] text-slate-500 leading-relaxed">
        💡 {t('sleep.tip')}
      </p>
    </motion.div>
  );
}
