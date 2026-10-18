import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { LANGUAGE_LABELS } from '../../lib/adminMetrics';
import {
  BarList, Delta, Metric, Panel, Pill, SkeletonRows, formatDay, formatNumber, formatPercent, relativeDay,
} from './adminUi';

const WEEKDAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

function todayLabel(dayKey) {
  if (!dayKey) return '';
  const weekday = WEEKDAYS[new Date(`${dayKey}T12:00:00Z`).getUTCDay()];
  return `${formatDay(dayKey)} ${weekday}`;
}

/** Günlük raporun ilk paragrafı: tek bakışta durum. */
export function buildSummarySentence(metrics, openSupport) {
  const { yesterday, last7, previous7 } = metrics.windows;
  const parts = [];
  parts.push(yesterday.registrations === 0
    ? 'Dün yeni kayıt gelmedi.'
    : `Dün ${formatNumber(yesterday.registrations)} kayıt geldi; ${formatNumber(yesterday.withPlan)} kişi plan kurdu.`);
  const diff = last7.registrations - previous7.registrations;
  const trend = diff === 0 ? 'önceki 7 günle aynı' : `önceki 7 güne göre ${diff > 0 ? '+' : '−'}${formatNumber(Math.abs(diff))}`;
  parts.push(`Son 7 günde ${formatNumber(last7.registrations)} kayıt (${trend}) ve ${formatNumber(last7.active)} aktif üye var.`);
  if (openSupport != null) {
    parts.push(openSupport > 0 ? `${formatNumber(openSupport)} açık destek talebi bekliyor.` : 'Bekleyen destek talebi yok.');
  }
  return parts.join(' ');
}

function AttentionList({ items, onNavigate }) {
  if (items.length === 0) {
    return (
      <p className="flex items-center gap-2 py-2 text-sm text-slate-300">
        <CheckCircle2 size={16} className="text-emerald-400" aria-hidden="true" /> Şu an bekleyen bir iş yok.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-slate-800">
      {items.map((item) => {
        const content = (
          <>
            <span className={`grid h-8 min-w-8 place-items-center rounded-lg px-2 font-outfit text-sm font-bold tabular-nums ${item.tone === 'red' ? 'bg-rose-500/15 text-rose-300' : 'bg-amber-500/15 text-amber-200'}`}>
              {formatNumber(item.count)}
            </span>
            <span className="min-w-0 flex-1 text-sm text-slate-200">{item.label}</span>
            {item.target && <ArrowRight size={15} className="shrink-0 text-slate-500 group-hover:text-orange-300" aria-hidden="true" />}
          </>
        );
        return (
          <li key={item.label}>
            {item.target
              ? <button type="button" onClick={() => onNavigate(item.target, item.params)} className="group flex w-full items-center gap-3 py-2.5 text-left">{content}</button>
              : <div className="flex items-center gap-3 py-2.5">{content}</div>}
          </li>
        );
      })}
    </ul>
  );
}

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 text-slate-400">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="tabular-nums text-white"><span style={{ color: entry.color }}>●</span> {entry.name}: {entry.value}</p>
      ))}
    </div>
  );
}

export default function TodaySection({ metrics, users, supportStats, pendingTestimonials, loading, onNavigate, onOpenUser }) {
  if (!metrics) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {['Kayıt', 'Plan kuran', 'Aktif üye', 'Antrenman'].map((label) => <Metric key={label} label={label} loading />)}
        </div>
        {loading && <Panel><SkeletonRows rows={6} /></Panel>}
      </div>
    );
  }

  const { windows, totals, todaySoFar, today } = metrics;
  const { yesterday, last3, last7, previous7 } = windows;
  const openSupport = supportStats?.open ?? null;

  const attention = [
    openSupport > 0 && { label: 'Açık destek talebi', count: openSupport, tone: 'red', target: 'support' },
    pendingTestimonials > 0 && { label: 'Onay bekleyen kullanıcı yorumu', count: pendingTestimonials, target: 'content' },
    metrics.newWithoutPlan7 > 0 && { label: 'Son 7 günde plan kurmayan yeni üye', count: metrics.newWithoutPlan7, target: 'users', params: { plan: 'none', joined: '7' } },
    last7.signupErrors > 0 && { label: 'Kayıt hatası (son 7 gün)', count: last7.signupErrors, tone: 'red' },
    last7.loginErrors > 0 && { label: 'Giriş hatası (son 7 gün)', count: last7.loginErrors },
    last7.photoFailures > 0 && { label: 'Başarısız fotoğraf analizi (son 7 gün)', count: last7.photoFailures },
  ].filter(Boolean);

  const recent = (users || []).filter((row) => !row.isAdmin).slice(0, 8);
  const languageRows = metrics.languages7.map((row) => ({ ...row, value: row.registrations }));
  const sourceRows = metrics.sources7.map((row) => ({ ...row, value: row.registrations, detail: row.planRate == null ? null : `plan %${row.planRate}` }));

  return (
    <div className="space-y-4 sm:space-y-5">
      <section aria-labelledby="today-summary" className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-slate-900 to-orange-950/30 p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-orange-300">{todayLabel(today)} · İstanbul saati, tamamlanmış günler</p>
            <h2 id="today-summary" className="mt-2 font-outfit text-lg font-semibold leading-snug text-white sm:text-xl">
              {buildSummarySentence(metrics, openSupport)}
            </h2>
          </div>
          <div className="w-full shrink-0 lg:w-64">
            <div className="flex items-baseline justify-between text-xs text-slate-300">
              <span>Üye hedefi</span>
              <span className="tabular-nums"><span className="font-bold text-white">{formatNumber(totals.members)}</span> / {formatNumber(totals.goal)}</span>
            </div>
            <div role="progressbar" aria-label="Üye hedefine ilerleme" aria-valuemin={0} aria-valuemax={totals.goal} aria-valuenow={Math.min(totals.members, totals.goal)} className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${totals.goalProgress}%` }} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric
          label="Yeni kayıt · son 7 gün"
          value={formatNumber(last7.registrations)}
          delta={<Delta value={last7.registrations - previous7.registrations} label="önceki 7 gün" />}
          hint={`Dün ${formatNumber(yesterday.registrations)} · bugün şu ana kadar ${formatNumber(todaySoFar.registrations)}`}
        />
        <Metric
          label="Plan kuran · son 7 gün"
          value={formatPercent(last7.planRate)}
          hint={`${formatNumber(last7.withPlan)} / ${formatNumber(last7.registrations)} yeni üye`}
        />
        <Metric
          label="Aktif üye · son 7 gün"
          value={formatNumber(last7.active)}
          delta={<Delta value={last7.active - previous7.active} label="önceki 7 gün" />}
          hint={`Dün ${formatNumber(yesterday.active)} · 3 gün ${formatNumber(last3.active)} · eski üye ${formatNumber(last7.returning)}`}
        />
        <Metric
          label="Antrenman yapan · son 7 gün"
          value={formatNumber(last7.workoutUsers)}
          delta={<Delta value={last7.workoutUsers - previous7.workoutUsers} label="önceki 7 gün" />}
          hint={`${formatNumber(last7.workouts)} antrenman kaydı`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Yapılacaklar" description="Sayıya dokununca ilgili bölüm açılır.">
          <AttentionList items={attention} onNavigate={onNavigate} />
        </Panel>
        <Panel title="Son 30 gün" description="Günlük yeni kayıt (sol eksen) ve aktif üye (sağ eksen)" className="lg:col-span-2">
          <div className="h-52 sm:h-60">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={metrics.trend} margin={{ top: 4, right: -16, bottom: 0, left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={18} />
                <YAxis yAxisId="registrations" tick={{ fill: '#fb923c', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis yAxisId="active" orientation="right" tick={{ fill: '#7dd3fc', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<TrendTooltip />} cursor={{ fill: '#1e293b80' }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#cbd5e1' }} iconSize={8} />
                <Bar yAxisId="registrations" dataKey="registrations" name="Yeni kayıt" fill="#f97316" radius={[3, 3, 0, 0]} maxBarSize={14} />
                <Line yAxisId="active" dataKey="active" name="Aktif üye" stroke="#38bdf8" strokeWidth={2} dot={false} type="monotone" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Nereden geldiler" description="İlk kaynak · son 7 gün · plan kurma oranıyla">
          <BarList rows={sourceRows} emptyText="Son 7 günde kayıt yok." />
        </Panel>
        <Panel title="Arayüz dili" description="Son 7 gündeki kayıtlar (dil ülke değildir)">
          <BarList rows={languageRows} color="bg-sky-500/25" emptyText="Son 7 günde kayıt yok." />
        </Panel>
        <Panel title="Diğer sinyaller" description="Son 7 gün">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Fotoğraf analizi', last7.photos],
              ['Ortaklık tıklaması', last7.affiliateClicks],
              ['Kayıt hatası', last7.signupErrors],
              ['Giriş hatası', last7.loginErrors],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-950/60 p-3">
                <dt className="text-xs text-slate-400">{label}</dt>
                <dd className="mt-1 font-outfit text-xl font-bold tabular-nums text-white">{formatNumber(value)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11px] leading-4 text-slate-500">Olaylar yalnızca analitik izni veren ve giriş yapmış kullanıcılardan gelir; gerçek toplamdan düşüktür.</p>
        </Panel>
      </div>

      <Panel
        title="Son kayıtlar"
        action={<button type="button" onClick={() => onNavigate('users')} className="inline-flex items-center gap-1 text-xs font-semibold text-orange-300 hover:text-orange-200">Tüm üyeler <ArrowRight size={14} aria-hidden="true" /></button>}
      >
        {recent.length === 0
          ? <p className="py-3 text-sm text-slate-500">Henüz kayıt yok.</p>
          : (
            <ul className="divide-y divide-slate-800">
              {recent.map((row) => (
                <li key={row.id}>
                  <button type="button" onClick={() => onOpenUser(row.id)} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-left hover:bg-slate-800/30 sm:flex-nowrap">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">{row.name || 'İsimsiz'}</span>
                      <span className="block truncate text-xs text-slate-400">{row.email || '—'}</span>
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5">
                      {row.language && <Pill>{LANGUAGE_LABELS[row.language] || row.language}</Pill>}
                      <Pill tone="blue">{row.sourceLabel}</Pill>
                      {row.hasPlan ? <Pill tone="green">Plan var</Pill> : <Pill tone="amber">Plan yok</Pill>}
                    </span>
                    <span className="w-24 shrink-0 text-right text-xs text-slate-400">{relativeDay(row.signupDay, today)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
      </Panel>

      {(last7.signupErrors > 0 || last7.photoFailures > 0) && (
        <p className="flex items-start gap-2 text-xs leading-5 text-amber-200">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          Hata sayıları kullanıcı tarafında yakalanan başarısız denemelerdir; sunucu kesintisi anlamına gelmez.
        </p>
      )}
    </div>
  );
}
