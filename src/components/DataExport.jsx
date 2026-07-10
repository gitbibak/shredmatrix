import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Download, FileSpreadsheet, FileText, RefreshCw } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { getMeasurements, getProgress, getSleep, getWaterHistory, getWorkoutLogs } from '../lib/dataService';

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function csvCell(value) {
  if (value == null) return '';
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function collectDates(...groups) {
  const dates = new Set();
  groups.flat().forEach((entry) => {
    const date = entry?.date || entry?.created_at?.slice?.(0, 10);
    if (date) dates.add(date);
  });
  return [...dates].sort();
}

function findByDate(entries, date) {
  return entries.find((entry) => (entry.date || entry.created_at?.slice?.(0, 10)) === date) || {};
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

export default function DataExport() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    progress: [],
    measurements: [],
    sleep: [],
    water: [],
    workouts: [],
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [progress, measurements, sleep, water, workouts] = await Promise.all([
        getProgress().catch(() => []),
        getMeasurements().catch(() => []),
        getSleep(365).catch(() => []),
        getWaterHistory(365).catch(() => []),
        getWorkoutLogs().catch(() => []),
      ]);
      setData({
        progress: progress || [],
        measurements: measurements || [],
        sleep: sleep || [],
        water: water || [],
        workouts: workouts || [],
      });
    } catch (err) {
      setError(err?.message || 'Export data could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const rows = useMemo(() => {
    const dates = collectDates(data.progress, data.measurements, data.sleep, data.water, data.workouts);
    return dates.map((date) => {
      const progress = findByDate(data.progress, date);
      const measurement = findByDate(data.measurements, date);
      const sleep = findByDate(data.sleep, date);
      const water = findByDate(data.water, date);
      const workouts = data.workouts.filter((entry) => (entry.date || entry.created_at?.slice?.(0, 10)) === date);

      return {
        date,
        weight: progress.weight || '',
        bodyFat: progress.bodyFat || progress.body_fat || '',
        chest: measurement.chest || '',
        waist: measurement.waist || '',
        hip: measurement.hip || '',
        arm: measurement.arm || '',
        leg: measurement.leg || '',
        sleep: sleep.hours || '',
        water: water.glasses ?? water.amount ?? '',
        workouts: workouts.length,
        workoutFocus: workouts.map((entry) => entry.day_focus || entry.focus).filter(Boolean).join(' / '),
      };
    });
  }, [data]);

  const totalRecords = data.progress.length + data.measurements.length + data.sleep.length + data.water.length + data.workouts.length;
  const today = new Date().toISOString().split('T')[0];

  const exportCSV = () => {
    const header = [
      t('dataExport.date'),
      `${t('dataExport.weight')} (kg)`,
      `${t('dataExport.bodyFat')} (%)`,
      `${t('measurements.chest')} (cm)`,
      `${t('measurements.waist')} (cm)`,
      `${t('measurements.hip')} (cm)`,
      `${t('measurements.arm')} (cm)`,
      `${t('measurements.leg')} (cm)`,
      `${t('sleep.title')} (h)`,
      'Water',
      'Workouts',
      'Workout focus',
    ];

    const csv = [
      header.map(csvCell).join(','),
      ...rows.map((row) => [
        row.date,
        row.weight,
        row.bodyFat,
        row.chest,
        row.waist,
        row.hip,
        row.arm,
        row.leg,
        row.sleep,
        row.water,
        row.workouts,
        row.workoutFocus,
      ].map(csvCell).join(',')),
    ].join('\n');

    downloadBlob(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }), `fullbalance_data_${today}.csv`);
  };

  const exportPDF = () => {
    const tableRows = rows.map((row) => `<tr>
      <td>${escapeHtml(row.date)}</td>
      <td>${escapeHtml(row.weight || '-')}</td>
      <td>${escapeHtml(row.bodyFat || '-')}</td>
      <td>${escapeHtml(row.waist || '-')}</td>
      <td>${escapeHtml(row.sleep || '-')}</td>
      <td>${escapeHtml(row.water || '-')}</td>
      <td>${escapeHtml(row.workouts || '-')}</td>
      <td>${escapeHtml(row.workoutFocus || '-')}</td>
    </tr>`).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Full Balance Data</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #0f172a; padding: 32px; }
      h1 { color: #ff6d00; font-size: 24px; margin: 0 0 4px; }
      h2 { color: #64748b; font-size: 12px; font-weight: 500; margin: 0 0 20px; }
      .stats { display: flex; gap: 8px; margin-bottom: 18px; }
      .stat { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; min-width: 90px; }
      .stat b { display: block; font-size: 18px; }
      .stat span { color: #64748b; font-size: 10px; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th { background: #f1f5f9; color: #334155; padding: 8px; text-align: left; }
      td { padding: 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    </style></head><body>
    <h1>Full Balance</h1>
    <h2>${escapeHtml(t('dataExport.desc'))} - ${escapeHtml(new Date().toLocaleDateString())}</h2>
    <div class="stats">
      <div class="stat"><b>${data.progress.length}</b><span>Progress</span></div>
      <div class="stat"><b>${data.workouts.length}</b><span>Workouts</span></div>
      <div class="stat"><b>${data.water.length}</b><span>Water</span></div>
      <div class="stat"><b>${data.sleep.length}</b><span>Sleep</span></div>
    </div>
    <table>
      <thead><tr>
        <th>${escapeHtml(t('dataExport.date'))}</th><th>${escapeHtml(t('dataExport.weight'))}</th><th>${escapeHtml(t('dataExport.bodyFat'))}</th>
        <th>${escapeHtml(t('measurements.waist'))}</th><th>${escapeHtml(t('sleep.title'))}</th><th>Water</th><th>Workouts</th><th>Focus</th>
      </tr></thead>
      <tbody>${tableRows}</tbody>
    </table></body></html>`;

    const w = window.open('', '_blank');
    if (!w) {
      downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8;' }), `fullbalance_report_${today}.html`);
      return;
    }
    w.document.write(html);
    w.document.close();
    window.setTimeout(() => w.print(), 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Download size={16} className="text-cyan-400 shrink-0" />
          <h3 className="text-sm font-bold font-outfit text-white">{t('dataExport.title')}</h3>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800/70 text-slate-400 hover:text-white disabled:opacity-50 cursor-pointer transition-colors"
          aria-label="Refresh export data"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <p className="text-[10px] text-slate-500 mb-4">{t('dataExport.desc')}</p>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 mb-3 text-xs text-red-300">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-24 rounded-xl bg-slate-950/50 border border-slate-800/60 animate-pulse" />
      ) : totalRecords === 0 ? (
        <div className="rounded-xl bg-slate-950/50 border border-slate-800/60 px-4 py-6 text-center">
          <p className="text-xs text-slate-500">{t('dataExport.noData')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              ['Progress', data.progress.length],
              ['Workout', data.workouts.length],
              ['Water', data.water.length],
              ['Sleep', data.sleep.length],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-2 text-center">
                <p className="text-sm font-bold text-white font-outfit">{value}</p>
                <p className="text-[9px] text-slate-500 truncate">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={exportCSV}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold cursor-pointer hover:bg-emerald-500/20 transition-colors"
            >
              <FileSpreadsheet size={14} />
              {t('dataExport.csv')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={exportPDF}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold cursor-pointer hover:bg-blue-500/20 transition-colors"
            >
              <FileText size={14} />
              {t('dataExport.pdf')}
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
}
