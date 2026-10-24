import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Search, SlidersHorizontal } from 'lucide-react';
import { addUtcDays } from '../../lib/adminMetrics';
import { Pill, SkeletonRows, formatDay, formatNumber, relativeDay } from './adminUi';

const PAGE_SIZE = 50;

export const DEFAULT_USER_FILTERS = { q: '', view: 'all', lang: 'all', source: 'all', goal: 'all', joined: 'all', sort: 'signup', dir: 'desc' };

// Hızlı görünümler: en sık sorulan soruların her biri tek tık.
export const USER_VIEWS = [
  ['all', 'Tüm üyeler'],
  ['new7', 'Son 7 gün kayıt'],
  ['active7', 'Son 7 gün aktif'],
  ['training', 'Antrenman yapan'],
  ['noplan', 'Planı yok'],
  ['idle', '14+ gündür gelmeyen'],
  ['admins', 'Yöneticiler'],
];

function matchesView(row, view, today) {
  if (view === 'admins') return row.isAdmin;
  if (row.isAdmin) return false;
  switch (view) {
    case 'new7': return Boolean(row.signupDay) && row.signupDay >= addUtcDays(today, -7);
    case 'active7': return Boolean(row.lastActive) && row.lastActive >= addUtcDays(today, -7);
    case 'training': return (row.workouts || 0) > 0;
    case 'noplan': return !row.hasPlan;
    case 'idle': return row.signupDay < addUtcDays(today, -14) && (!row.lastActive || row.lastActive < addUtcDays(today, -14));
    default: return true;
  }
}

export function filterUserRows(rows, filters, today) {
  const query = filters.q.trim().toLocaleLowerCase('tr-TR');
  const joinedSince = filters.joined === 'all' ? null : addUtcDays(today, -Number(filters.joined));
  return rows.filter((row) => (
    matchesView(row, filters.view, today)
    && (!query || `${row.name} ${row.email} ${row.referralCode || ''}`.toLocaleLowerCase('tr-TR').includes(query))
    && (filters.lang === 'all' || row.language === filters.lang)
    && (filters.source === 'all' || (row.source || 'unknown') === filters.source)
    && (filters.goal === 'all' || (row.plan?.goal || 'none') === filters.goal)
    && (!joinedSince || (row.signupDay && row.signupDay >= joinedSince && row.signupDay < today))
  ));
}

export function viewCounts(rows, today) {
  return Object.fromEntries(USER_VIEWS.map(([view]) => [view, rows.filter((row) => matchesView(row, view, today)).length]));
}

const SORTS = {
  signup: (row) => row.createdAt || '',
  name: (row) => (row.name || row.email || '').toLocaleLowerCase('tr-TR'),
  lastActive: (row) => row.lastActive || '',
  activeDays: (row) => row.activeDays || 0,
  workouts: (row) => row.workouts ?? -1,
  lastWorkout: (row) => row.lastWorkout || '',
};

export function sortUserRows(rows, sort, dir) {
  const key = SORTS[sort] || SORTS.signup;
  const factor = dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const left = key(a);
    const right = key(b);
    if (left < right) return -1 * factor;
    if (left > right) return 1 * factor;
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });
}

function csvCell(value) {
  const text = value == null ? '' : String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(rows, today) {
  const columns = [
    ['Ad', (r) => r.name], ['E-posta', (r) => r.email], ['Kayıt günü', (r) => r.signupDay], ['Dil', (r) => r.language],
    ['Kaynak', (r) => r.sourceLabel], ['Ortam (medium)', (r) => r.medium], ['Kampanya', (r) => r.campaign], ['İçerik', (r) => r.content],
    ['Giriş sayfası', (r) => r.landing], ['Plan', (r) => (r.hasPlan ? 'Var' : 'Yok')], ['Hedef', (r) => r.plan?.goal],
    ['Seviye', (r) => r.plan?.experience], ['Antrenman ortamı', (r) => r.plan?.environment], ['Cinsiyet', (r) => r.plan?.gender],
    ['Yaş', (r) => r.plan?.age], ['Boy', (r) => r.plan?.height], ['Kilo', (r) => r.plan?.weight], ['Hedef kilo', (r) => r.plan?.targetWeight],
    ['Kalori', (r) => r.plan?.calories], ['Son aktif', (r) => r.lastActive], ['Aktif gün (60g)', (r) => r.activeDays],
    ['Antrenman (30g)', (r) => r.workouts], ['Toplam antrenman', (r) => r.totalWorkouts], ['Son antrenman', (r) => r.lastWorkout],
    ['Son tartı', (r) => r.lastWeight], ['Davet kodu', (r) => r.referralCode],
  ];
  const lines = rows.map((row) => columns.map(([, value]) => csvCell(value(row))).join(','));
  const blob = new Blob([`\uFEFF${[columns.map(([label]) => label).join(','), ...lines].join('\n')}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `fullbalance-uyeler-${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-[11px] font-medium text-slate-400">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-10 w-full rounded-lg border border-slate-800 bg-slate-950 px-2 text-sm text-white focus:border-orange-500/60 focus:outline-none">
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </label>
  );
}

function Kpi({ label, value, hint }) {
  return (
    <div className="min-w-[8.5rem] shrink-0 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2.5 @lg:min-w-0">
      <p className="truncate text-[11px] font-medium text-slate-400">{label}</p>
      <p className="font-outfit text-xl font-bold tabular-nums text-white">{value}</p>
      {hint && <p className="truncate text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

function SortHeader({ label, sortKey, filters, onSort, align = 'left' }) {
  const active = filters.sort === sortKey;
  const Icon = active && filters.dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th scope="col" aria-sort={active ? (filters.dir === 'asc' ? 'ascending' : 'descending') : 'none'} className={`px-3 py-2.5 font-medium ${align === 'right' ? 'text-right' : ''}`}>
      <button type="button" onClick={() => onSort(sortKey)} className={`inline-flex items-center gap-1 hover:text-white ${active ? 'text-orange-300' : ''}`}>
        {label}
        <Icon size={12} aria-hidden="true" className={active ? '' : 'opacity-0'} />
      </button>
    </th>
  );
}

// "bugün", "3 gün önce": only while the date alone is less telling.
function recent(dayKey, today) {
  const label = relativeDay(dayKey, today);
  return label === formatDay(dayKey) ? null : label;
}

function profileLine(row) {
  const plan = row.plan;
  if (!plan) return null;
  return [plan.gender !== 'Bilinmiyor' ? plan.gender : null, plan.age, plan.weight ? `${plan.weight} kg` : null].filter(Boolean).join(' · ') || null;
}

function workoutCell(row) {
  if (row.workouts == null) return <span className="text-slate-500" title="Veritabanı fonksiyonu kurulunca görünür">—</span>;
  return (
    <>
      <span className="font-semibold text-white">{formatNumber(row.workouts)}</span>
      {row.totalWorkouts > row.workouts && <span className="ml-1 text-xs text-slate-500">/ {formatNumber(row.totalWorkouts)}</span>}
    </>
  );
}

export default function UsersSection({ rows, loading, today, metrics, filters, onFiltersChange, onOpenUser, selectedId }) {
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const setFilter = (key, value) => { setPage(0); onFiltersChange({ ...filters, [key]: value }); };
  const onSort = (key) => {
    setPage(0);
    onFiltersChange({ ...filters, sort: key, dir: filters.sort === key && filters.dir === 'desc' ? 'asc' : 'desc' });
  };

  const counts = useMemo(() => (rows ? viewCounts(rows, today) : {}), [rows, today]);
  const filtered = useMemo(() => (rows ? sortUserRows(filterUserRows(rows, filters, today), filters.sort, filters.dir) : []), [rows, filters, today]);
  const orderedIds = useMemo(() => filtered.map(({ id }) => id), [filtered]);
  const options = useMemo(() => {
    const sources = new Map();
    const goals = new Set();
    (rows || []).filter((row) => !row.isAdmin).forEach((row) => {
      sources.set(row.source || 'unknown', row.sourceLabel);
      if (row.plan?.goal) goals.add(row.plan.goal);
    });
    return {
      sources: [['all', 'Tümü'], ...[...sources.entries()].sort((a, b) => a[1].localeCompare(b[1], 'tr'))],
      goals: [['all', 'Tümü'], ...[...goals].sort((a, b) => a.localeCompare(b, 'tr')).map((goal) => [goal, goal]), ['none', 'Planı yok']],
    };
  }, [rows]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const extraFilters = ['lang', 'source', 'goal', 'joined'].filter((key) => filters[key] !== DEFAULT_USER_FILTERS[key]).length;
  const active = filters.q || filters.view !== 'all' || extraFilters > 0;
  const open = (id) => onOpenUser(id, orderedIds);
  const w7 = metrics?.windows?.last7;

  return (
    <div className="@container space-y-4">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] @lg:mx-0 @lg:grid @lg:grid-cols-3 @lg:overflow-visible @lg:px-0 @4xl:grid-cols-6">
        <Kpi label="Toplam üye" value={formatNumber(metrics?.totals.members)} hint={metrics ? `Hedef ${metrics.totals.goal} · %${metrics.totals.goalProgress}` : null} />
        <Kpi label="Bugün kayıt" value={formatNumber(metrics?.todaySoFar.registrations)} hint="devam eden gün" />
        <Kpi label="7 gün kayıt" value={formatNumber(w7?.registrations)} hint={w7?.planRate != null ? `%${w7.planRate} plan kurdu` : null} />
        <Kpi label="7 gün aktif" value={formatNumber(w7?.active)} hint={w7 ? `${formatNumber(w7.returning)} geri dönen` : null} />
        <Kpi label="7 gün antrenman" value={rows && rows[0] && !rows[0].insightsAvailable ? '—' : formatNumber(w7?.workouts)} hint={w7 ? `${formatNumber(w7.workoutUsers)} üye` : null} />
        <Kpi label="Planı yok" value={formatNumber(metrics?.totals.withoutPlan)} hint="tüm üyeler" />
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3 sm:p-4">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              type="search" value={filters.q} onChange={(event) => setFilter('q', event.target.value)}
              aria-label="Kullanıcı ara" placeholder="İsim, e-posta veya davet kodu"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-orange-500/60 focus:outline-none"
            />
          </div>
          <button
            type="button" onClick={() => setShowFilters((value) => !value)} aria-expanded={showFilters}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 text-sm ${extraFilters ? 'border-orange-500/40 text-orange-200' : 'border-slate-800 text-slate-300'} hover:text-white`}
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            <span className="hidden sm:inline">Filtreler</span>
            {extraFilters > 0 && <span className="rounded-full bg-orange-500/20 px-1.5 text-xs">{extraFilters}</span>}
          </button>
        </div>

        <div role="group" aria-label="Hızlı görünümler" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {USER_VIEWS.map(([view, label]) => (
            <button
              key={view} type="button" aria-pressed={filters.view === view} onClick={() => setFilter('view', view)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                filters.view === view ? 'border-orange-400 bg-orange-500/15 text-orange-200' : 'border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {label} <span className="ml-0.5 tabular-nums opacity-70">{rows ? counts[view] : ''}</span>
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-3 sm:grid-cols-4">
            <Select label="Dil" value={filters.lang} onChange={(value) => setFilter('lang', value)} options={[['all', 'Tümü'], ['tr', 'Türkçe'], ['en', 'İngilizce'], ['es', 'İspanyolca']]} />
            <Select label="Kaynak" value={filters.source} onChange={(value) => setFilter('source', value)} options={options.sources} />
            <Select label="Hedef" value={filters.goal} onChange={(value) => setFilter('goal', value)} options={options.goals} />
            <Select label="Kayıt" value={filters.joined} onChange={(value) => setFilter('joined', value)} options={[['all', 'Tüm zamanlar'], ['7', 'Son 7 gün'], ['30', 'Son 30 gün']]} />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400" aria-live="polite">
        <p>{rows ? `${formatNumber(filtered.length)} kişi${active ? ' (filtreli)' : ''}` : 'Üyeler yükleniyor…'}</p>
        <div className="flex items-center gap-2">
          {active && <button type="button" onClick={() => { setPage(0); onFiltersChange({ ...DEFAULT_USER_FILTERS, sort: filters.sort, dir: filters.dir }); }} className="rounded-lg border border-slate-700 px-3 py-1.5 hover:text-white">Temizle</button>}
          <button type="button" disabled={!filtered.length} onClick={() => downloadCsv(filtered, today)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 hover:text-white disabled:opacity-40">
            <Download size={13} aria-hidden="true" /> CSV
          </button>
        </div>
      </div>

      {!rows && loading && <SkeletonRows rows={8} />}

      {rows && filtered.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center text-sm text-slate-400">
          {active ? 'Bu filtrelere uyan kimse yok.' : 'Henüz kullanıcı yok'}
        </div>
      )}

      {visible.length > 0 && (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-800 md:block">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-900 text-xs text-slate-400">
                <tr>
                  <SortHeader label="Üye" sortKey="name" filters={filters} onSort={onSort} />
                  <SortHeader label="Kayıt" sortKey="signup" filters={filters} onSort={onSort} />
                  <th scope="col" className="px-3 py-2.5 font-medium">Kaynak</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Plan</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Profil</th>
                  <SortHeader label="Son aktif" sortKey="lastActive" filters={filters} onSort={onSort} />
                  <SortHeader label="Aktif gün" sortKey="activeDays" filters={filters} onSort={onSort} align="right" />
                  <SortHeader label="Antrenman 30g" sortKey="workouts" filters={filters} onSort={onSort} align="right" />
                  <SortHeader label="Son antrenman" sortKey="lastWorkout" filters={filters} onSort={onSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                {visible.map((row) => (
                  <tr key={row.id} onClick={() => open(row.id)} aria-selected={selectedId === row.id} className={`cursor-pointer ${selectedId === row.id ? 'bg-orange-500/10' : 'hover:bg-slate-800/40'}`}>
                    <td className="max-w-[240px] px-3 py-2.5">
                      <button type="button" onClick={(event) => { event.stopPropagation(); open(row.id); }} aria-label={`${row.name || row.email || 'Üye'} detaylarını aç`} className="flex w-full items-center gap-1.5 truncate text-left font-medium text-white">
                        <span className="truncate">{row.name || 'İsimsiz'}</span>
                        {row.isAdmin && <Pill tone="orange">Admin</Pill>}
                      </button>
                      <span className="block truncate text-xs text-slate-400">{row.email || '—'}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs">
                      <span className="block text-slate-200">{formatDay(row.signupDay)}</span>
                      <span className="block text-slate-500">{[recent(row.signupDay, today), row.language ? row.language.toUpperCase() : null].filter(Boolean).join(' · ') || '—'}</span>
                    </td>
                    <td className="max-w-[160px] px-3 py-2.5 text-xs">
                      <span className="block truncate text-slate-200">{row.sourceLabel}</span>
                      {(row.campaign || row.landing) && <span className="block truncate text-slate-500" title={row.campaign || row.landing}>{row.campaign || row.landing}</span>}
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      {row.hasPlan ? (
                        <>
                          <Pill tone="green">{row.plan.goal}</Pill>
                          <span className="mt-0.5 block text-slate-500">{row.plan.experience}</span>
                        </>
                      ) : <Pill tone="amber">Yok</Pill>}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-300">{profileLine(row) || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-300">{row.lastActive ? relativeDay(row.lastActive, today) : '—'}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-200">{formatNumber(row.activeDays)}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">{workoutCell(row)}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-300">{row.lastWorkout ? relativeDay(row.lastWorkout, today) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 md:hidden">
            {visible.map((row) => (
              <li key={row.id}>
                <button type="button" onClick={() => open(row.id)} aria-label={`${row.name || row.email || 'Üye'} detaylarını aç`} className={`w-full rounded-xl border p-3 text-left ${selectedId === row.id ? 'border-orange-500/50 bg-orange-500/10' : 'border-slate-800 bg-slate-900/70'}`}>
                  <span className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-white">{row.name || 'İsimsiz'}</span>
                      <span className="block truncate text-xs text-slate-400">{row.email || '—'}</span>
                    </span>
                    <span className="shrink-0 text-right text-xs text-slate-400">
                      {formatDay(row.signupDay)}
                      {recent(row.signupDay, today) && <span className="block text-slate-500">{recent(row.signupDay, today)}</span>}
                    </span>
                  </span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {row.isAdmin && <Pill tone="orange">Admin</Pill>}
                    {row.language && <Pill>{row.language.toUpperCase()}</Pill>}
                    <Pill tone="blue">{row.sourceLabel}</Pill>
                    {row.hasPlan ? <Pill tone="green">{row.plan.goal}</Pill> : <Pill tone="amber">Plan yok</Pill>}
                    {profileLine(row) && <Pill>{profileLine(row)}</Pill>}
                    {row.lastActive && <Pill>Aktif: {relativeDay(row.lastActive, today)}</Pill>}
                    {row.workouts > 0 && <Pill tone="green">{row.workouts} antrenman</Pill>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {pageCount > 1 && (
        <nav aria-label="Üye sayfaları" className="flex items-center justify-end gap-2">
          <button type="button" aria-label="Önceki sayfa" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 0} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-slate-800 text-slate-300 disabled:opacity-30"><ChevronLeft size={16} /></button>
          <span className="text-xs tabular-nums text-slate-400">{currentPage + 1} / {pageCount}</span>
          <button type="button" aria-label="Sonraki sayfa" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= pageCount - 1} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-slate-800 text-slate-300 disabled:opacity-30"><ChevronRight size={16} /></button>
        </nav>
      )}
    </div>
  );
}
