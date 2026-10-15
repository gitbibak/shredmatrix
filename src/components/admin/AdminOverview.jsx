import { ArrowRight, CheckCircle2, MessageSquare, Target, Users } from 'lucide-react';

const MEMBER_GOAL = 500;
const count = (value) => Number.isInteger(value) && value >= 0 ? value : null;
const display = (value) => value == null ? '—' : new Intl.NumberFormat('tr-TR').format(value);

function NavigateCard({ icon: Icon, eyebrow, value, detail, action, onClick, accent = 'orange' }) {
  const colors = accent === 'rose'
    ? 'border-rose-500/20 bg-rose-500/10 text-rose-300'
    : 'border-orange-500/20 bg-orange-500/10 text-orange-300';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition-colors hover:border-slate-600 hover:bg-slate-800/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400 sm:p-6"
    >
      <span className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl border ${colors}`}><Icon size={19} aria-hidden="true" /></span>
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{eyebrow}</span>
      <span className="mt-1 font-outfit text-3xl font-bold text-white">{value}</span>
      <span className="mt-2 min-h-10 text-sm leading-5 text-slate-400">{detail}</span>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-300 group-hover:text-orange-200">
        {action} <ArrowRight size={16} aria-hidden="true" />
      </span>
    </button>
  );
}

export default function AdminOverview({ stats, supportStats, retentionStats, loading = false, onNavigate }) {
  const totalUsers = loading ? null : count(stats?.totalUsers);
  const usersWithPlans = loading ? null : count(stats?.usersWithPlans);
  const openSupport = loading ? null : count(supportStats?.open);
  const withoutPlans = totalUsers != null && usersWithPlans != null && usersWithPlans <= totalUsers
    ? totalUsers - usersWithPlans
    : null;
  const progress = totalUsers == null ? 0 : Math.min(100, Math.round((totalUsers / MEMBER_GOAL) * 100));
  const remaining = totalUsers == null ? null : Math.max(0, MEMBER_GOAL - totalUsers);
  const registrations = loading ? null : count(retentionStats?.registrations);
  const activated = loading ? null : count(retentionStats?.activated);
  const activationRate = registrations != null && registrations > 0 && activated != null && activated <= registrations
    ? Math.round((activated / registrations) * 100)
    : null;

  return (
    <div className="space-y-6 font-inter">
      <section aria-labelledby="overview-title" className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/40 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Günlük çalışma alanı</p>
          <h2 id="overview-title" className="font-outfit text-2xl font-bold leading-tight text-white sm:text-3xl">Bugün neye odaklanmalı?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Önce açık destek taleplerini gözden geçirin, ardından planı olmayan üyeleri inceleyin. Üye hedefindeki ilerlemeyi aşağıdan takip edebilirsiniz.
          </p>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <section aria-labelledby="member-goal-title" className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex items-center gap-2 text-orange-300"><Target size={18} aria-hidden="true" /><span className="text-xs font-bold uppercase tracking-wider">Üye hedefi</span></div>
              <h3 id="member-goal-title" className="font-outfit text-lg font-bold text-white">500 üyeye doğru</h3>
              <p className="mt-1 text-sm text-slate-400">Yönetici hesapları hariç toplam üye</p>
            </div>
            <span className="shrink-0 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-sm font-bold text-orange-300">
              {totalUsers == null ? '—' : `%${progress}`}
            </span>
          </div>
          <div className="mt-7 flex items-end gap-2">
            <span className="font-outfit text-4xl font-extrabold text-white sm:text-5xl">{display(totalUsers)}</span>
            <span className="mb-1 text-base text-slate-400">/ {display(MEMBER_GOAL)} üye</span>
          </div>
          <div role="progressbar" aria-label="500 üye hedefine ilerleme" aria-valuemin={0} aria-valuemax={MEMBER_GOAL} aria-valuenow={totalUsers == null ? undefined : Math.min(totalUsers, MEMBER_GOAL)} aria-valuetext={totalUsers == null ? 'Veri henüz yüklenmedi' : `${totalUsers} / ${MEMBER_GOAL} üye`} className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-sm text-slate-400">
            {remaining == null ? 'Üye verisi henüz mevcut değil.' : remaining === 0 ? '500 üye hedefine ulaşıldı.' : `${display(remaining)} üye kaldı.`}
          </p>
        </section>

        <section aria-labelledby="activation-title" className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2 text-sky-300"><CheckCircle2 size={18} aria-hidden="true" /><span className="text-xs font-bold uppercase tracking-wider">İlk adım</span></div>
          <h3 id="activation-title" className="font-outfit text-lg font-bold text-white">Plan aktivasyonu</h3>
          <p className="mt-1 text-sm text-slate-400">Son 60 günde kaydolan üyeler</p>
          <p className="mt-7 font-outfit text-4xl font-extrabold text-white sm:text-5xl">{activationRate == null ? '—' : `%${activationRate}`}</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {registrations == null || activated == null
              ? 'Aktivasyon verisi henüz mevcut değil.'
              : registrations === 0
                ? 'Bu dönemde kayıtlı üye yok.'
                : `${display(registrations)} yeni üyeden ${display(activated)} kişi plan oluşturdu.`}
          </p>
          <button type="button" onClick={() => onNavigate?.('analytics')} className="mt-5 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-orange-300 hover:text-orange-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400">
            Analizleri aç <ArrowRight size={16} aria-hidden="true" />
          </button>
        </section>
      </div>

      <section aria-labelledby="priority-title">
        <div className="mb-4">
          <h3 id="priority-title" className="font-outfit text-lg font-bold text-white">Bugünün öncelikleri</h3>
          <p className="mt-1 text-sm text-slate-400">Sayılar güncel veriye dayanır; kartlar ilgili bölümü açar.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <NavigateCard
            icon={MessageSquare}
            eyebrow="Açık destek talebi"
            value={display(openSupport)}
            detail={openSupport == null ? 'Destek verisi henüz mevcut değil.' : openSupport === 0 ? 'Bekleyen açık destek talebi yok.' : 'Yanıt bekleyen talepleri gözden geçirin.'}
            action="Destek taleplerini aç"
            onClick={() => onNavigate?.('support')}
            accent="rose"
          />
          <NavigateCard
            icon={Users}
            eyebrow="Planı olmayan üye"
            value={display(withoutPlans)}
            detail={withoutPlans == null ? 'Üye ve plan verisi henüz mevcut değil.' : `${display(totalUsers)} toplam üyeden ${display(withoutPlans)} kişinin planı yok.`}
            action="Kullanıcıları aç"
            onClick={() => onNavigate?.('users')}
          />
        </div>
      </section>
    </div>
  );
}
