import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X, Check } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  isPushSupported,
  getPermissionStatus,
  wasRecentlyDismissed,
  dismissPushPrompt,
  subscribeToPush,
} from '../lib/pushService';

/**
 * Push notification permission request — shows after 3rd session
 * Non-intrusive bottom sheet style
 */
export default function PushPermission() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Don't show if not supported, already granted/denied, or recently dismissed
    if (!isPushSupported()) return;
    if (getPermissionStatus() !== 'default') return;
    if (wasRecentlyDismissed()) return;

    // Only show after user has used the app at least 3 times
    const SESSION_KEY = 'fb_session_count';
    try {
      const count = parseInt(localStorage.getItem(SESSION_KEY) || '0') + 1;
      localStorage.setItem(SESSION_KEY, String(count));
      if (count < 3) return;
    } catch { return; }

    // Delay showing by 10 seconds (let user settle in first)
    const timer = setTimeout(() => setVisible(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleAllow = async () => {
    setSubscribing(true);
    const sub = await subscribeToPush();
    setSubscribing(false);
    if (sub) {
      setDone(true);
      setTimeout(() => setVisible(false), 1500);
    } else {
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    dismissPushPrompt();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 80, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-20 left-4 right-4 z-[80] max-w-sm mx-auto"
      >
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl shadow-black/40">
          {/* Close */}
          <button
            onClick={handleDismiss}
            aria-label="Kapat"
            className="absolute top-3 right-3 p-1 rounded-full text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>

          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center justify-center">
              {done ? (
                <Check size={18} className="text-green-400" />
              ) : (
                <Bell size={18} className="text-orange-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white font-outfit">
                {done ? t('push.enabled') : t('push.title')}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                {done ? t('push.enabledDesc') : t('push.desc')}
              </p>

              {!done && (
                <div className="flex items-center gap-2 mt-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAllow}
                    disabled={subscribing}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-colors disabled:opacity-50"
                  >
                    <Bell size={12} />
                    {subscribing ? '...' : t('push.allow')}
                  </motion.button>

                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 rounded-lg text-slate-400 text-xs font-medium hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {t('push.later')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
