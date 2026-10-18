// Yönetim paneli ortak yapı taşları. Tüm bölümler aynı görsel dili kullanır.

const numberFormat = new Intl.NumberFormat('tr-TR');

export function formatNumber(value) {
  return value == null || Number.isNaN(value) ? '—' : numberFormat.format(value);
}

export function formatPercent(value) {
  return value == null ? '—' : `%${value}`;
}

const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

/** "2026-10-18" → "18 Eki" */
export function formatDay(dayKey) {
  if (!dayKey) return '—';
  const [, month, day] = dayKey.split('-');
  return `${Number(day)} ${MONTHS[Number(month) - 1]}`;
}

/** Gün anahtarını bugüne göre: "bugün", "dün", "3 gün önce", "18 Eki". */
export function relativeDay(dayKey, today) {
  if (!dayKey) return '—';
  const diff = Math.round((new Date(`${today}T00:00:00Z`) - new Date(`${dayKey}T00:00:00Z`)) / 86400000);
  if (diff <= 0) return 'bugün';
  if (diff === 1) return 'dün';
  if (diff < 7) return `${diff} gün önce`;
  return formatDay(dayKey);
}

export function timeAgo(value) {
  if (!value) return '—';
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return 'az önce';
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün önce`;
  return new Date(value).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' });
}

export function Panel({ title, description, action, children, className = '', id }) {
  return (
    <section aria-labelledby={id ? `${id}-title` : undefined} className={`rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h3 id={id ? `${id}-title` : undefined} className="font-outfit text-[15px] font-bold text-white">{title}</h3>}
            {description && <p className="mt-0.5 text-xs leading-5 text-slate-400">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/** Değişim göstergesi. `goodWhenUp=false` olduğunda artış kırmızı gösterilir. */
export function Delta({ value, goodWhenUp = true, label = 'önceki döneme göre' }) {
  if (value == null) return null;
  const tone = value === 0 ? 'text-slate-400' : (value > 0) === goodWhenUp ? 'text-emerald-300' : 'text-rose-300';
  const sign = value > 0 ? '+' : value < 0 ? '−' : '±';
  return (
    <span className={`text-xs font-semibold tabular-nums ${tone}`} title={label}>
      {sign}{formatNumber(Math.abs(value))} <span className="font-normal text-slate-500">{label}</span>
    </span>
  );
}

export function Metric({ label, value, hint, delta, loading = false }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      {loading
        ? <div className="mt-2 h-9 w-20 animate-pulse rounded-lg bg-slate-800" aria-hidden="true" />
        : <p className="mt-1 font-outfit text-3xl font-bold tabular-nums text-white">{value}</p>}
      <div className="mt-1.5 min-h-5 space-y-0.5">
        {!loading && delta}
        {hint && <p className="text-xs leading-5 text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}

/**
 * Yatay çubuk liste. rows: [{ label, value, detail? }]
 * Çubuk genişliği en büyük değere göredir.
 */
export function BarList({ rows = [], emptyText = 'Bu dönemde veri yok.', color = 'bg-orange-500/25', limit, valueFormat = formatNumber }) {
  const visible = limit ? rows.slice(0, limit) : rows;
  if (visible.length === 0) return <p className="py-3 text-sm text-slate-500">{emptyText}</p>;
  const max = Math.max(...visible.map((row) => row.value), 1);
  return (
    <ul className="space-y-1.5">
      {visible.map((row) => (
        <li key={row.key || row.label} className="relative overflow-hidden rounded-lg">
          <div className={`absolute inset-y-0 left-0 rounded-lg ${color}`} style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }} aria-hidden="true" />
          <div className="relative flex items-center justify-between gap-3 px-2.5 py-1.5 text-sm">
            <span className="min-w-0 truncate text-slate-200" title={row.label}>{row.label}</span>
            <span className="shrink-0 tabular-nums text-slate-300">
              <span className="font-semibold text-white">{valueFormat(row.value)}</span>
              {row.detail && <span className="ml-2 text-xs text-slate-400">{row.detail}</span>}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function SegmentedControl({ label, options, value, onChange, disabled = false }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-xl border border-slate-800 bg-slate-950 p-1">
      {options.map(([optionValue, optionLabel]) => (
        <button
          key={optionValue}
          type="button"
          aria-pressed={value === optionValue}
          disabled={disabled}
          onClick={() => onChange(optionValue)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
            value === optionValue ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {optionLabel}
        </button>
      ))}
    </div>
  );
}

export function Pill({ tone = 'slate', children, title }) {
  const tones = {
    slate: 'border-slate-700 bg-slate-800/60 text-slate-300',
    green: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
    orange: 'border-orange-500/25 bg-orange-500/10 text-orange-300',
    red: 'border-rose-500/25 bg-rose-500/10 text-rose-300',
    blue: 'border-sky-500/25 bg-sky-500/10 text-sky-300',
    amber: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
  };
  return <span title={title} className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${tones[tone] || tones.slate}`}>{children}</span>;
}

export function SkeletonRows({ rows = 4 }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => <div key={index} className="h-8 animate-pulse rounded-lg bg-slate-800/70" />)}
    </div>
  );
}
