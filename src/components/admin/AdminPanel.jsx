import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, ClipboardCheck, Home, MessageSquare, RefreshCw, Shield, TrendingUp, Users,
} from 'lucide-react';
import {
  deleteUser, getAdminSnapshot, getAdminTestimonials, getContentReviews, getSupportStats, getSupportTickets,
  updateContentReview, updateSupportTicket, updateTestimonialStatus, verifyAdminAccess,
} from '../../lib/adminService';
import { buildAdminMetrics, buildUserRows } from '../../lib/adminMetrics';
import AdminDialog from './AdminDialog';
import TodaySection from './TodaySection';
import UsersSection, { DEFAULT_USER_FILTERS, UserDetailDialog } from './UsersSection';
import GrowthSection from './GrowthSection';
import SupportSection from './SupportSection';
import ContentSection from './ContentSection';

const SECTIONS = [
  { id: 'today', label: 'Bugün', icon: Home, description: 'Günlük durum ve yapılacaklar' },
  { id: 'users', label: 'Kullanıcılar', icon: Users, description: 'Üyeleri ara, filtrele ve incele' },
  { id: 'growth', label: 'Büyüme', icon: TrendingUp, description: 'Kaynaklar, kullanım ve geri dönüş' },
  { id: 'support', label: 'Destek', icon: MessageSquare, description: 'Kullanıcı talepleri' },
  { id: 'content', label: 'İçerik', icon: ClipboardCheck, description: 'Yorum onayı ve uzman incelemeleri' },
];
// Eski bağlantılar (?tab=dashboard vb.) yeni bölümlere yönlenir.
const LEGACY_TABS = { dashboard: 'today', analytics: 'growth', activity: 'growth', quality: 'content' };
const FILTER_KEYS = Object.keys(DEFAULT_USER_FILTERS);

export default function AdminPanel({ user }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('tab');
  const activeTab = SECTIONS.some(({ id }) => id === requested) ? requested : LEGACY_TABS[requested] || 'today';
  const userFilters = useMemo(() => Object.fromEntries(FILTER_KEYS.map((key) => [key, searchParams.get(key) ?? DEFAULT_USER_FILTERS[key]])), [searchParams]);

  const [accessState, setAccessState] = useState('checking');
  const isAllowed = accessState === 'allowed';

  const [snapshot, setSnapshot] = useState(null);
  const [period, setPeriod] = useState(7);
  const [supportTickets, setSupportTickets] = useState([]);
  const [supportStats, setSupportStats] = useState(null);
  const [supportFilter, setSupportFilter] = useState('open');
  const [supportSearch, setSupportSearch] = useState('');
  const [supportNotes, setSupportNotes] = useState({});
  const [contentReviews, setContentReviews] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [qualityDrafts, setQualityDrafts] = useState({});
  const [loading, setLoading] = useState({ snapshot: true, support: true, quality: true });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [detailUserId, setDetailUserId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);

  const requests = useRef({ snapshot: 0, support: 0, quality: 0 });
  const writeLock = useRef(false);
  const dirtyReviews = useRef(new Set());
  const dirtyNotes = useRef(new Set());

  const setError = (key, message) => setErrors((current) => ({ ...current, [key]: message }));
  const setLoadingFor = (key, value) => setLoading((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    let active = true;
    if (!user) { setAccessState('denied'); return undefined; }
    setAccessState('checking');
    verifyAdminAccess().then((allowed) => { if (active) setAccessState(allowed ? 'allowed' : 'denied'); });
    return () => { active = false; };
  }, [user]);

  const loadSnapshot = useCallback(async () => {
    if (!isAllowed) return false;
    const id = ++requests.current.snapshot;
    setLoadingFor('snapshot', true);
    try {
      const data = await getAdminSnapshot();
      if (id !== requests.current.snapshot) return false;
      setSnapshot(data);
      setLastUpdated(new Date());
      setError('snapshot', '');
      return true;
    } catch {
      if (id === requests.current.snapshot) setError('snapshot', 'Özet verileri alınamadı. Görünen önceki veriler güncel olmayabilir.');
      return false;
    } finally {
      if (id === requests.current.snapshot) setLoadingFor('snapshot', false);
    }
  }, [isAllowed]);

  const loadSupport = useCallback(async () => {
    if (!isAllowed) return false;
    const id = ++requests.current.support;
    setLoadingFor('support', true);
    setSupportTickets([]);
    try {
      const [tickets, stats] = await Promise.all([getSupportTickets(supportFilter), getSupportStats({ strict: true })]);
      if (id !== requests.current.support) return false;
      setSupportTickets(tickets);
      setSupportStats(stats);
      setError('support', '');
      return true;
    } catch {
      if (id === requests.current.support) setError('support', 'Destek kayıtları alınamadı. Yeniden deneyin.');
      return false;
    } finally {
      if (id === requests.current.support) setLoadingFor('support', false);
    }
  }, [isAllowed, supportFilter]);

  const loadQuality = useCallback(async () => {
    if (!isAllowed) return false;
    const id = ++requests.current.quality;
    setLoadingFor('quality', true);
    try {
      const [reviews, stories] = await Promise.all([getContentReviews(), getAdminTestimonials('pending')]);
      if (id !== requests.current.quality) return false;
      setContentReviews(reviews);
      setTestimonials(stories);
      setQualityDrafts((previous) => Object.fromEntries(reviews.map((review) => [review.id, dirtyReviews.current.has(review.id) ? previous[review.id] || review : review])));
      setError('quality', '');
      return true;
    } catch {
      if (id === requests.current.quality) setError('quality', 'İçerik kayıtları alınamadı. Yazdığınız taslaklar korundu.');
      return false;
    } finally {
      if (id === requests.current.quality) setLoadingFor('quality', false);
    }
  }, [isAllowed]);

  useEffect(() => { loadSnapshot(); return () => { requests.current.snapshot++; }; }, [loadSnapshot]);
  useEffect(() => { loadSupport(); return () => { requests.current.support++; }; }, [loadSupport]);
  useEffect(() => { loadQuality(); return () => { requests.current.quality++; }; }, [loadQuality]);

  const hasDrafts = dirtyNotes.current.size > 0 || dirtyReviews.current.size > 0;
  useEffect(() => {
    if (!hasDrafts) return undefined;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasDrafts]);

  const metrics = useMemo(() => (snapshot ? buildAdminMetrics(snapshot, { period }) : null), [snapshot, period]);
  const userRows = useMemo(() => (snapshot ? buildUserRows(snapshot) : null), [snapshot]);
  const today = metrics?.today;

  const visibleTickets = useMemo(() => {
    const query = supportSearch.trim().toLocaleLowerCase('tr-TR');
    const priorityRank = { high: 0, normal: 1, low: 2 };
    return [...supportTickets]
      .filter((ticket) => !query || [ticket.subject, ticket.message, ticket.email, ticket.name]
        .some((value) => String(value || '').toLocaleLowerCase('tr-TR').includes(query)))
      .sort((a, b) => (priorityRank[a.priority] ?? 1) - (priorityRank[b.priority] ?? 1)
        || new Date(b.created_at) - new Date(a.created_at));
  }, [supportTickets, supportSearch]);

  if (accessState === 'checking') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-950 text-white">
        <p className="flex items-center gap-2 text-sm text-slate-400"><RefreshCw className="animate-spin text-orange-400" size={18} /> Yönetici yetkisi doğrulanıyor…</p>
      </div>
    );
  }
  if (!isAllowed) return <Navigate to="/dashboard" replace />;

  const writing = deleting || updatingId != null;
  const busy = writing || refreshing;
  const section = SECTIONS.find(({ id }) => id === activeTab);
  const adminName = user?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Yönetici';
  const errorMessage = Object.values(errors).filter(Boolean).join(' ');
  const badges = { support: supportStats?.open || 0, content: testimonials.length };

  const go = (tab, params = {}) => {
    setNotice('');
    setSearchParams(() => {
      const next = new URLSearchParams({ tab });
      Object.entries(params).forEach(([key, value]) => next.set(key, value));
      return next;
    });
    window.scrollTo?.({ top: 0 });
  };

  const setUserFilters = (filters) => setSearchParams(() => {
    const next = new URLSearchParams({ tab: 'users' });
    FILTER_KEYS.forEach((key) => { if (filters[key] !== DEFAULT_USER_FILTERS[key]) next.set(key, filters[key]); });
    return next;
  }, { replace: true });

  const handleRefresh = async () => {
    if (refreshing || writeLock.current) return;
    setRefreshing(true);
    setNotice('');
    const results = await Promise.all([loadSnapshot(), loadSupport(), loadQuality()]);
    if (results.every(Boolean)) setNotice('Tüm bölümler yenilendi. Kaydedilmemiş taslaklar korundu.');
    setRefreshing(false);
  };

  const withWriteLock = async (id, action) => {
    if (writeLock.current) return;
    writeLock.current = true;
    setUpdatingId(id);
    try {
      await action();
      setError('action', '');
    } catch (err) {
      setError('action', err?.message && !/fetch|network/i.test(err.message) ? err.message : 'İşlem tamamlanamadı. Son durumu yenileyerek kontrol edin.');
    } finally {
      writeLock.current = false;
      setUpdatingId(null);
    }
  };

  const updateTicket = (ticket, updates, message) => withWriteLock(ticket.id, async () => {
    const updated = await updateSupportTicket(ticket.id, updates);
    setSupportTickets((tickets) => tickets
      .map((item) => (item.id === ticket.id ? updated : item))
      .filter((item) => item.id !== ticket.id || supportFilter === 'all' || !updates.status || updates.status === supportFilter));
    setSupportNotes((notes) => ({ ...notes, [ticket.id]: updated.admin_note || '' }));
    dirtyNotes.current.delete(ticket.id);
    setNotice(message);
    setSupportStats(await getSupportStats({ strict: true }));
  });

  const noteFor = (ticket) => (supportNotes[ticket.id] ?? ticket.admin_note ?? '').trim();

  const handleResolve = (ticket) => {
    if (!noteFor(ticket)) {
      setError('action', 'Kaydı çözmeden önce kullanıcıya kısa bir yanıt yazın.');
      return;
    }
    updateTicket(ticket, { status: 'resolved', admin_note: noteFor(ticket) }, 'Yanıt kaydedildi; destek kaydı çözüldü.');
  };

  const handleReviewSave = (reviewId, reviewStatus) => withWriteLock(reviewId, async () => {
    const updated = await updateContentReview(reviewId, { ...qualityDrafts[reviewId], review_status: reviewStatus });
    setContentReviews((items) => items.map((item) => (item.id === reviewId ? updated : item)));
    dirtyReviews.current.delete(reviewId);
    setQualityDrafts((drafts) => ({ ...drafts, [reviewId]: updated }));
    setNotice('İçerik incelemesi kaydedildi.');
  });

  const handleTestimonialStatus = (id, status) => withWriteLock(id, async () => {
    await updateTestimonialStatus(id, status);
    setTestimonials((items) => items.filter((item) => item.id !== id));
    setNotice('Kullanıcı yorumunun durumu güncellendi.');
  });

  const handleDeleteUser = async () => {
    if (!deleteTarget || deleteConfirmation !== 'SİL' || writeLock.current) return;
    writeLock.current = true;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      setDeleteConfirmation('');
      setError('action', '');
      setNotice('Kullanıcı hesabı silindi.');
      await loadSnapshot();
    } catch {
      setError('action', 'Hesap silinemedi. Veriler yenilenerek yeniden kontrol edilmeli.');
    } finally {
      writeLock.current = false;
      setDeleting(false);
    }
  };

  const detailRow = detailUserId ? userRows?.find((row) => row.id === detailUserId) : null;

  return (
    <div className="admin-panel min-h-dvh bg-slate-950 text-white lg:flex">
      <style>{'.admin-panel :is(button,a,input,textarea,select):focus-visible { outline: 2px solid #fb923c; outline-offset: 2px; } .admin-panel button { touch-action: manipulation; }'}</style>
      <a href="#admin-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-lg focus:bg-orange-500 focus:p-3 focus:text-black">İçeriğe geç</a>

      <aside className="lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-slate-800 lg:bg-slate-900">
        <div className="hidden items-center gap-2.5 border-b border-slate-800 p-5 lg:flex">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500"><Shield size={17} aria-hidden="true" /></span>
          <span>
            <span className="block font-outfit text-sm font-bold">Full Balance</span>
            <span className="block text-xs text-slate-400">Yönetim</span>
          </span>
        </div>
        <nav aria-label="Yönetim bölümleri" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-800 bg-slate-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:static lg:flex lg:flex-1 lg:flex-col lg:gap-1 lg:border-0 lg:bg-transparent lg:p-3 lg:pb-3">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id} type="button" aria-current={activeTab === id ? 'page' : undefined} onClick={() => go(id)}
              className={`relative flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors lg:flex-row lg:gap-3 lg:rounded-xl lg:px-3 lg:py-2.5 lg:text-sm ${
                activeTab === id ? 'text-orange-300 lg:bg-orange-500/10' : 'text-slate-400 hover:text-white lg:hover:bg-slate-800/50'
              }`}
            >
              <Icon size={19} aria-hidden="true" />
              <span className="lg:flex-1 lg:text-left">{label}</span>
              {badges[id] > 0 && (
                <span className="absolute right-[calc(50%-1.4rem)] top-1 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-4 text-white lg:static lg:bg-rose-500/15 lg:px-1.5 lg:text-xs lg:text-rose-300" aria-label={`${badges[id]} bekleyen`}>
                  {badges[id]}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="hidden border-t border-slate-800 p-4 lg:block">
          <p className="truncate text-xs text-slate-300">{adminName}</p>
          <button type="button" onClick={() => navigate('/dashboard')} className="mt-2 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm text-slate-400 hover:bg-slate-800/50 hover:text-white">
            <ArrowLeft size={16} aria-hidden="true" /> Uygulamaya dön
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 pb-24 lg:pb-0 lg:pl-60">
        {/* #root'taki overflow-x:hidden "sticky"yi bozduğu için başlık fixed; altındaki boşluk yerini tutar. */}
        <header className="fixed inset-x-0 top-0 z-30 h-16 border-b border-slate-800/70 bg-slate-950/90 backdrop-blur-xl lg:left-60">
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 lg:px-8">
            <div className="flex min-w-0 items-center gap-2">
              <button type="button" onClick={() => navigate('/dashboard')} aria-label="Uygulamaya dön" className="grid min-h-9 min-w-9 place-items-center rounded-lg text-slate-400 hover:text-white lg:hidden"><ArrowLeft size={18} /></button>
              <div className="min-w-0">
                <h1 className="truncate font-outfit text-lg font-bold">{section.label}</h1>
                <p className="hidden truncate text-xs text-slate-400 sm:block">{section.description}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {lastUpdated && <span className="hidden text-xs text-slate-500 sm:block">Güncellendi {lastUpdated.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })}</span>}
              <button type="button" onClick={handleRefresh} disabled={busy} className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-white disabled:opacity-50">
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} aria-hidden="true" />
                {refreshing ? 'Yenileniyor…' : 'Yenile'}
              </button>
            </div>
          </div>
        </header>
        <div className="h-16" aria-hidden="true" />

        <main id="admin-content" tabIndex={-1} className="mx-auto max-w-7xl p-4 lg:p-8">
          {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-200">{notice}</div>}
          {hasDrafts && <p className="mb-4 text-xs text-amber-200">Kaydedilmemiş taslaklarınız var. Bölümler arasında geçebilir veya yenileyebilirsiniz; sayfadan ayrılmadan önce kaydedin.</p>}
          {errorMessage && (
            <div role="alert" className="mb-4 flex flex-col gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2 text-sm text-rose-100"><AlertCircle className="mt-0.5 shrink-0" size={16} aria-hidden="true" />{errorMessage}</p>
              <button type="button" onClick={() => { setError('action', ''); handleRefresh(); }} disabled={busy} className="self-start rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-100 sm:self-auto">Tekrar dene</button>
            </div>
          )}

          {activeTab === 'today' && (
            <TodaySection
              metrics={metrics} users={userRows} supportStats={supportStats} pendingTestimonials={testimonials.length}
              loading={loading.snapshot} onNavigate={go} onOpenUser={setDetailUserId}
            />
          )}
          {activeTab === 'users' && (
            <UsersSection rows={userRows} loading={loading.snapshot} today={today} filters={userFilters} onFiltersChange={setUserFilters} onOpenUser={setDetailUserId} />
          )}
          {activeTab === 'growth' && (
            <GrowthSection metrics={metrics} period={period} onPeriodChange={setPeriod} loading={loading.snapshot} />
          )}
          {activeTab === 'support' && (
            <SupportSection
              stats={supportStats} tickets={visibleTickets} filter={supportFilter} onFilterChange={setSupportFilter}
              search={supportSearch} onSearchChange={setSupportSearch} notes={supportNotes}
              onNoteChange={(id, value) => { dirtyNotes.current.add(id); setSupportNotes((notes) => ({ ...notes, [id]: value })); }}
              onStatusChange={(ticket, status) => updateTicket(ticket, { status }, 'Destek kaydı güncellendi.')}
              onSaveNote={(ticket) => updateTicket(ticket, { admin_note: noteFor(ticket) || null }, 'Yanıt kaydedildi.')}
              onResolve={handleResolve} busy={busy} loading={loading.support} error={errors.support}
            />
          )}
          {activeTab === 'content' && (
            <ContentSection
              testimonials={testimonials} reviews={contentReviews} drafts={qualityDrafts}
              onDraftChange={(id, field, value) => { dirtyReviews.current.add(id); setQualityDrafts((items) => ({ ...items, [id]: { ...(items[id] || {}), [field]: value } })); }}
              onReviewSave={handleReviewSave} onTestimonialStatus={handleTestimonialStatus}
              busy={busy} loading={loading.quality} error={errors.quality}
            />
          )}
        </main>
      </div>

      {detailRow && (
        <UserDetailDialog
          row={detailRow} today={today} onClose={() => setDetailUserId(null)}
          deleteDisabled={busy || detailRow.isAdmin || detailRow.id === user?.id}
          onRequestDelete={() => { setDetailUserId(null); setDeleteConfirmation(''); setDeleteTarget(detailRow); }}
        />
      )}

      {deleteTarget && (
        <AdminDialog title="Hesabı kalıcı olarak sil" busy={deleting} onClose={() => setDeleteTarget(null)}>
          <p className="text-sm leading-6 text-slate-300"><strong className="text-white">{deleteTarget.name || deleteTarget.email}</strong> hesabı ve uygulama verileri kalıcı olarak silinecek. Bu işlem geri alınamaz.</p>
          <label className="mt-5 block text-sm" htmlFor="admin-delete-confirm">Onaylamak için SİL yazın</label>
          <input id="admin-delete-confirm" value={deleteConfirmation} disabled={deleting} onChange={(event) => setDeleteConfirmation(event.target.value)} autoComplete="off" className="mt-2 w-full rounded-xl border border-rose-500/40 bg-slate-950 p-3" />
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" disabled={deleting} onClick={() => setDeleteTarget(null)} className="rounded-xl bg-slate-800 px-4 py-3">Vazgeç</button>
            <button type="button" disabled={writing || deleteConfirmation !== 'SİL'} onClick={handleDeleteUser} className="rounded-xl bg-rose-600 px-4 py-3 font-bold disabled:opacity-40">{deleting ? 'Siliniyor…' : 'Kalıcı olarak sil'}</button>
          </div>
        </AdminDialog>
      )}
    </div>
  );
}
