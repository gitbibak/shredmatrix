import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, X, Check, Camera, Download, Image, MessageCircle, Users, Gift } from "lucide-react";
import { useTranslation } from '../i18n/LanguageContext';
import { trackShare, trackReferral } from '../lib/analytics';

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
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [showScreenshotHint, setShowScreenshotHint] = useState(false);
  const [generating, setGenerating] = useState(false);

  /* ── Referral system state ── */
  const [refCode, setRefCode] = useState('');
  const [refCopied, setRefCopied] = useState(false);
  const [refCount, setRefCount] = useState(0);

  useEffect(() => {
    const REFERRAL_KEY = 'fb_referral_code';
    const REFERRAL_COUNT_KEY = 'fb_referral_count';
    let c = localStorage.getItem(REFERRAL_KEY);
    if (!c) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      c = 'FB';
      for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
      localStorage.setItem(REFERRAL_KEY, c);
    }
    setRefCode(c);
    setRefCount(parseInt(localStorage.getItem(REFERRAL_COUNT_KEY) || '0'));
  }, []);

  const refShareUrl = `https://fullbalance.app/?ref=${refCode}`;
  const refShareText = t('share.tagline');

  if (!plan) return null;

  const {
    userName = t('profile.user'),
    goal = t('common.fatGoal'),
    dailyCalories = 0,
    macros = {},
    bmi = 0,
    userWeight = 0,
  } = plan;

  const protein = macros?.protein ?? 0;
  const carbs = macros?.carbs ?? 0;
  const fat = macros?.fat ?? 0;

  const statsGrid = [
    { label: t('share.calories'), value: `${Math.round(dailyCalories)}`, unit: "kcal" },
    { label: t('nutrition.protein'), value: `${Math.round(protein)}`, unit: "g" },
    { label: t('nutrition.carbs'), value: `${Math.round(carbs)}`, unit: "g" },
    { label: t('nutrition.fat'), value: `${Math.round(fat)}`, unit: "g" },
  ];

  const handleCopy = async () => {
    const textSummary = [
      `⚖️ FULL BALANCE — ${userName}`,
      `🎯 ${t('share.goal')}: ${goal}`,
      `⚡ ${t('share.dailyCalories')}: ${Math.round(dailyCalories)} kcal`,
      `🥩 ${t('nutrition.protein')}: ${Math.round(protein)}g`,
      `🍞 ${t('share.carbs')}: ${Math.round(carbs)}g`,
      `🧈 ${t('nutrition.fat')}: ${Math.round(fat)}g`,
      `📊 BMI: ${Number(bmi).toFixed(1)}`,
      `⚖️ ${t('share.weight')}: ${Number(userWeight).toFixed(1)} kg`,
      ``,
      `💪 ${t('share.tagline')}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(textSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('[ShareCard]', err?.message || err);
    }
  };

  const handleSave = () => {
    setShowScreenshotHint(true);
    setTimeout(() => setShowScreenshotHint(false), 3000);
  };

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
          text: `💪 ${t('share.tagline')}`,
          files: [file],
        });
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

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-xs"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <motion.button
            className="absolute -top-3 -right-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
          >
            <X size={16} />
          </motion.button>

          {/* Card Preview */}
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-orange-500 via-orange-500/30 to-blue-500">
            <div className="rounded-2xl bg-slate-900 p-6 overflow-hidden relative">
              {/* Subtle background pattern */}
              <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative space-y-5">
                {/* Logo */}
                <div className="text-center">
                  <h2 className="font-outfit text-2xl font-bold gradient-text tracking-tight">
                    FULL BALANCE
                  </h2>
                  <div className="mt-1 h-[1px] w-16 mx-auto bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
                </div>

                {/* User + Goal */}
                <div className="text-center space-y-2">
                  <p className="font-outfit text-lg font-semibold text-white truncate">
                    {userName}
                  </p>
                  <span className="inline-block rounded-full bg-gradient-to-r from-orange-500/20 to-blue-500/20 border border-orange-500/30 px-3 py-1 text-xs font-medium text-orange-400">
                    🎯 {goal}
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {statsGrid.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl bg-slate-800/70 border border-slate-700/50 p-3 text-center"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                        {stat.label}
                      </p>
                      <p className="font-outfit text-xl font-bold text-white mt-0.5">
                        {stat.value}
                      </p>
                      <p className="text-[10px] text-slate-500">{stat.unit}</p>
                    </div>
                  ))}
                </div>

                {/* BMI + Weight */}
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                      BMI
                    </p>
                    <p
                      className={`font-outfit text-lg font-bold ${getBmiColor(bmi)}`}
                    >
                      {Number(bmi).toFixed(1)}
                    </p>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-700" />
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                      {t('share.weight')}
                    </p>
                    <p className="font-outfit text-lg font-bold text-white">
                      {Number(userWeight).toFixed(1)}{" "}
                      <span className="text-xs text-slate-500 font-normal">
                        kg
                      </span>
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

                {/* Tagline */}
                <p className="text-center font-outfit text-sm font-medium text-slate-400 italic">
                  "{t('share.tagline')}"
                </p>

                {/* ── Invite Friends (compact) ── */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Gift size={12} className="text-orange-400" />
                      <span className="text-[10px] font-bold font-outfit text-white">{t('referral.invite')}</span>
                    </div>
                    <span className="text-[9px] text-slate-500">{refCount}/3</span>
                  </div>
                  {/* Code + Copy */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-800/80 border border-slate-700/40 rounded-lg px-2.5 py-1.5 text-center">
                      <span className="text-[11px] font-mono font-bold text-orange-400 tracking-wider">{refCode}</span>
                    </div>
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(refShareUrl).catch(() => {});
                        setRefCopied(true);
                        trackShare('copy_link');
                        setTimeout(() => setRefCopied(false), 2000);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/30 text-slate-300 hover:text-white hover:border-orange-500/30 transition-colors text-[9px] font-medium cursor-pointer"
                    >
                      {refCopied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                      {refCopied ? '✓' : t('share.copy')}
                    </button>
                    <button
                      onClick={() => {
                        trackShare('whatsapp');
                        window.open(`https://wa.me/?text=${encodeURIComponent(refShareText + '\n' + refShareUrl)}`, '_blank');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500/15 border border-green-500/25 text-green-400 hover:bg-green-500/25 transition-colors text-[9px] font-medium cursor-pointer"
                    >
                      <MessageCircle size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col gap-3">
            {/* Row 1: Copy + Screenshot hint */}
            <div className="flex items-center justify-center gap-3">
              <motion.button
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-emerald-400" />
                    <span className="text-emerald-400">{t('share.copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>{t('share.copy')}</span>
                  </>
                )}
              </motion.button>

              <motion.button
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:from-orange-600 hover:to-orange-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
              >
                <Camera size={16} />
                <span>{t('share.save')}</span>
              </motion.button>
            </div>

            {/* Row 2: Download Image + Share */}
            <div className="flex items-center justify-center gap-3">
              <motion.button
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-slate-800 border border-emerald-500/40 px-5 py-2.5 text-sm font-medium text-emerald-400 hover:bg-slate-700 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadImage}
                disabled={generating}
              >
                <Download size={16} />
                <span>{generating ? '...' : t('share.downloadImage')}</span>
              </motion.button>

              <motion.button
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-700 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShareImage}
                disabled={generating}
              >
                <Share2 size={16} />
                <span>{generating ? '...' : t('share.shareImage')}</span>
              </motion.button>
            </div>
          </div>

          {/* Screenshot Hint */}
          <AnimatePresence>
            {showScreenshotHint && (
              <motion.p
                className="mt-3 text-center text-xs text-slate-500"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                {t('share.saveHint')}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
