import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Clock } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

const STORAGE_KEY = 'shredmatrix_reminder';
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 07:00–22:00

function loadReminder() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { enabled: false, hour: 18, lastNotified: '' };
  } catch {
    return { enabled: false, hour: 18, lastNotified: '' };
  }
}

function saveReminder(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export default function WorkoutReminder() {
  const { t } = useTranslation();
  const [config, setConfig] = useState(loadReminder);
  const [permStatus, setPermStatus] = useState('default');
  const intervalRef = useRef(null);

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setPermStatus(Notification.permission);
    }
  }, []);

  // Tick every 30 seconds when enabled
  useEffect(() => {
    if (!config.enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const check = () => {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      if (now.getHours() === config.hour && config.lastNotified !== todayStr) {
        // Send notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(t('reminder.notifTitle'), {
            body: t('reminder.notifBody'),
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: 'workout-reminder',
          });
        }
        const updated = { ...config, lastNotified: todayStr };
        setConfig(updated);
        saveReminder(updated);
      }
    };

    check();
    intervalRef.current = setInterval(check, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [config.enabled, config.hour, config.lastNotified, t]);

  const toggleReminder = async () => {
    if (!config.enabled) {
      // Enable — request permission first
      if ('Notification' in window && Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        setPermStatus(perm);
        if (perm !== 'granted') return;
      }
      if ('Notification' in window && Notification.permission === 'denied') {
        setPermStatus('denied');
        return;
      }
      const updated = { ...config, enabled: true };
      setConfig(updated);
      saveReminder(updated);
    } else {
      const updated = { ...config, enabled: false };
      setConfig(updated);
      saveReminder(updated);
    }
  };

  const setHour = (h) => {
    const updated = { ...config, hour: h };
    setConfig(updated);
    saveReminder(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-orange-400" />
          <h3 className="text-sm font-bold font-outfit text-white">{t('reminder.title')}</h3>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
          {config.enabled ? t('reminder.enabled') : t('reminder.disabled')}
        </span>
      </div>

      {/* Permission denied warning */}
      {permStatus === 'denied' && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 mb-3">
          <BellOff size={12} className="text-red-400" />
          <p className="text-[10px] text-red-400">{t('reminder.permissionNeeded')}</p>
        </div>
      )}

      {/* Time selector */}
      <div className="mb-4">
        <label className="text-[10px] text-slate-500 block mb-2">
          <Clock size={10} className="inline mr-1" />
          {t('reminder.setTime')}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {HOURS.map((h) => (
            <button
              key={h}
              onClick={() => setHour(h)}
              className={[
                'px-2 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer',
                config.hour === h
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-white',
              ].join(' ')}
            >
              {String(h).padStart(2, '0')}:00
            </button>
          ))}
        </div>
      </div>

      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={toggleReminder}
        disabled={permStatus === 'denied'}
        className={[
          'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer',
          permStatus === 'denied'
            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
            : config.enabled
              ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
              : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20',
        ].join(' ')}
      >
        {config.enabled ? <BellOff size={14} /> : <Bell size={14} />}
        {config.enabled ? t('reminder.disable') : t('reminder.enable')}
      </motion.button>
    </motion.div>
  );
}
