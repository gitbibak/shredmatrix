import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Share, X } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

const DISMISS_KEY = 'fullbalance_install_dismissed';
const INSTALLED_KEY = 'fullbalance_install_confirmed';
const DISMISS_DURATION_MS = 14 * 24 * 60 * 60 * 1000;

function getStoredValue(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStoredValue(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Installation can still continue when storage is unavailable.
  }
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isMobileDevice() {
  return isIOS() || /Android/i.test(navigator.userAgent) || window.matchMedia('(pointer: coarse)').matches;
}

export default function InstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  useEffect(() => {
    if (!isMobileDevice() || isStandalone() || getStoredValue(INSTALLED_KEY)) return undefined;

    const dismissedAt = Number(getStoredValue(DISMISS_KEY));
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_DURATION_MS) return undefined;

    let showTimer;
    const reveal = () => {
      window.clearTimeout(showTimer);
      showTimer = window.setTimeout(() => setVisible(true), 2500);
    };

    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      reveal();
    };

    const handleInstalled = () => {
      setStoredValue(INSTALLED_KEY, 'true');
      setDeferredPrompt(null);
      setVisible(false);
    };

    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayMode = (event) => {
      if (event.matches) handleInstalled();
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    standaloneQuery.addEventListener?.('change', handleDisplayMode);

    if (isIOS()) reveal();

    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      standaloneQuery.removeEventListener?.('change', handleDisplayMode);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS()) {
      setShowIOSSteps(true);
      return;
    }

    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setStoredValue(INSTALLED_KEY, 'true');
      setVisible(false);
    } else {
      setStoredValue(DISMISS_KEY, String(Date.now()));
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setStoredValue(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  const handleIOSInstalled = () => {
    setStoredValue(INSTALLED_KEY, 'true');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-end justify-center bg-slate-950/75 p-3 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white shadow-2xl shadow-black/60"
          >
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
              aria-label={t('install.close')}
            >
              <X size={17} />
            </button>

            <div className="flex items-start gap-3 pr-8">
              <img
                src="/icon-192.png?v=5"
                alt=""
                className="h-14 w-14 shrink-0 rounded-xl border border-slate-700 object-cover shadow-lg"
              />
              <div className="min-w-0 pt-0.5">
                <p className="text-[10px] font-bold uppercase text-orange-400">Full Balance</p>
                <h2 id="install-title" className="mt-0.5 text-lg font-extrabold font-outfit leading-tight">
                  {showIOSSteps ? t('install.iosTitle') : t('install.title')}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {showIOSSteps ? t('install.iosDesc') : t('install.desc')}
                </p>
              </div>
            </div>

            {showIOSSteps ? (
              <>
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
                    <Share size={18} />
                  </span>
                  <p className="text-xs font-semibold leading-relaxed text-slate-200">{t('install.iosAction')}</p>
                </div>
                <button
                  type="button"
                  onClick={handleIOSInstalled}
                  className="mt-4 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-extrabold text-white transition-colors hover:bg-orange-400"
                >
                  {t('install.done')}
                </button>
              </>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-xs font-bold text-slate-300 transition-colors hover:text-white"
                >
                  {t('install.dismiss')}
                </button>
                <button
                  type="button"
                  onClick={handleInstall}
                  className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-950/30 transition-colors hover:bg-orange-400"
                >
                  <Download size={15} />
                  {t('install.btn')}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
