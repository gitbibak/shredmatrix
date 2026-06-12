import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Zap } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

const DISMISS_KEY = 'shredmatrix_install_dismissed';

export default function InstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = new Date(dismissed).getTime();
      // Show again after 7 days
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Delay showing to not interrupt initial load
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-20 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-[60] bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl shadow-black/50"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white cursor-pointer transition-colors"
          >
            <X size={12} />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center shrink-0">
              <Zap size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold font-outfit text-white mb-0.5">{t('install.title')}</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">{t('install.desc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleInstall}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold cursor-pointer shadow-lg shadow-orange-500/20"
            >
              <Download size={13} />
              {t('install.btn')}
            </motion.button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-medium cursor-pointer hover:text-white transition-colors"
            >
              {t('install.dismiss')}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
