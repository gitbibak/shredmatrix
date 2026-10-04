import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

// In-app player for the exercise technique videos (portrait 9:16, no audio).
export default function ExerciseVideoModal({ video, title, onClose }) {
  const { t } = useTranslation();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!video) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [video, onClose]);

  return (
    <AnimatePresence>
      {video && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title ? `${t('video.watch')}: ${title}` : t('video.watch')}
        >
          <motion.div
            className="relative w-full max-w-[min(420px,calc(85vh*9/16))]"
            initial={{ scale: 0.94, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="absolute -top-3 -right-3 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 border border-slate-600 text-slate-100 hover:bg-slate-700 cursor-pointer"
              aria-label={t('video.close')}
            >
              <X size={18} />
            </button>
            <video
              key={video.src}
              className="block w-full aspect-[9/16] rounded-2xl bg-slate-900 shadow-2xl"
              src={video.src}
              poster={video.poster}
              controls
              autoPlay
              muted
              playsInline
              preload="metadata"
              controlsList="nodownload noplaybackrate"
              disablePictureInPicture
            >
              {t('video.unsupported')}
            </video>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
