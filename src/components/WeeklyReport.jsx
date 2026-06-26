import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Dumbbell, Droplets, Scale, TrendingUp,
  TrendingDown, Flame, Award, Minus, Share2, Download,
  ArrowUp, ArrowDown,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { getWorkoutLogs, getWaterHistory, getProgress } from '../lib/dataService';

const itemV = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatDate(d, locale = 'tr-TR') {
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

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

/* ── Comparison badge ── */
function ComparisonBadge({ current, previous, suffix = '' }) {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return null;
  const up = pct > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${up ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
      {up ? <ArrowUp size={8} /> : <ArrowDown size={8} />}
      {Math.abs(pct)}%{suffix}
    </span>
  );
}

/* ── Mini sparkline bars ── */
function SparklineBars({ data, max }) {
  const safeMax = max || Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[3px] h-6">
      {data.map((val, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(8, (val / safeMax) * 100)}%` }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="w-[6px] rounded-full"
          style={{
            backgroundColor: val > 0 ? '#ff6d00' : '#1e293b',
            minHeight: val > 0 ? '4px' : '2px',
          }}
        />
      ))}
    </div>
  );
}

function StatRow({ icon: Icon, label, value, sub, color = '#ff6d00', comparison }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800/50">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Icon size={15} style={{ color }} />
      </div>
      <div className="flex-1">
        <p className="text-[10px] text-slate-500">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-white font-outfit">{value}</p>
          {comparison}
        </div>
      </div>
      {sub && <span className="text-[10px] text-slate-500">{sub}</span>}
    </div>
  );
}

export default function WeeklyReport({ plan }) {
  const { t, lang } = useTranslation();
  const localeMap = { tr: 'tr-TR', en: 'en-US', es: 'es-ES' };

  const [workoutData, setWorkoutData] = useState([]);
  const [waterData, setWaterData] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [logs, water, progress] = await Promise.all([
          getWorkoutLogs(),
          getWaterHistory(),
          getProgress(),
        ]);
        if (cancelled) return;
        setWorkoutData(logs || []);
        setWaterData(water || []);
        setProgressData(progress || []);
      } catch (err) {
        console.error('Failed to load weekly report data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [plan]);

  const report = useMemo(() => {
    const now = new Date();
    const monday = getMondayOfWeek(now);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);

    // Previous week
    const prevMonday = new Date(monday);
    prevMonday.setDate(prevMonday.getDate() - 7);
    const prevSunday = new Date(monday);
    prevSunday.setDate(prevSunday.getDate() - 1);

    // ── This week stats ──
    let workoutCount = 0;
    let totalVolume = 0;
    const dailyWorkouts = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
    try {
      const weekLogs = workoutData.filter((l) => {
        const d = new Date(l.date);
        return d >= monday && d <= now;
      });
      workoutCount = weekLogs.length;
      weekLogs.forEach((log) => {
        const d = new Date(log.date);
        const dayIdx = (d.getDay() + 6) % 7; // Mon=0
        dailyWorkouts[dayIdx] = 1;
        (log.exercises || []).forEach((ex) => {
          (ex.sets || []).forEach((s) => {
            if (s.completed) totalVolume += (s.weight || 0) * (s.reps || 0);
          });
        });
      });
    } catch (err) { console.warn('[WeeklyReport]', err); }

    // ── Previous week stats ──
    let prevWorkoutCount = 0;
    let prevTotalVolume = 0;
    try {
      const prevLogs = workoutData.filter((l) => {
        const d = new Date(l.date);
        return d >= prevMonday && d <= prevSunday;
      });
      prevWorkoutCount = prevLogs.length;
      prevLogs.forEach((log) => {
        (log.exercises || []).forEach((ex) => {
          (ex.sets || []).forEach((s) => {
            if (s.completed) prevTotalVolume += (s.weight || 0) * (s.reps || 0);
          });
        });
      });
    } catch (err) { console.warn('[WeeklyReport]', err); }

    // Water average this week
    let waterAvg = 0;
    let prevWaterAvg = 0;
    const dailyWater = [0, 0, 0, 0, 0, 0, 0];
    try {
      const weekWater = waterData.filter((w) => {
        const d = new Date(w.date);
        return d >= monday && d <= now;
      });
      if (weekWater.length > 0) {
        waterAvg = Math.round(weekWater.reduce((sum, w) => sum + (w.glasses || 0), 0) / weekWater.length);
        weekWater.forEach((w) => {
          const d = new Date(w.date);
          const dayIdx = (d.getDay() + 6) % 7;
          dailyWater[dayIdx] = w.glasses || 0;
        });
      }
      const prevWater = waterData.filter((w) => {
        const d = new Date(w.date);
        return d >= prevMonday && d <= prevSunday;
      });
      if (prevWater.length > 0) {
        prevWaterAvg = Math.round(prevWater.reduce((sum, w) => sum + (w.glasses || 0), 0) / prevWater.length);
      }
    } catch (err) { console.warn('[WeeklyReport]', err); }

    // Progress entries
    let weightChange = null;
    try {
      const sorted = [...progressData].sort((a, b) => new Date(a.date) - new Date(b.date));
      if (sorted.length >= 2) {
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        weightChange = +(last.weight - first.weight).toFixed(1);
      }
    } catch (err) { console.warn('[WeeklyReport]', err); }

    // Workout completion rate
    const targetWorkouts = plan?.workoutSplit?.filter(d => !d.isRest).length || 4;
    const completionRate = Math.min(100, Math.round((workoutCount / targetWorkouts) * 100));

    // Key highlight
    let highlight = '';
    if (workoutCount >= targetWorkouts) {
      highlight = t('report.improving');
    } else if (workoutCount > prevWorkoutCount) {
      highlight = t('report.stable');
    } else if (workoutCount > 0) {
      highlight = t('report.stable');
    }

    return {
      weekRange: `${formatDate(monday, localeMap[lang] || 'tr-TR')} — ${formatDate(sunday, localeMap[lang] || 'tr-TR')}`,
      workoutCount,
      prevWorkoutCount,
      targetWorkouts,
      totalVolume,
      prevTotalVolume,
      waterAvg,
      prevWaterAvg,
      dailyWorkouts,
      dailyWater,
      weightChange,
      completionRate,
      highlight,
    };
  }, [workoutData, waterData, progressData, plan, lang, t]);

  /* ── Canvas image generation ── */
  const generateShareImage = useCallback(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, 1080);
    grad.addColorStop(0, '#020617');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Radial glow
    const radial = ctx.createRadialGradient(540, 120, 0, 540, 120, 300);
    radial.addColorStop(0, 'rgba(255, 109, 0, 0.08)');
    radial.addColorStop(1, 'rgba(255, 109, 0, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 1080, 400);

    // Accent line
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

    // Title
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#ff6d00';
    ctx.fillText(t('report.weeklyTitle'), 540, 220);

    // Week range
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(report.weekRange, 540, 265);

    // Completion ring (simplified as a badge)
    ctx.fillStyle = report.completionRate >= 100 ? '#22c55e' : '#ff6d00';
    ctx.font = 'bold 80px sans-serif';
    ctx.fillText(`${report.completionRate}%`, 540, 400);
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`${report.workoutCount}/${report.targetWorkouts} ${t('report.workouts')}`, 540, 440);

    // Stats
    const drawStat = (x, y, label, value, color) => {
      ctx.fillStyle = '#1e293b';
      roundRect(ctx, x, y, 400, 100, 16);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, 400, 100, 16);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(value, x + 200, y + 48);
      ctx.fillStyle = '#64748b';
      ctx.font = '20px sans-serif';
      ctx.fillText(label, x + 200, y + 82);
    };

    drawStat(100, 500, t('report.weeklyTitle') + ' Volume', `${report.totalVolume.toLocaleString()} kg`, '#ff6d00');
    drawStat(580, 500, t('report.avgSleep'), `${report.waterAvg} ${t('water.glasses')}`, '#00b0ff');
    drawStat(100, 640, t('report.weightTrend'), report.weightChange !== null ? `${report.weightChange > 0 ? '+' : ''}${report.weightChange} kg` : '—', '#22c55e');
    drawStat(580, 640, t('report.waterConsistency'), `${report.waterAvg * 250} ml`, '#8b5cf6');

    // Sparkline bars (simplified)
    const barStartX = 200;
    const barY = 820;
    const barMaxH = 60;
    const maxVal = Math.max(...report.dailyWorkouts, 1);
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    report.dailyWorkouts.forEach((val, i) => {
      const barH = Math.max(4, (val / maxVal) * barMaxH);
      const x = barStartX + i * 100;
      ctx.fillStyle = val > 0 ? '#ff6d00' : '#1e293b';
      roundRect(ctx, x, barY + barMaxH - barH, 40, barH, 6);
      ctx.fill();
      ctx.fillStyle = '#64748b';
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(dayLabels[i], x + 20, barY + barMaxH + 25);
    });

    // Divider
    const divGrad = ctx.createLinearGradient(200, 0, 880, 0);
    divGrad.addColorStop(0, 'rgba(51, 65, 85, 0)');
    divGrad.addColorStop(0.5, 'rgba(51, 65, 85, 1)');
    divGrad.addColorStop(1, 'rgba(51, 65, 85, 0)');
    ctx.fillStyle = divGrad;
    ctx.fillRect(200, 940, 680, 1);

    // Highlight
    if (report.highlight) {
      ctx.font = '28px sans-serif';
      ctx.fillStyle = '#f1f5f9';
      ctx.textAlign = 'center';
      ctx.fillText(report.highlight, 540, 985);
    }

    // Watermark
    ctx.fillStyle = '#334155';
    ctx.font = '22px sans-serif';
    ctx.fillText('fullbalance.app', 540, 1050);

    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  }, [report, t]);

  const handleShare = useCallback(async () => {
    setGenerating(true);
    try {
      const blob = await generateShareImage();
      if (!blob) return;
      const file = new File([blob], 'fullbalance-weekly-report.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: 'Full Balance', text: t('report.weeklyTitle'), files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fullbalance-weekly-report.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (err?.name !== 'AbortError') console.warn('[WeeklyReport] Share failed:', err?.message || err);
    } finally {
      setGenerating(false);
    }
  }, [generateShareImage, t]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
    >
      {/* Header */}
      <motion.div variants={itemV} className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-orange-400" />
          <h3 className="text-sm font-bold font-outfit text-white">{t('report.weeklyTitle')}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{report.weekRange}</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            disabled={generating}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-colors cursor-pointer disabled:opacity-50"
            title={t('report.share')}
          >
            <Share2 size={11} />
            <span className="text-[9px] font-medium">{generating ? '...' : t('report.share')}</span>
          </motion.button>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <>

      {/* Completion ring */}
      <motion.div variants={itemV} className="flex items-center gap-4 mb-4 px-3 py-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
        <div className="relative w-14 h-14">
          <svg width="56" height="56" viewBox="0 0 56 56" className="transform -rotate-90">
            <circle cx="28" cy="28" r="23" fill="none" stroke="#1e293b" strokeWidth="4" />
            <circle
              cx="28" cy="28" r="23" fill="none"
              stroke={report.completionRate >= 100 ? '#22c55e' : '#ff6d00'}
              strokeWidth="4" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 23}
              strokeDashoffset={2 * Math.PI * 23 * (1 - report.completionRate / 100)}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white font-outfit">
            %{report.completionRate}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-white font-outfit">
              {report.workoutCount}/{report.targetWorkouts} {t('report.workouts')}
            </p>
            <ComparisonBadge current={report.workoutCount} previous={report.prevWorkoutCount} />
          </div>
          <p className="text-[10px] text-slate-500">
            {report.completionRate >= 100 ? t('weeklyReport.goalComplete') : report.completionRate >= 50 ? t('weeklyReport.doingWell') : t('weeklyReport.keepGoing')}
          </p>
        </div>
      </motion.div>

      {/* Mini sparkline — daily activity */}
      <motion.div variants={itemV} className="mb-4 px-3 py-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-slate-500 font-medium">{t('report.weeklyTitle')}</p>
          <div className="flex gap-2 text-[8px] text-slate-600">
            {[t('common.mon').charAt(0), t('common.tue').charAt(0), t('common.wed').charAt(0), t('common.thu').charAt(0), t('common.fri').charAt(0), t('common.sat').charAt(0), t('common.sun').charAt(0)].map((d, i) => (
              <span key={i} className="w-[6px] text-center">{d}</span>
            ))}
          </div>
        </div>
        <SparklineBars data={report.dailyWorkouts} max={1} />
      </motion.div>

      {/* Stats with comparison */}
      <div className="space-y-2">
        <motion.div variants={itemV}>
          <StatRow
            icon={Dumbbell}
            label={t('weeklyReport.volume')}
            value={`${report.totalVolume.toLocaleString()} kg`}
            color="#ff6d00"
            comparison={<ComparisonBadge current={report.totalVolume} previous={report.prevTotalVolume} suffix={` ${t('report.vsLastWeek')}`} />}
          />
        </motion.div>
        <motion.div variants={itemV}>
          <StatRow
            icon={Droplets}
            label={t('weeklyReport.waterAvg')}
            value={`${report.waterAvg} ${t('water.glasses')}`}
            sub={`${report.waterAvg * 250} ml`}
            color="#00b0ff"
            comparison={<ComparisonBadge current={report.waterAvg} previous={report.prevWaterAvg} />}
          />
        </motion.div>
        <motion.div variants={itemV}>
          <StatRow
            icon={report.weightChange !== null && report.weightChange > 0 ? TrendingUp : report.weightChange !== null && report.weightChange < 0 ? TrendingDown : Minus}
            label={t('weeklyReport.weightChange')}
            value={report.weightChange !== null ? `${report.weightChange > 0 ? '+' : ''}${report.weightChange} kg` : t('report.noData')}
            color={report.weightChange !== null ? (report.weightChange < 0 ? '#22c55e' : '#f59e0b') : '#64748b'}
          />
        </motion.div>
      </div>

      {/* Key highlight */}
      {report.highlight && (
        <motion.div variants={itemV} className="mt-4 text-center py-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/10">
          <Award size={20} className="text-orange-400 mx-auto mb-1" />
          <p className="text-xs font-bold text-white font-outfit">
            {report.highlight}
          </p>
        </motion.div>
      )}

      {/* Grade */}
      {!report.highlight && (
        <motion.div variants={itemV} className="mt-4 text-center py-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/10">
          <Award size={20} className="text-orange-400 mx-auto mb-1" />
          <p className="text-xs font-bold text-white font-outfit">
            {report.completionRate >= 100 ? t('weeklyReport.perfectWeek') : report.completionRate >= 75 ? t('weeklyReport.greatWeek') : report.completionRate >= 50 ? t('weeklyReport.goodWeek') : t('weeklyReport.needsImprovement')}
          </p>
        </motion.div>
      )}
        </>)
      }
    </motion.div>
  );
}
