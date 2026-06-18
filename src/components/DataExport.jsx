import { useTranslation } from '../i18n/LanguageContext';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

const PROGRESS_KEY = 'shredmatrix_progress';
const MEASURE_KEY = 'shredmatrix_measurements';
const SLEEP_KEY = 'shredmatrix_sleep';

function loadJSON(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default function DataExport() {
  const { t } = useTranslation();

  const hasData = () => {
    return loadJSON(PROGRESS_KEY).length > 0 ||
           loadJSON(MEASURE_KEY).length > 0 ||
           loadJSON(SLEEP_KEY).length > 0;
  };

  const exportCSV = () => {
    const progress = loadJSON(PROGRESS_KEY);
    const measures = loadJSON(MEASURE_KEY);
    const sleep = loadJSON(SLEEP_KEY);

    let csv = `${t('dataExport.date')},${t('dataExport.weight')} (kg),${t('dataExport.bodyFat')} (%),${t('measurements.chest')} (cm),${t('measurements.waist')} (cm),${t('measurements.hip')} (cm),${t('measurements.arm')} (cm),${t('measurements.leg')} (cm),${t('sleep.title')} (h)\n`;

    // Collect all dates
    const dateSet = new Set();
    progress.forEach(e => dateSet.add(e.date));
    measures.forEach(e => dateSet.add(e.date));
    sleep.forEach(e => dateSet.add(e.date));

    const dates = [...dateSet].sort();
    dates.forEach(date => {
      const p = progress.find(e => e.date === date) || {};
      const m = measures.find(e => e.date === date) || {};
      const s = sleep.find(e => e.date === date) || {};
      csv += `${date},${p.weight || ''},${p.bodyFat || ''},${m.chest || ''},${m.waist || ''},${m.hip || ''},${m.arm || ''},${m.leg || ''},${s.hours || ''}\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shredmatrix_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const progress = loadJSON(PROGRESS_KEY);
    const measures = loadJSON(MEASURE_KEY);
    const sleep = loadJSON(SLEEP_KEY);

    const dateSet = new Set();
    progress.forEach(e => dateSet.add(e.date));
    measures.forEach(e => dateSet.add(e.date));
    sleep.forEach(e => dateSet.add(e.date));
    const dates = [...dateSet].sort();

    const rows = dates.map(date => {
      const p = progress.find(e => e.date === date) || {};
      const m = measures.find(e => e.date === date) || {};
      const s = sleep.find(e => e.date === date) || {};
      return `<tr>
        <td>${escapeHtml(date)}</td>
        <td>${escapeHtml(p.weight || '–')}</td><td>${escapeHtml(p.bodyFat || '–')}</td>
        <td>${escapeHtml(m.chest || '–')}</td><td>${escapeHtml(m.waist || '–')}</td><td>${escapeHtml(m.hip || '–')}</td>
        <td>${escapeHtml(m.arm || '–')}</td><td>${escapeHtml(m.leg || '–')}</td><td>${escapeHtml(s.hours || '–')}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>ShredMatrix Data</title>
    <style>
      body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #fff; padding: 40px; }
      h1 { color: #ff6d00; font-size: 24px; margin-bottom: 4px; }
      h2 { color: #94a3b8; font-size: 12px; font-weight: 400; margin-bottom: 24px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { background: #1e293b; color: #94a3b8; padding: 8px 12px; text-align: left; font-weight: 600; }
      td { padding: 8px 12px; border-bottom: 1px solid #1e293b; }
      tr:hover { background: #1e293b40; }
      @media print { body { background: #fff; color: #000; } th { background: #f1f5f9; color: #333; } td { border-color: #e2e8f0; } h1 { color: #ff6d00; } }
    </style></head><body>
    <h1>🔥 ShredMatrix</h1>
    <h2>${escapeHtml(t('dataExport.desc'))} — ${escapeHtml(new Date().toLocaleDateString())}</h2>
    <table>
      <thead><tr>
        <th>${escapeHtml(t('dataExport.date'))}</th><th>${escapeHtml(t('dataExport.weight'))}</th><th>${escapeHtml(t('dataExport.bodyFat'))}</th>
        <th>${escapeHtml(t('measurements.chest'))}</th><th>${escapeHtml(t('measurements.waist'))}</th><th>${escapeHtml(t('measurements.hip'))}</th>
        <th>${escapeHtml(t('measurements.arm'))}</th><th>${escapeHtml(t('measurements.leg'))}</th><th>${escapeHtml(t('sleep.title'))}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <Download size={16} className="text-cyan-400" />
        <h3 className="text-sm font-bold font-outfit text-white">{t('dataExport.title')}</h3>
      </div>
      <p className="text-[10px] text-slate-500 mb-4">{t('dataExport.desc')}</p>

      {!hasData() ? (
        <p className="text-xs text-slate-600 text-center py-3">{t('dataExport.noData')}</p>
      ) : (
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={exportCSV}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold cursor-pointer hover:bg-emerald-500/20 transition-colors">
            <FileSpreadsheet size={14} />
            {t('dataExport.csv')}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={exportPDF}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold cursor-pointer hover:bg-blue-500/20 transition-colors">
            <FileText size={14} />
            {t('dataExport.pdf')}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
