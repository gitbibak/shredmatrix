import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Search, Trash2 } from 'lucide-react';
import { LANGUAGE_LABELS, addUtcDays } from '../../lib/adminMetrics';
import AdminDialog from './AdminDialog';
import { Pill, SegmentedControl, SkeletonRows, formatDay, formatNumber, relativeDay } from './adminUi';

const PAGE_SIZE = 25;

export const DEFAULT_USER_FILTERS = { q: '', plan: 'all', lang: 'all', source: 'all', joined: 'all' };

export function filterUserRows(rows, filters, today) {
  const query = filters.q.trim().toLocaleLowerCase('tr-TR');
  const joinedSince = filters.joined === 'all' ? null : addUtcDays(today, -Number(filters.joined));
  return rows.filter((row) => (
    !row.isAdmin
    && (!query || `${row.name} ${row.email}`.toLocaleLowerCase('tr-TR').includes(query))
    && (filters.plan === 'all' || (filters.plan === 'has' ? row.hasPlan : !row.hasPlan))
    && (filters.lang === 'all' || row.language === filters.lang)
    && (filters.source === 'all' || (row.source || 'unknown') === filters.source)
    && (!joinedSince || (row.signupDay && row.signupDay >= joinedSince && row.signupDay < today))
  ));
}

function csvCell(value) {
  const text = value == null ? '' : String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(rows, today) {
  const header = ['Ad', 'E-posta', 'Kayıt günü', 'Dil', 'Kaynak', 'Kampanya', 'Giriş sayfası', 'Plan', 'Hedef', 'Seviye', 'Ortam', 'Son aktif', 'Aktif gün (60g)', 'Antrenman (30g)'];
  const lines = rows.map((row) => [
    row.name, row.email, row.signupDay, row.language, row.sourceLabel, row.campaign, row.landing,
    row.hasPlan ? 'Var' : 'Yok', row.plan?.goal, row.plan?.experience, row.plan?.environment,
    row.lastActive, row.activeDays, row.workouts,
  ].map(csvCell).join(','));
  const blob = new Blob([`\uFEFF${[header.join(','), ...lines].join('\n')}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `fullbalance-uyeler-${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-400">
      <span className="shrink-0">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-9 rounded-lg border border-slate-800 bg-slate-950 px-2 text-xs text-white focus:border-orange-500/60 focus:outline-none">
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </label>
  );
}

function Field({ label, children }) {
  return (
    <div className="rounded-xl bg-slate-950/60 p-3">
      <dt className="text-[11px] font-medium text-slate-400">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-white">{children || '—'}</dd>
    </div>
  );
}

export function UserDetailDialog({ row, today, onClose, onRequestDelete, deleteDisabled }) {
  return (
    <AdminDialog title={row.name || row.email || 'Üye'} onClose={onClose}>
      <p className="-mt-3 mb-4 break-all text-sm text-slate-400">{row.email}</p>
      <dl className="grid grid-cols-2 gap-2">
        <Field label="Kayıt">{`${formatDay(row.signupDay)} · ${relativeDay(row.signupDay, today)}`}</Field>
        <Field label="Son aktif">{row.lastActive ? relativeDay(row.lastActive, today) : 'Kayıt yok'}</Field>
        <Field label="Aktif gün (60 gün)">{formatNumber(row.activeDays)}</Field>
        <Field label="Antrenman (30 gün)">{formatNumber(row.workouts)}</Field>
        <Field label="Dil">{row.language ? LANGUAGE_LABELS[row.language] || row.language : null}</Field>
        <Field label="İlk kaynak">{row.sourceLabel}</Field>
        <Field label="Giriş sayfası">{row.landing}</Field>
        <Field label="Kampanya">{[row.campaign, row.content].filter(Boolean).join(' · ')}</Field>
      </dl>
      <h3 className="mb-2 mt-5 text-xs font-semibold text-slate-400">Plan</h3>
      {row.plan ? (
        <dl className="grid grid-cols-2 gap-2">
          <Field label="Hedef">{row.plan.goal}</Field>
          <Field label="Seviye">{row.plan.experience}</Field>
          <Field label="Ortam">{row.plan.environment}</Field>
          <Field label="Cinsiyet · yaş">{[row.plan.gender, row.plan.age].filter(Boolean).join(' · ')}</Field>
        </dl>
      ) : <p className="rounded-xl bg-amber-500/10 p-3 text-sm text-amber-200">Bu üye henüz plan oluşturmadı.</p>}
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
        <p className="text-xs text-slate-500">{deleteDisabled ? 'Yönetici hesapları buradan silinemez.' : 'Silme işlemi geri alınamaz.'}</p>
        <button type="button" onClick={onRequestDelete} disabled={deleteDisabled} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-30">
          <Trash2 size={14} aria-hidden="true" /> Hesabı kalıcı sil
        </button>
      </div>
    </AdminDialog>
  );
}

export default function UsersSection({ rows, loading, today, filters, onFiltersChange, onOpenUser }) {
  const [page, setPage] = useState(0);
  const setFilter = (key, value) => { setPage(0); onFiltersChange({ ...filters, [key]: value }); };

  const filtered = useMemo(() => (rows ? filterUserRows(rows, filters, today) : []), [rows, filters, today]);
  const sourceOptions = useMemo(() => {
    const seen = new Map();
    (rows || []).filter((row) => !row.isAdmin).forEach((row) => seen.set(row.source || 'unknown', row.sourceLabel));
    return [['all', 'Tümü'], ...[...seen.entries()].sort((a, b) => a[1].localeCompare(b[1], 'tr'))];
  }, [rows]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const active = JSON.stringify(filters) !== JSON.stringify(DEFAULT_USER_FILTERS);

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3 sm:p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input
            type="search" value={filters.q} onChange={(event) => setFilter('q', event.target.value)}
            aria-label="Kullanıcı ara" placeholder="İsim veya e-posta ara"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-orange-500/60 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <SegmentedControl label="Plan durumu" value={filters.plan} onChange={(value) => setFilter('plan', value)} options={[['all', 'Tümü'], ['has', 'Planı var'], ['none', 'Planı yok']]} />
          <Select label="Kayıt" value={filters.joined} onChange={(value) => setFilter('joined', value)} options={[['all', 'Tüm zamanlar'], ['7', 'Son 7 gün'], ['30', 'Son 30 gün']]} />
          <Select label="Dil" value={filters.lang} onChange={(value) => setFilter('lang', value)} options={[['all', 'Tümü'], ['tr', 'Türkçe'], ['en', 'İngilizce'], ['es', 'İspanyolca']]} />
          <Select label="Kaynak" value={filters.source} onChange={(value) => setFilter('source', value)} options={sourceOptions} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400" aria-live="polite">
        <p>{rows ? `${formatNumber(filtered.length)} üye${active ? ' (filtreli)' : ''}` : 'Üyeler yükleniyor…'}</p>
        <div className="flex items-center gap-2">
          {active && <button type="button" onClick={() => { setPage(0); onFiltersChange(DEFAULT_USER_FILTERS); }} className="rounded-lg border border-slate-700 px-3 py-1.5 hover:text-white">Filtreleri temizle</button>}
          <button type="button" disabled={!filtered.length} onClick={() => downloadCsv(filtered, today)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 hover:text-white disabled:opacity-40">
            <Download size={13} aria-hidden="true" /> CSV indir
          </button>
        </div>
      </div>

      {!rows && loading && <SkeletonRows rows={8} />}

      {rows && filtered.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center text-sm text-slate-400">
          {active ? 'Bu filtrelere uyan üye yok.' : 'Henüz kullanıcı yok'}
        </div>
      )}

      {visible.length > 0 && (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-800 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-xs text-slate-400">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">Üye</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Kayıt</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Dil</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Kaynak</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Plan</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Son aktif</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Antrenman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                {visible.map((row) => (
                  <tr key={row.id} onClick={() => onOpenUser(row.id)} className="cursor-pointer hover:bg-slate-800/40">
                    <td className="max-w-[260px] px-4 py-2.5">
                      <button type="button" onClick={(event) => { event.stopPropagation(); onOpenUser(row.id); }} aria-label={`${row.name || row.email || 'Üye'} detaylarını aç`} className="block w-full truncate text-left font-medium text-white">
                        {row.name || 'İsimsiz'}
                      </button>
                      <span className="block truncate text-xs text-slate-400">{row.email || '—'}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-300">{relativeDay(row.signupDay, today)}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-300">{row.language ? row.language.toUpperCase() : '—'}</td>
                    <td className="max-w-[160px] px-3 py-2.5 text-xs">
                      <span className="block truncate text-slate-200">{row.sourceLabel}</span>
                      {row.landing && <span className="block truncate text-slate-500" title={row.landing}>{row.landing}</span>}
                    </td>
                    <td className="px-3 py-2.5">{row.hasPlan ? <Pill tone="green">{row.plan.goal}</Pill> : <Pill tone="amber">Yok</Pill>}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-300">{row.lastActive ? relativeDay(row.lastActive, today) : '—'}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-200">{formatNumber(row.workouts)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 md:hidden">
            {visible.map((row) => (
              <li key={row.id}>
                <button type="button" onClick={() => onOpenUser(row.id)} aria-label={`${row.name || row.email || 'Üye'} detaylarını aç`} className="w-full rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-left">
                  <span className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-white">{row.name || 'İsimsiz'}</span>
                      <span className="block truncate text-xs text-slate-400">{row.email || '—'}</span>
                    </span>
                    <span className="shrink-0 text-xs text-slate-400">{relativeDay(row.signupDay, today)}</span>
                  </span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {row.language && <Pill>{row.language.toUpperCase()}</Pill>}
                    <Pill tone="blue">{row.sourceLabel}</Pill>
                    {row.hasPlan ? <Pill tone="green">{row.plan.goal}</Pill> : <Pill tone="amber">Plan yok</Pill>}
                    {row.lastActive && <Pill>Aktif: {relativeDay(row.lastActive, today)}</Pill>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {pageCount > 1 && (
        <nav aria-label="Üye sayfaları" className="flex items-center justify-end gap-2">
          <button type="button" aria-label="Önceki sayfa" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 0} className="grid min-h-9 min-w-9 place-items-center rounded-lg border border-slate-800 text-slate-300 disabled:opacity-30"><ChevronLeft size={16} /></button>
          <span className="text-xs tabular-nums text-slate-400">{currentPage + 1} / {pageCount}</span>
          <button type="button" aria-label="Sonraki sayfa" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= pageCount - 1} className="grid min-h-9 min-w-9 place-items-center rounded-lg border border-slate-800 text-slate-300 disabled:opacity-30"><ChevronRight size={16} /></button>
        </nav>
      )}
    </div>
  );
}
