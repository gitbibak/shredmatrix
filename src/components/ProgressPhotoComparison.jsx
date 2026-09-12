import { useEffect, useState } from 'react';
import { Share2, Download, Trash2, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { photoComparisonCopy } from '../i18n/photoComparisonCopy';
import { getProgress, getMeasurements } from '../lib/dataService';
import { comparisonFile, measurementForPhoto } from '../lib/photoComparison';

export default function ProgressPhotoComparison({ gallery, onDelete }) {
  const { lang, t } = useTranslation();
  const c = photoComparisonCopy[lang] || photoComparisonCopy.en;
  const locale = { tr: 'tr-TR', en: 'en-US', es: 'es-ES' }[lang] || 'en-US';
  const sorted = [...gallery].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
  const [selection, setSelection] = useState([]);
  const [entries, setEntries] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [measurementError, setMeasurementError] = useState(false);
  const [grid, setGrid] = useState(false);
  const [consent, setConsent] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const selectedFirst = sorted.find((p) => String(p.id) === selection[0]) || sorted[0];
  const selectedSecond =
    sorted.find((p) => String(p.id) === selection[1] && p.id !== selectedFirst?.id) ||
    [...sorted].reverse().find((p) => p.id !== selectedFirst?.id);
  const [first, second] = [selectedFirst, selectedSecond].filter(Boolean).sort((a, b) => new Date(a.date) - new Date(b.date));
  const pairKey = `${first?.id}:${second?.id}`;
  useEffect(() => {
    if (consent !== pairKey || !first || !second) return;
    let cancelled = false;
    setFile(null);
    setError('');
    comparisonFile([first, second], locale)
      .then((value) => {
        if (!cancelled) setFile({ key: pairKey, value });
      })
      .catch(() => {
        if (!cancelled) setError(c.error);
      });
    return () => {
      cancelled = true;
    };
  }, [consent, pairKey, first?.src, second?.src, locale]);
  useEffect(() => {
    let cancelled = false;
    getProgress()
      .then((data) => {
        if (!cancelled) setEntries(data || []);
      })
      .catch(() => {
        if (!cancelled) setMeasurementError(true);
      });
    getMeasurements()
      .then((data) => {
        if (!cancelled) setMeasurements(data || []);
      })
      .catch(() => {
        if (!cancelled) setMeasurementError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const choose = (index, id) => {
    const values = [String(first?.id), String(second?.id)];
    values[index] = id;
    setSelection(values);
    setConsent('');
    setFile(null);
    setError('');
  };
  const share = async () => {
    if (consent !== pairKey || file?.key !== pairKey) return;
    setBusy(true);
    setError('');
    try {
      // Preparing before the click preserves iOS transient activation.
      const result = file.value;
      if (navigator.canShare?.({ files: [result] }))
        await navigator.share({ files: [result] });
      else {
        const url = URL.createObjectURL(result),
          a = document.createElement('a');
        a.href = url;
        a.download = result.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    } catch (err) {
      if (err?.name !== 'AbortError') setError(c.error);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-4 space-y-3">
      <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-400">
        <ShieldCheck size={16} className="shrink-0 text-emerald-400" />
        {c.privacy}
      </p>
      <details className="text-xs text-slate-300">
        <summary className="min-h-8 cursor-pointer">{c.guide}</summary>
        <p className="pb-2 leading-relaxed">{c.tips}</p>
      </details>
      {gallery.length < 2 ? (
        <p className="text-xs text-slate-400">{c.empty}</p>
      ) : (
        <>
          <h4 className="text-sm font-semibold text-white">{c.title}</h4>
          <label className="flex min-h-10 items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={grid}
              onChange={(e) => setGrid(e.target.checked)}
            />
            {c.grid}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[first, second].map((photo, index) => {
              const measurement = measurementForPhoto(photo, entries);
              const body = measurementForPhoto(photo, measurements);
              return (
                <div key={index} className="min-w-0 space-y-2">
                  <label className="block text-xs text-slate-300">
                    {index === 0 ? c.before : c.after}
                    <select
                      disabled={busy}
                      value={String(photo.id)}
                      onChange={(e) => choose(index, e.target.value)}
                      className="mt-1 min-h-11 w-full min-w-0 rounded border border-slate-700 bg-slate-950 px-1 text-xs text-white"
                    >
                      {sorted.map((p, i) => (
                        <option
                          key={p.id}
                          value={String(p.id)}
                          disabled={p.id === (index ? first.id : second.id)}
                        >
                          {new Date(p.date).toLocaleDateString(locale)} ·{' '}
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="relative aspect-[3/4] overflow-hidden rounded border border-slate-700 bg-slate-950">
                    <img
                      src={photo.src}
                      alt={index === 0 ? c.before : c.after}
                      className="h-full w-full object-contain"
                    />
                    {grid && (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{
                          backgroundImage:
                            'linear-gradient(to right, transparent calc(50% - 1px), #ffffff66 50%, transparent calc(50% + 1px)), linear-gradient(to bottom, transparent 33%, #ffffff66 33%, transparent 33.5%, transparent 66%, #ffffff66 66%, transparent 66.5%)',
                        }}
                      />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {c.added}: {new Date(photo.date).toLocaleDateString(locale)}
                  </p>
                  <p className="text-xs text-slate-300">
                    {measurementError
                      ? c.failed
                      : measurement
                        ? `${c.measurement}: ${measurement.weight} kg${measurement.bodyFat ? ` · ${c.bodyFat} ${measurement.bodyFat}%` : ''}`
                        : body ? c.measurement : c.noMeasurement}
                  </p>
                  {body && (
                    <dl className="text-xs text-slate-300">
                      {['chest', 'waist', 'hip', 'arm', 'leg']
                        .filter((key) => Number(body[key]) > 0)
                        .map((key) => (
                          <div key={key} className="flex flex-wrap gap-1">
                            <dt>{t(`measurements.${key}`)}:</dt>
                            <dd>{body[key]} cm</dd>
                          </div>
                        ))}
                    </dl>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    title={c.remove}
                    aria-label={`${c.remove} ${index + 1}`}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await onDelete(photo.id);
                        setConsent('');
                        setFile(null);
                      } finally {
                        setBusy(false);
                      }
                    }}
                    className="flex min-h-11 w-11 items-center justify-center rounded text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
          <label className="flex items-start gap-2 text-xs leading-relaxed text-slate-300">
            <input
              type="checkbox"
              disabled={busy}
              checked={consent === pairKey}
              onChange={(e) => setConsent(e.target.checked ? pairKey : '')}
              className="mt-1"
            />
            {c.consent}
          </label>
          {consent === pairKey && file?.key !== pairKey && !error && <p role="status" className="text-xs text-slate-400">{c.preparing}</p>}
          <button
            type="button"
            disabled={busy || consent !== pairKey || file?.key !== pairKey}
            onClick={share}
            className="flex min-h-11 items-center gap-2 rounded border border-slate-700 px-3 text-sm text-white disabled:opacity-40"
          >
            {navigator.share ? <Share2 size={16} /> : <Download size={16} />}
            {navigator.share ? c.share : c.download}
          </button>
          {error && (
            <p role="alert" className="text-xs text-red-300">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
