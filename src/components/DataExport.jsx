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
  const { t, lang } = useTranslation();
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
  const labels = {
    spreadsheet: lang === 'tr' ? 'Excel indir' : lang === 'es' ? 'Descargar Excel' : 'Download Excel',
    pdf: lang === 'tr' ? 'Rapor indir' : lang === 'es' ? 'Descargar informe' : 'Download report',
    generated: lang === 'tr' ? 'Oluşturma' : lang === 'es' ? 'Generado' : 'Generated',
    summary: lang === 'tr' ? 'Özet' : lang === 'es' ? 'Resumen' : 'Summary',
    latestWeight: lang === 'tr' ? 'Son kilo' : lang === 'es' ? 'Peso actual' : 'Latest weight',
    records: lang === 'tr' ? 'kayıt' : lang === 'es' ? 'registros' : 'records',
    focus: lang === 'tr' ? 'Odak' : lang === 'es' ? 'Enfoque' : 'Focus',
    water: lang === 'tr' ? 'Su' : lang === 'es' ? 'Agua' : 'Water',
    workout: lang === 'tr' ? 'Antrenman' : lang === 'es' ? 'Entreno' : 'Workout',
  };

  const latestProgress = [...data.progress]
    .filter((entry) => entry?.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];

  const buildReportTables = () => {
    const progressRows = data.progress.map((entry) => `<tr>
      <td>${escapeHtml(entry.date || '-')}</td>
      <td>${escapeHtml(entry.weight || '-')}</td>
      <td>${escapeHtml(entry.bodyFat || entry.body_fat || '-')}</td>
    </tr>`).join('');

    const measurementRows = data.measurements.map((entry) => `<tr>
      <td>${escapeHtml(entry.date || '-')}</td>
      <td>${escapeHtml(entry.chest || '-')}</td>
      <td>${escapeHtml(entry.waist || '-')}</td>
      <td>${escapeHtml(entry.hip || '-')}</td>
      <td>${escapeHtml(entry.arm || '-')}</td>
      <td>${escapeHtml(entry.leg || '-')}</td>
    </tr>`).join('');

    const workoutRows = data.workouts.map((entry) => `<tr>
      <td>${escapeHtml(entry.date || '-')}</td>
      <td>${escapeHtml(entry.day_focus || entry.focus || '-')}</td>
      <td>${escapeHtml((entry.exercises || []).length || '-')}</td>
      <td>${escapeHtml(entry.notes || '-')}</td>
    </tr>`).join('');

    const habitRows = rows
      .filter((row) => row.water !== '' || row.sleep !== '')
      .map((row) => `<tr>
        <td>${escapeHtml(row.date)}</td>
        <td>${escapeHtml(row.water === '' ? '-' : row.water)}</td>
        <td>${escapeHtml(row.sleep || '-')}</td>
      </tr>`).join('');

    return { progressRows, measurementRows, workoutRows, habitRows };
  };

  const buildDocumentHtml = ({ printable = false } = {}) => {
    const { progressRows, measurementRows, workoutRows, habitRows } = buildReportTables();
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Full Balance ${today}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: ${printable ? '#f8fafc' : '#fff'}; color: #0f172a; padding: 28px; }
      h1 { color: #ff6d00; font-size: 26px; margin: 0 0 4px; }
      h2 { color: #64748b; font-size: 12px; font-weight: 600; margin: 0 0 20px; }
      h3 { color: #0f172a; font-size: 15px; margin: 24px 0 8px; }
      .stats { display: grid; grid-template-columns: repeat(4, minmax(90px, 1fr)); gap: 8px; margin-bottom: 18px; }
      .stat { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; }
      .stat b { display: block; font-size: 20px; }
      .stat span { color: #64748b; font-size: 10px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; background: #fff; margin-bottom: 8px; table-layout: fixed; }
      th { background: #e2e8f0; color: #334155; padding: 9px; text-align: left; font-weight: 700; }
      td { padding: 8px 9px; border-bottom: 1px solid #e2e8f0; vertical-align: top; word-wrap: break-word; }
      .empty { color: #94a3b8; font-size: 12px; padding: 10px 0; }
      @media print { body { background: #fff; padding: 18px; } .stat { break-inside: avoid; } table { page-break-inside: auto; } tr { page-break-inside: avoid; } }
    </style></head><body>
    <h1>Full Balance</h1>
    <h2>${escapeHtml(labels.generated)}: ${escapeHtml(new Date().toLocaleDateString())}</h2>
    <div class="stats">
      <div class="stat"><b>${data.progress.length}</b><span>Progress</span></div>
      <div class="stat"><b>${data.workouts.length}</b><span>${escapeHtml(labels.workout)}</span></div>
      <div class="stat"><b>${data.water.length}</b><span>${escapeHtml(labels.water)}</span></div>
      <div class="stat"><b>${latestProgress?.weight || '-'}</b><span>${escapeHtml(labels.latestWeight)}</span></div>
    </div>
    <h3>Progress</h3>
    ${progressRows ? `<table><thead><tr><th>${escapeHtml(t('dataExport.date'))}</th><th>${escapeHtml(t('dataExport.weight'))} (kg)</th><th>${escapeHtml(t('dataExport.bodyFat'))} (%)</th></tr></thead><tbody>${progressRows}</tbody></table>` : `<p class="empty">0 ${escapeHtml(labels.records)}</p>`}
    <h3>${escapeHtml(t('measurements.title') || 'Measurements')}</h3>
    ${measurementRows ? `<table><thead><tr><th>${escapeHtml(t('dataExport.date'))}</th><th>${escapeHtml(t('measurements.chest'))}</th><th>${escapeHtml(t('measurements.waist'))}</th><th>${escapeHtml(t('measurements.hip'))}</th><th>${escapeHtml(t('measurements.arm'))}</th><th>${escapeHtml(t('measurements.leg'))}</th></tr></thead><tbody>${measurementRows}</tbody></table>` : `<p class="empty">0 ${escapeHtml(labels.records)}</p>`}
    <h3>${escapeHtml(labels.workout)}</h3>
    ${workoutRows ? `<table><thead><tr><th>${escapeHtml(t('dataExport.date'))}</th><th>${escapeHtml(labels.focus)}</th><th>Exercise</th><th>Notes</th></tr></thead><tbody>${workoutRows}</tbody></table>` : `<p class="empty">0 ${escapeHtml(labels.records)}</p>`}
    <h3>${escapeHtml(labels.water)} / ${escapeHtml(t('sleep.title'))}</h3>
    ${habitRows ? `<table><thead><tr><th>${escapeHtml(t('dataExport.date'))}</th><th>${escapeHtml(labels.water)}</th><th>${escapeHtml(t('sleep.title'))}</th></tr></thead><tbody>${habitRows}</tbody></table>` : `<p class="empty">0 ${escapeHtml(labels.records)}</p>`}
    </body></html>`;
  };

  const exportSpreadsheet = () => {
    const html = buildDocumentHtml();
    downloadBlob(
      new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' }),
      `fullbalance_data_${today}.xls`,
    );
  };

  const exportPDF = () => {
    const html = buildDocumentHtml({ printable: true });

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
              onClick={exportSpreadsheet}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold cursor-pointer hover:bg-emerald-500/20 transition-colors"
            >
              <FileSpreadsheet size={14} />
              {labels.spreadsheet}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={exportPDF}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold cursor-pointer hover:bg-blue-500/20 transition-colors"
            >
              <FileText size={14} />
              {labels.pdf}
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
}
