import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Copy, Mail, Trash2, TriangleAlert, X } from 'lucide-react';
import { getMemberDetail } from '../../lib/adminService';
import { LANGUAGE_LABELS } from '../../lib/adminMetrics';
import { Pill, SkeletonRows, formatDay, formatNumber, relativeDay } from './adminUi';

const FOCUS_LABELS = { glutes_legs: 'Kalça ve bacak', core: 'Core', back_posture: 'Sırt ve postür', chest_arms: 'Göğüs ve kol', shoulders: 'Omuz' };
const EFFORT = { 1: 'Kolaydı', 2: 'Tam kararında', 3: 'Zordu' };
const ENERGY = { 1: 'Düşük', 2: 'Normal', 3: 'İyi' };
const TICKET_STATUS = { open: ['Açık', 'red'], reviewing: ['İnceleniyor', 'amber'], resolved: ['Çözüldü', 'green'] };

function formatDateTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const unit = (value, suffix) => (value == null || value === '' ? null : `${value}${suffix}`);
const list = (value) => (Array.isArray(value) ? value.filter((item) => item && item !== 'none').join(', ') : value) || null;

function Section({ title, children, aside }) {
  return (
    <section className="border-t border-slate-800 px-4 py-4 sm:px-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Fields({ items }) {
  const shown = items.filter(([, value]) => value != null && value !== '');
  if (!shown.length) return <p className="text-sm text-slate-500">Bilgi yok.</p>;
  return (
    <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5">
      {shown.map(([label, value, wide]) => (
        <div key={label} className={wide ? 'col-span-2' : 'min-w-0'}>
          <dt className="text-[11px] text-slate-500">{label}</dt>
          <dd className="break-words text-sm text-slate-100">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-950/70 px-3 py-2">
      <p className="truncate text-[11px] text-slate-500">{label}</p>
      <p className="truncate font-outfit text-sm font-bold text-white sm:text-base">{value ?? "—"}</p>
      {hint && <p className="truncate text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

function isQuickLog(log) {
  const sets = (log.exercises || []).flatMap((exercise) => exercise.sets || []);
  return sets.length > 0 && sets.every((set) => set.completed && !Number(set.weight));
}

function WorkoutLog({ log, today }) {
  const [open, setOpen] = useState(false);
  const exercises = log.exercises || [];
  const sets = exercises.flatMap((exercise) => exercise.sets || []);
  const done = sets.filter((set) => set.completed).length;
  const quick = isQuickLog(log);
  const loads = exercises
    .map((exercise) => ({ name: exercise.name, weight: Math.max(0, ...(exercise.sets || []).filter((set) => set.completed).map((set) => Number(set.weight) || 0)) }))
    .filter((item) => item.weight > 0);
  return (
    <li className="rounded-xl bg-slate-950/70">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex w-full items-start gap-3 px-3 py-2.5 text-left">
        <span className="w-14 shrink-0 text-xs text-slate-400">
          {formatDay(log.date)}
          <span className="block text-[11px] text-slate-500">{relativeDay(log.date, today)}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-white">{log.day_focus || 'Antrenman'}</span>
          <span className="mt-1 flex flex-wrap gap-1">
            <Pill tone={quick ? 'slate' : 'green'}>{quick ? 'Hızlı kayıt' : 'Antrenman modu'}</Pill>
            {!quick && <Pill>{done}/{sets.length} set</Pill>}
            {log.session_duration_minutes && <Pill>{log.session_duration_minutes} dk</Pill>}
            {log.perceived_exertion && <Pill>{EFFORT[log.perceived_exertion]}</Pill>}
            {log.pain_reported && <Pill tone="red"><TriangleAlert size={11} className="mr-0.5" aria-hidden="true" />Ağrı</Pill>}
          </span>
          {loads.length > 0 && <span className="mt-1 block truncate text-[11px] text-slate-400">{loads.slice(0, 3).map((item) => `${item.name} ${item.weight} kg`).join(' · ')}</span>}
        </span>
        <ChevronDown size={15} className={`mt-1 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <ul className="space-y-1 border-t border-slate-800 px-3 py-2 text-xs">
          {exercises.map((exercise, index) => (
            <li key={`${exercise.name}-${index}`} className="flex justify-between gap-3">
              <span className="min-w-0 truncate text-slate-300">{exercise.name}</span>
              <span className="shrink-0 tabular-nums text-slate-400">
                {quick
                  ? `${(exercise.sets || []).length} set`
                  : (exercise.sets || []).map((set) => (set.completed ? (Number(set.weight) ? `${set.weight}×${set.reps}` : `${set.reps || '✓'}`) : '–')).join('  ')}
              </span>
            </li>
          ))}
          {log.energy_after && <li className="pt-1 text-slate-500">Antrenman sonrası enerji: {ENERGY[log.energy_after]}</li>}
        </ul>
      )}
    </li>
  );
}

function average(values) {
  const numbers = values.map(Number).filter((value) => Number.isFinite(value));
  return numbers.length ? Math.round((numbers.reduce((sum, value) => sum + value, 0) / numbers.length) * 10) / 10 : null;
}

export default function MemberPanel({ row, today, position, onClose, onPrev, onNext, onRequestDelete, deleteDisabled }) {
  const [state, setState] = useState({ id: null, loading: true, data: null, error: '' });
  const [copied, setCopied] = useState('');
  const headingRef = useRef(null);

  useEffect(() => {
    let active = true;
    setState({ id: row.id, loading: true, data: null, error: '' });
    getMemberDetail(row.id)
      .then((data) => { if (active) setState({ id: row.id, loading: false, data, error: '' }); })
      .catch(() => { if (active) setState({ id: row.id, loading: false, data: null, error: 'Ayrıntılar alınamadı. Yeniden açmayı deneyin.' }); });
    headingRef.current?.focus();
    return () => { active = false; };
  }, [row.id]);

  const copy = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(''), 1500);
    } catch { /* clipboard blocked */ }
  };

  const plan = row.plan;
  const full = state.data?.plan || {};
  const activity = state.data?.activity;
  const water = activity?.water || [];
  const sleep = activity?.sleep || [];
  const weights = activity?.weights || [];
  const measurement = activity?.measurements?.[0];
  const macros = full.macros;

  return (
    <aside
      aria-labelledby="member-panel-title"
      className="fixed inset-0 z-[60] flex flex-col bg-slate-900 text-white shadow-2xl sm:left-auto sm:w-[440px] sm:border-l sm:border-slate-800"
    >
      <div className="flex items-center gap-2 border-b border-slate-800 px-3 py-2" style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))' }}>
        <button type="button" onClick={onClose} aria-label="Paneli kapat" className="grid min-h-10 min-w-10 place-items-center rounded-lg text-slate-300 hover:bg-slate-800"><X size={18} /></button>
        <span className="flex-1 text-center text-xs tabular-nums text-slate-500">{position ? `${position.index + 1} / ${position.total}` : ''}</span>
        <button type="button" onClick={onPrev} disabled={!onPrev} aria-label="Önceki üye" className="grid min-h-10 min-w-10 place-items-center rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-30"><ChevronLeft size={18} /></button>
        <button type="button" onClick={onNext} disabled={!onNext} aria-label="Sonraki üye" className="grid min-h-10 min-w-10 place-items-center rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-30"><ChevronRight size={18} /></button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
        <div className="px-4 py-4 sm:px-5">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-orange-500/30 to-amber-500/20 font-outfit text-lg font-bold text-orange-200">
              {(row.name || row.email || '?').trim().charAt(0).toLocaleUpperCase('tr-TR')}
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="member-panel-title" ref={headingRef} tabIndex={-1} className="truncate font-outfit text-lg font-bold outline-none">{row.name || 'İsimsiz'}</h2>
              <p className="truncate text-sm text-slate-400">{row.email || 'E-posta yok'}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {row.isAdmin && <Pill tone="orange">Admin</Pill>}
            {row.language && <Pill>{LANGUAGE_LABELS[row.language] || row.language}</Pill>}
            <Pill tone="blue">{row.sourceLabel}</Pill>
            {plan ? <Pill tone="green">{plan.goal} · {plan.experience}</Pill> : <Pill tone="amber">Plan yok</Pill>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {row.email && (
              <a href={`mailto:${row.email}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-700 px-3 text-xs font-semibold text-slate-200 hover:text-white">
                <Mail size={14} aria-hidden="true" /> E-posta yaz
              </a>
            )}
            {row.email && (
              <button type="button" onClick={() => copy('email', row.email)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-700 px-3 text-xs font-semibold text-slate-200 hover:text-white">
                <Copy size={14} aria-hidden="true" /> {copied === 'email' ? 'Kopyalandı' : 'E-postayı kopyala'}
              </button>
            )}
            <button type="button" onClick={() => copy('id', row.id)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-700 px-3 text-xs font-semibold text-slate-200 hover:text-white">
              <Copy size={14} aria-hidden="true" /> {copied === 'id' ? 'Kopyalandı' : 'ID'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 px-4 pb-4 sm:px-5">
          <Stat label="Kayıt" value={formatDay(row.signupDay)} hint={relativeDay(row.signupDay, today) !== formatDay(row.signupDay) ? relativeDay(row.signupDay, today) : row.signupDay?.slice(0, 4)} />
          <Stat label="Son aktif" value={row.lastActive ? relativeDay(row.lastActive, today) : 'Yok'} hint={`${formatNumber(row.activeDays)} gün / 60`} />
          <Stat label="Antrenman" value={row.workouts == null ? '—' : formatNumber(row.workouts)} hint={row.totalWorkouts != null ? `30 gün · toplam ${formatNumber(row.totalWorkouts)}` : '30 gün'} />
        </div>

        <Section title="Kişisel ve vücut">
          <Fields items={[
            ['Cinsiyet', plan?.gender !== 'Bilinmiyor' ? plan?.gender : null],
            ['Yaş', plan?.age],
            ['Boy', unit(plan?.height, ' cm')],
            ['Kilo (plan)', unit(plan?.weight, ' kg')],
            ['Hedef kilo', unit(plan?.targetWeight ?? full.userTargetWeight, ' kg')],
            ['Vücut yağı', unit(plan?.bodyFat, ' %')],
            ['Son tartı', row.lastWeight != null ? `${row.lastWeight} kg · ${formatDay(row.lastWeightDate)}` : null],
          ]} />
        </Section>

        <Section title="Plan">
          {plan ? (
            <Fields items={[
              ['Hedef', plan.goal],
              ['Seviye', plan.experience],
              ['Ortam', plan.environment],
              ['Faz', plan.phase != null ? `${plan.phase + 1}. faz` : null],
              ['Haftalık gün', plan.trainingDays ? `${plan.trainingDays} gün` : null],
              ['Günlük kalori', plan.calories ? `${formatNumber(plan.calories)} kcal` : null],
              ['Makrolar', macros ? `P ${macros.protein} g · K ${macros.carbs} g · Y ${macros.fat} g` : null, true],
              ['Öncelikli bölgeler', list((full.focusAreas || []).map((key) => FOCUS_LABELS[key] || key)), true],
              ['Plan dili', plan.language ? plan.language.toUpperCase() : null],
              ['Plan kuruldu', formatDateTime(row.planCreatedAt || state.data?.planCreatedAt)],
            ]} />
          ) : <p className="rounded-xl bg-amber-500/10 p-3 text-sm text-amber-200">Bu üye henüz plan oluşturmadı.</p>}
        </Section>

        <Section title="Antrenman geçmişi" aside={activity?.workouts?.length ? <span className="text-[11px] text-slate-500">son {activity.workouts.length}</span> : null}>
          {state.loading && <SkeletonRows rows={3} />}
          {!state.loading && state.error && <p className="text-sm text-rose-300">{state.error}</p>}
          {!state.loading && !state.error && !activity && <p className="text-sm text-slate-500">Antrenman kayıtları, yönetici veritabanı fonksiyonu kurulunca burada görünecek.</p>}
          {activity && (activity.workouts.length
            ? <ul className="space-y-1.5">{activity.workouts.map((log, index) => <WorkoutLog key={`${log.date}-${index}`} log={log} today={today} />)}</ul>
            : <p className="text-sm text-slate-500">Henüz kayıtlı antrenman yok.</p>)}
        </Section>

        {activity && (
          <Section title="Kilo, ölçüm, su ve uyku">
            <Fields items={[
              ['Kilo kayıtları', weights.length ? weights.slice(0, 4).map((entry) => `${formatDay(entry.date)}: ${entry.weight} kg${entry.body_fat ? ` (%${entry.body_fat})` : ''}`).join(' · ') : null, true],
              ['Son ölçüm', measurement ? `${formatDay(measurement.date)} · bel ${measurement.waist ?? '—'} · kalça ${measurement.hip ?? '—'} · göğüs ${measurement.chest ?? '—'} cm` : null, true],
              ['Su (14 gün)', water.length ? `${water.length} gün · ort. ${average(water.map((entry) => entry.glasses))} bardak` : 'Kayıt yok'],
              ['Uyku (14 gün)', sleep.length ? `${sleep.length} gün · ort. ${average(sleep.map((entry) => entry.hours))} saat` : 'Kayıt yok'],
            ]} />
          </Section>
        )}

        <Section title="Kaynak ve cihaz">
          <Fields items={[
            ['İlk kaynak', row.sourceLabel],
            ['Ortam (medium)', row.medium],
            ['Kampanya', row.campaign],
            ['İçerik', row.content],
            ['Arama terimi', row.term],
            ['Giriş sayfası', row.landing, true],
            ['İlk giriş sayfası', row.firstLanding && row.firstLanding !== row.landing ? row.firstLanding : null, true],
            ['Tarayıcı dili', row.browserLocale],
            ['Saat dilimi', row.timeZone],
            ['Davet kodu', row.referralCode],
            ['Davet eden kod', row.referredBy],
            ['Kayıt zamanı', formatDateTime(row.createdAt)],
            ['İlk giriş', formatDateTime(row.firstLoginAt)],
          ]} />
        </Section>

        <Section title="Destek talepleri">
          {state.loading ? <SkeletonRows rows={1} /> : state.data?.tickets?.length ? (
            <ul className="space-y-1.5">
              {state.data.tickets.map((ticket) => {
                const [label, tone] = TICKET_STATUS[ticket.status] || [ticket.status, 'slate'];
                return (
                  <li key={ticket.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-950/70 px-3 py-2 text-sm">
                    <span className="min-w-0 truncate text-slate-200">{ticket.subject || ticket.category}</span>
                    <span className="flex shrink-0 items-center gap-2 text-[11px] text-slate-500">{formatDay(String(ticket.created_at).slice(0, 10))}<Pill tone={tone}>{label}</Pill></span>
                  </li>
                );
              })}
            </ul>
          ) : <p className="text-sm text-slate-500">Destek talebi yok.</p>}
        </Section>

        <section className="border-t border-slate-800 px-4 py-4 sm:px-5">
          <button type="button" onClick={onRequestDelete} disabled={deleteDisabled} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-30">
            <Trash2 size={14} aria-hidden="true" /> Hesabı kalıcı sil
          </button>
          <p className="mt-2 text-[11px] text-slate-500">{deleteDisabled ? 'Yönetici hesapları buradan silinemez.' : 'Silme işlemi geri alınamaz; onay için SİL yazmanız istenir.'}</p>
        </section>
      </div>
    </aside>
  );
}
