import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { getLatestResolvedSupportTicket } from '../lib/supportService';
import { sendLocalNotification } from '../lib/pushService';

const POLL_INTERVAL_MS = 60_000;

export default function SupportResolutionNotice({ user }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);

  const seenKey = user?.id ? `fullbalance_support_seen_${user.id}` : null;

  const checkResolvedTicket = useCallback(async () => {
    if (!user?.id || !seenKey) return;

    try {
      const latest = await getLatestResolvedSupportTicket();
      if (!latest) {
        setTicket(null);
        return;
      }

      const latestId = String(latest.id);
      if (location.pathname === '/contact') {
        localStorage.setItem(seenKey, latestId);
        setTicket(null);
        return;
      }

      if (localStorage.getItem(seenKey) === latestId) {
        setTicket(null);
        return;
      }

      setTicket(latest);
      if (document.visibilityState !== 'visible') {
        await sendLocalNotification(
          t('contact.resolvedNoticeTitle'),
          latest.admin_note || t('contact.resolvedNoticeBody'),
          `support-resolved-${latestId}`,
          `/contact?resolved=${encodeURIComponent(latestId)}`,
        );
      }
    } catch (error) {
      console.warn('[Support] Resolution check failed:', error?.message || error);
    }
  }, [location.pathname, seenKey, t, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setTicket(null);
      return undefined;
    }

    checkResolvedTicket();
    const interval = window.setInterval(checkResolvedTicket, POLL_INTERVAL_MS);
    const handleFocus = () => checkResolvedTicket();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkResolvedTicket, user?.id]);

  const markSeen = () => {
    if (ticket?.id && seenKey) localStorage.setItem(seenKey, String(ticket.id));
    setTicket(null);
  };

  const openTicket = () => {
    markSeen();
    navigate('/contact');
  };

  const isVisible = Boolean(ticket) && location.pathname !== '/contact' && location.pathname !== '/admin';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed left-4 right-4 bottom-24 z-[9998] mx-auto max-w-md rounded-2xl border border-emerald-400/30 bg-slate-900/95 p-4 text-white shadow-2xl shadow-black/40 backdrop-blur-xl sm:bottom-6"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
              <CheckCircle2 size={21} className="text-emerald-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold font-outfit text-emerald-200">
                {t('contact.resolvedNoticeTitle')}
              </p>
              <p className="mt-0.5 truncate text-xs font-semibold text-white">{ticket.subject}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
                {ticket.admin_note || t('contact.resolvedNoticeBody')}
              </p>
              <button
                type="button"
                onClick={openTicket}
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-300 transition-colors hover:text-emerald-200"
              >
                {t('contact.viewResponse')}
                <ChevronRight size={14} />
              </button>
            </div>
            <button
              type="button"
              onClick={markSeen}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
              aria-label={t('contact.dismissNotice')}
            >
              <X size={16} />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
