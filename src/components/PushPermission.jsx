import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Dumbbell, Droplets, Moon, Trophy, AlertCircle } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  isPushSupported,
  getPermissionStatus,
  wasRecentlyDismissed,
  dismissPushPrompt,
  subscribeToPush,
  getPushUnsupportedReason,
} from '../lib/pushService';

/**
 * Push notification permission request — bottom card style
 * Only shows if device actually supports push notifications
 */
export default function PushPermission() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't show if not supported
    if (!isPushSupported()) return;
    // Don't show if already granted or denied
    const perm = getPermissionStatus();
    if (perm === 'granted' || perm === 'denied') return;
    // Don't show if recently dismissed
    if (wasRecentlyDismissed()) return;

    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const getErrorMessage = (reason, detail) => {
    switch (reason) {
      case 'denied':
        return t('push.deniedError');
      case 'dismissed':
        return 'İzin dialogunu kapattın. Tekrar "İzin Ver" butonuna bas.';
      case 'ios-old':
        return 'Bildirimler iOS 16.4+ gerektirir. Telefonunu güncelle.';
      case 'ios-not-standalone':
        return 'Bildirimleri almak için uygulamayı ana ekrana eklemelisin.';
      case 'sw-not-ready':
        return 'Servis çalışanı hazır değil. Uygulamayı kapatıp tekrar aç.';
      case 'vapid-missing':
        return 'Sistem yapılandırma hatası. Lütfen daha sonra tekrar dene.';
      case 'subscribe-failed':
        return `Abonelik oluşturulamadı${detail ? ': ' + detail : ''}. Tekrar dene.`;
      default:
        return t('push.error');
    }
  };

  const handleAllow = async () => {
    setSubscribing(true);
    setError(null);

    const result = await subscribeToPush();
    setSubscribing(false);

    if (result.success) {
      setDone(true);
      setTimeout(() => setVisible(false), 3000);
    } else {
      setError(getErrorMessage(result.reason, result.detail));
    }
  };

  const handleDismiss = () => {
    dismissPushPrompt();
    setVisible(false);
  };

  if (!visible) return null;

  const features = [
    { icon: Dumbbell, text: t('push.feature.workout'), color: 'text-orange-400' },
    { icon: Droplets, text: t('push.feature.water'), color: 'text-blue-400' },
    { icon: Moon, text: t('push.feature.sleep'), color: 'text-purple-400' },
    { icon: Trophy, text: t('push.feature.streak'), color: 'text-amber-400' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -60, scale: 0.97 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        className="relative z-[60] mb-4"
      >
        <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-4 shadow-2xl shadow-black/30 overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            aria-label="Kapat"
            className="absolute top-3 right-3 p-1.5 rounded-full text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all cursor-pointer"
          >
            <X size={14} />
          </button>

          {done ? (
            /* ── Success State ── */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-3 py-1"
            >
              <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
                <Check size={18} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white font-outfit">{t('push.enabled')}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{t('push.enabledDesc')}</p>
              </div>
            </motion.div>
          ) : (
            /* ── Request State ── */
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center justify-center">
                  <Bell size={18} className="text-orange-400" />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-sm font-bold text-white font-outfit">{t('push.title')}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{t('push.desc')}</p>
                </div>
              </div>

              {/* Features grid */}
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-950/40">
                    <f.icon size={11} className={f.color} />
                    <span className="text-[10px] text-slate-300">{f.text}</span>
                  </div>
                ))}
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-start gap-2 mb-3 px-2.5 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-red-300 leading-relaxed">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAllow}
                  disabled={subscribing}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-colors disabled:opacity-50 shadow-lg shadow-orange-500/20"
                >
                  <Bell size={12} />
                  {subscribing ? '...' : (error ? 'Tekrar Dene' : t('push.allow'))}
                </motion.button>

                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 rounded-xl text-slate-400 text-xs font-medium hover:text-slate-300 hover:bg-slate-800/50 transition-all cursor-pointer"
                >
                  {t('push.later')}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
