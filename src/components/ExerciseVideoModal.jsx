import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

// In-app player for the exercise technique videos (portrait 9:16, no audio).
// Custom minimal controls instead of the native ones, which cover the video on phones:
// tap toggles play/pause, a thin scrubbable progress bar sits at the bottom, the video loops.
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
            <VideoPlayer key={video.src} video={video} t={t} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function VideoPlayer({ video, t }) {
  const videoRef = useRef(null);
  const barRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);

  // Smooth progress bar while playing (timeupdate fires only ~4x per second).
  useEffect(() => {
    let raf;
    const tick = () => {
      const el = videoRef.current;
      if (el && el.duration) setProgress(el.currentTime / el.duration);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) el.play()?.catch?.(() => {});
    else el.pause();
  };

  const seekTo = (clientX) => {
    const el = videoRef.current;
    const bar = barRef.current;
    if (!el || !bar || !el.duration) return;
    const rect = bar.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    el.currentTime = f * el.duration;
    setProgress(f);
  };

  const onBarPointerDown = (e) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setScrubbing(true);
    seekTo(e.clientX);
  };
  const onBarPointerMove = (e) => { if (scrubbing) seekTo(e.clientX); };
  const onBarPointerUp = (e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setScrubbing(false);
  };

  const onBarKeyDown = (e) => {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    if (e.key === 'ArrowRight') el.currentTime = Math.min(el.duration, el.currentTime + 5);
    else if (e.key === 'ArrowLeft') el.currentTime = Math.max(0, el.currentTime - 5);
    else return;
    e.preventDefault();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 shadow-2xl select-none">
      <video
        ref={videoRef}
        className="block w-full aspect-[9/16] cursor-pointer"
        src={video.src}
        poster={video.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        disableRemotePlayback
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onClick={togglePlay}
      >
        {t('video.unsupported')}
      </video>

      <AnimatePresence>
        {paused && (
          <motion.button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 m-auto flex items-center justify-center w-16 h-16 rounded-full bg-slate-950/60 text-white backdrop-blur-sm cursor-pointer"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15 }}
            aria-label={t('video.play')}
          >
            <Play size={28} className="ml-1" fill="currentColor" />
          </motion.button>
        )}
      </AnimatePresence>

      {!paused && (
        <button type="button" onClick={togglePlay} className="sr-only" aria-label={t('video.pause')}>
          <Pause size={16} />
        </button>
      )}

      {/* Tall invisible hit area, thin visible bar. */}
      <div
        ref={barRef}
        role="slider"
        tabIndex={0}
        aria-label={t('video.seek')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="absolute inset-x-0 bottom-0 h-6 flex items-end cursor-pointer touch-none"
        onPointerDown={onBarPointerDown}
        onPointerMove={onBarPointerMove}
        onPointerUp={onBarPointerUp}
        onPointerCancel={onBarPointerUp}
        onKeyDown={onBarKeyDown}
      >
        <div className={`w-full bg-white/20 transition-[height] ${scrubbing ? 'h-1.5' : 'h-1'}`}>
          <div className="h-full bg-orange-500" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
