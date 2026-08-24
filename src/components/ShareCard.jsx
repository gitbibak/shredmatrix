import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, X, Check, Download, MessageCircle, ShieldCheck, Users } from "lucide-react";
import { useTranslation } from '../i18n/LanguageContext';
import { trackShare } from '../lib/analytics';
import { buildTrackedShareUrl } from '../lib/shareLinks';

/* ── Canvas helper: rounded rectangle ── */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function ShareCard({ plan, onClose }) {
  const { t, lang } = useTranslation();
  const [generating, setGenerating] = useState(false);

  /* ── Referral system state ── */
  const [refCode, setRefCode] = useState('');
  const [refCopied, setRefCopied] = useState(false);

  useEffect(() => {
    const REFERRAL_KEY = 'fb_referral_code';
    let c = localStorage.getItem(REFERRAL_KEY);
    if (!c) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      c = 'FB';
      for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
      localStorage.setItem(REFERRAL_KEY, c);
    }
    setRefCode(c);
  }, []);

  const refShareUrl = buildTrackedShareUrl({
    language: lang,
    source: 'member_referral',
    medium: 'referral',
    campaign: `invite_${lang}`,
    referralCode: refCode,
  });
  const refShareText = t('referral.message');

  const {
    userName = t('profile.user'),
    goal = t('common.fatGoal'),
    dailyCalories = 0,
    macros = {},
    bmi = 0,
    userWeight = 0,
  } = plan || {};

  const protein = macros?.protein ?? 0;
  const carbs = macros?.carbs ?? 0;
  const fat = macros?.fat ?? 0;

  const macroStats = [
    { label: t('nutrition.protein'), value: `${Math.round(protein)}`, unit: "g" },
    { label: t('nutrition.carbs'), value: `${Math.round(carbs)}`, unit: "g" },
    { label: t('nutrition.fat'), value: `${Math.round(fat)}`, unit: "g" },
  ];

  const getBmiColor = (val) => {
    const v = Number(val);
    if (v < 18.5) return "text-blue-400";
    if (v < 25) return "text-emerald-400";
    if (v < 30) return "text-yellow-400";
    return "text-red-400";
  };

  /* ── Canvas image generation ── */
  const generateShareImage = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1080);
    grad.addColorStop(0, '#020617');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Subtle radial glow behind brand
    const radial = ctx.createRadialGradient(540, 120, 0, 540, 120, 300);
    radial.addColorStop(0, 'rgba(255, 109, 0, 0.08)');
    radial.addColorStop(1, 'rgba(255, 109, 0, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 1080, 400);

    // Orange-to-blue accent line
    const accentGrad = ctx.createLinearGradient(200, 0, 880, 0);
    accentGrad.addColorStop(0, '#ff6d00');
    accentGrad.addColorStop(1, '#00b0ff');
    ctx.fillStyle = accentGrad;
    ctx.fillRect(200, 160, 680, 3);

    // Brand
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FULL BALANCE', 540, 130);

    // User name
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(userName, 540, 220);

    // Goal badge
    ctx.font = '26px sans-serif';
    ctx.fillStyle = '#ff6d00';
    ctx.fillText(`🎯 ${goal}`, 540, 265);

    // Section title
    ctx.font = '32px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(t('share.dailyGoals'), 540, 340);

    // Stat box drawing helper
    const drawStatBox = (x, y, label, value, color) => {
      // Box background
      ctx.fillStyle = '#1e293b';
      roundRect(ctx, x, y, 280, 120, 20);
      ctx.fill();

      // Border
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, 280, 120, 20);
      ctx.stroke();

      // Value
      ctx.fillStyle = color;
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(value, x + 140, y + 58);

      // Label
      ctx.fillStyle = '#64748b';
      ctx.font = '22px sans-serif';
      ctx.fillText(label, x + 140, y + 98);
    };

    // Draw stat boxes — 3 columns × 2 rows
    drawStatBox(80, 380, t('share.calories'), Math.round(dailyCalories) + ' kcal', '#ff6d00');
    drawStatBox(400, 380, t('nutrition.protein'), Math.round(protein) + 'g', '#00b0ff');
    drawStatBox(720, 380, t('nutrition.carbs'), Math.round(carbs) + 'g', '#22c55e');
    drawStatBox(80, 540, t('nutrition.fat'), Math.round(fat) + 'g', '#f59e0b');
    drawStatBox(400, 540, t('share.weight'), Number(userWeight).toFixed(1) + ' kg', '#8b5cf6');
    drawStatBox(720, 540, 'BMI', Number(bmi).toFixed(1), '#ec4899');

    // Divider line
    const divGrad = ctx.createLinearGradient(200, 0, 880, 0);
    divGrad.addColorStop(0, 'rgba(51, 65, 85, 0)');
    divGrad.addColorStop(0.5, 'rgba(51, 65, 85, 1)');
    divGrad.addColorStop(1, 'rgba(51, 65, 85, 0)');
    ctx.fillStyle = divGrad;
    ctx.fillRect(200, 710, 680, 1);

    // Tagline
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`"${t('share.tagline')}"`, 540, 770);

    // Bottom accent line
    const bottomAccent = ctx.createLinearGradient(300, 0, 780, 0);
    bottomAccent.addColorStop(0, '#ff6d00');
    bottomAccent.addColorStop(1, '#00b0ff');
    ctx.fillStyle = bottomAccent;
    ctx.fillRect(300, 950, 480, 2);

    // Watermark
    ctx.fillStyle = '#334155';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t('share.watermark'), 540, 1010);

    // Small "free forever" text
    ctx.fillStyle = '#1e293b';
    ctx.font = '20px sans-serif';
    ctx.fillText('fullbalance.app', 540, 1050);

    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  };

  /* ── Download image ── */
  const handleDownloadImage = async () => {
    setGenerating(true);
    try {
      const blob = await generateShareImage();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fullbalance-stats.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('[ShareCard] Image download failed:', err?.message || err);
    } finally {
      setGenerating(false);
    }
  };

  /* ── Share via Web Share API ── */
  const handleShareImage = async () => {
    setGenerating(true);
    try {
      const blob = await generateShareImage();
      if (!blob) return;
      const file = new File([blob], 'fullbalance-stats.png', { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'Full Balance',
          text: `💪 ${t('share.tagline')}\n${refShareUrl}`,
          files: [file],
        });
        trackShare('progress_image_referral');
      } else {
        // Fallback: download instead
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fullbalance-stats.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.warn('[ShareCard] Share failed:', err?.message || err);
      }
    } finally {
      setGenerating(false);
    }
  };

  /* ── Lock body scroll ── */
  useEffect(() => {
    if (!plan) return undefined;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [plan]);

  if (!plan) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/90 p-3 backdrop-blur-md sm:p-4"
        style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        onTouchMove={(e) => e.preventDefault()}
      >
        <motion.div
          className="relative max-h-[92dvh] w-full max-w-sm overflow-y-auto px-0.5 pb-1 scrollbar-hide overscroll-contain"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <motion.button
            className="absolute right-3 top-3 z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-700 bg-slate-800/95 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            aria-label={t('profile.close')}
          >
            <X size={20} />
          </motion.button>

          {/* Card Preview */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
            <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-300 to-cyan-400" />
            <div className="relative p-5">
              <div className="absolute inset-0 bg-grid opacity-[0.035] pointer-events-none" />
              <div className="relative">
                <p className="text-[10px] font-bold uppercase text-slate-500">{t('share.summary')}</p>
                <h2 className="mt-1 font-outfit text-lg font-extrabold text-white">FULL <span className="text-cyan-400">BALANCE</span></h2>

                <div className="mt-5 flex items-end justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="min-w-0">
                    <p className="truncate font-outfit text-xl font-bold text-white">{userName}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-orange-400">{goal}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-bold uppercase text-slate-500">{t('share.dailyCalories')}</p>
                    <p className="font-outfit text-3xl font-black text-white">{Math.round(dailyCalories)} <span className="text-xs font-semibold text-slate-500">kcal</span></p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 divide-x divide-slate-800 rounded-xl border border-slate-800 bg-slate-950/55 py-3">
                  {macroStats.map((stat) => (
                    <div key={stat.label} className="min-w-0 px-2 text-center">
                      <p className="truncate text-[9px] font-bold uppercase text-slate-500">{stat.label}</p>
                      <p className="mt-1 font-outfit text-lg font-bold text-white">{stat.value}<span className="ml-0.5 text-[10px] font-medium text-slate-500">{stat.unit}</span></p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                  <div><span className="text-slate-500">BMI</span><strong className={`ml-2 font-outfit text-base ${getBmiColor(bmi)}`}>{Number(bmi).toFixed(1)}</strong></div>
                  <div><span className="text-slate-500">{t('share.weight')}</span><strong className="ml-2 font-outfit text-base text-white">{Number(userWeight).toFixed(1)} kg</strong></div>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-slate-800 pt-3 text-[10px] text-slate-500">
                  <ShieldCheck size={13} className="shrink-0 text-emerald-400" />
                  <span>{t('share.privacyNote')}</span>
                </div>
              </div>
            </div>
          </div>

          <section className="mt-3 rounded-2xl border border-slate-800 bg-slate-900/95 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Users size={18} className="shrink-0 text-orange-400" />
                <div className="min-w-0">
                  <h3 className="truncate font-outfit text-sm font-bold text-white">{t('referral.invite')}</h3>
                  <p className="text-[10px] text-slate-500">{t('referral.inviteHint')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(refShareUrl).catch(() => {});
                  setRefCopied(true);
                  trackShare('copy_link');
                  setTimeout(() => setRefCopied(false), 2000);
                }}
                className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 font-mono text-xs font-bold text-orange-400"
                aria-label={t('referral.copyLink')}
              >
                {refCode}
                {refCopied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} className="text-slate-400" />}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  trackShare('whatsapp');
                  window.open(`https://wa.me/?text=${encodeURIComponent(refShareText + '\n' + refShareUrl)}`, '_blank', 'noopener,noreferrer');
                }}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-400"
              >
                <MessageCircle size={16} /> WhatsApp
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (navigator.share) {
                    trackShare('native');
                    await navigator.share({ title: 'Full Balance', text: refShareText, url: refShareUrl }).catch(() => {});
                  } else {
                    await navigator.clipboard.writeText(refShareUrl).catch(() => {});
                    setRefCopied(true);
                    setTimeout(() => setRefCopied(false), 2000);
                  }
                }}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-xs font-bold text-blue-400"
              >
                <Share2 size={16} /> {t('referral.shareLink')}
              </button>
            </div>
          </section>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <motion.button
              className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs font-bold text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadImage}
              disabled={generating}
            >
              <Download size={16} />
              <span>{generating ? '...' : t('share.downloadImage')}</span>
            </motion.button>

            <motion.button
              className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
              whileTap={{ scale: 0.95 }}
              onClick={handleShareImage}
              disabled={generating}
            >
              <Share2 size={16} />
              <span>{generating ? '...' : t('share.shareImage')}</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
