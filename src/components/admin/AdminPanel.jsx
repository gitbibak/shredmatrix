import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Users, PieChart, Activity, Search,
  TrendingUp, UserPlus, Calendar, Target, ChevronLeft, ChevronRight,
  Trash2, Eye, X, Shield, RefreshCw, Menu, ArrowLeft, Clock, Zap,
  Dumbbell, Droplets, Scale, Ruler, MessageSquare, Mail, CheckCircle2, AlertCircle,
  ClipboardCheck, Star
} from 'lucide-react';
import AdminDialog from './AdminDialog';
import AdminOverview from './AdminOverview';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart as RechartPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  verifyAdminAccess, getAdminStats, getAdminUsers, getPlanDistribution,
  getRegistrationTrend, getUserPlanDetails, deleteUser, getRecentUsers,
  getActivityStats, getWorkoutTrend, getSupportTickets, getSupportStats,
  updateSupportTicket, getRetentionStats, getContentReviews, updateContentReview,
  getAdminTestimonials, getActivationFunnelStats, updateTestimonialStatus
} from '../../lib/adminService';

// ── Colors ───────────────────────────────────────
const COLORS = ['#ff6d00', '#00b0ff', '#00e676', '#ff4081', '#7c4dff', '#ffab00', '#00bfa5', '#ff1744'];
const GOAL_COLORS = {
  'Kas Gelişimi': '#ff6d00', 'Yağ Yakımı': '#00b0ff', 'Yoga': '#00e676',
  'Pilates': '#7c4dff', 'Meditasyon': '#ff4081', 'Reformer': '#ffab00',
};
const EXP_COLORS = { 'Başlangıç': '#00e676', 'Orta': '#ffab00', 'İleri': '#ff4081' };
const GENDER_COLORS = { 'Erkek': '#00b0ff', 'Kadın': '#ff4081', 'Bilinmiyor': '#64748b' };
const LANGUAGE_COLORS = { 'Türkçe': '#ff6d00', 'English': '#00b0ff', 'Español': '#ffab00', 'Bilinmiyor': '#64748b' };
const SUPPORT_CATEGORY_LABELS = {
  support: 'Destek',
  bug: 'Hata',
  idea: 'Öneri',
  account: 'Hesap',
  privacy: 'Gizlilik',
  partnership: 'İş Birliği',
};
const SUPPORT_STATUS_LABELS = {
  open: 'Açık',
  reviewing: 'İnceleniyor',
  resolved: 'Çözüldü',
};
const SUPPORT_STATUS_COLORS = {
  open: 'border-red-500/30 bg-red-500/10 text-red-300',
  reviewing: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  resolved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
};
const CONTENT_LABELS = { strength: 'Kuvvet', fat_loss: 'Yağ Yakımı', nutrition: 'Beslenme', yoga: 'Yoga', pilates: 'Pilates', reformer: 'Reformer', meditation: 'Meditasyon' };
const CONTENT_REVIEW_STATUS_LABELS = {
  pending: 'Henüz incelenmedi',
  in_review: 'İncelemede',
  changes_requested: 'Düzeltme istendi',
  approved: 'Doğrulanmış inceleme',
};

// ── Stat Card ────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = '#ff6d00', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden hover:border-slate-700 transition-colors"
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[60px] opacity-20" style={{ background: color }} />
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span className="text-xs text-slate-500 font-outfit uppercase tracking-wider leading-tight">{label}</span>
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold font-outfit text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1 font-inter">{sub}</p>}
    </motion.div>
  );
}

// ── Custom Tooltip ───────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400 font-inter">{label}</p>
      <p className="text-sm font-bold text-white font-outfit">{payload[0].value}</p>
    </div>
  );
}

// ── Mini Donut Chart ─────────────────────────────
function MiniDonut({ data, colorMap, title }) {
  if (!data || data.length === 0) return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-center h-80">
      <div className="text-center"><h3 className="mb-2 text-sm font-bold text-white">{title}</h3><p className="text-slate-400 text-sm">Henüz dağılım verisi yok.</p></div>
    </div>
  );
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h3 className="text-sm font-bold font-outfit text-white mb-2">{title}</h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <RechartPie>
            <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
              {data.map((entry, i) => (
                <Cell key={i} fill={colorMap?.[entry.name] || COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </RechartPie>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center">
        {data.map((entry, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colorMap?.[entry.name] || COLORS[i % COLORS.length] }} />
            <span className="text-xs text-slate-400 font-inter">{entry.name} ({entry.value} — %{total > 0 ? Math.round(entry.value / total * 100) : 0})</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── User Detail Modal ────────────────────────────
function UserDetailModal({ userId, onClose }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    getUserPlanDetails(userId, { strict: true }).then((value) => {
      if (active) { setPlan(value); setLoading(false); }
    }).catch(() => { if (active) { setError('Kullanıcı detayları alınamadı. Pencereyi kapatıp yeniden deneyin.'); setLoading(false); } });
    return () => { active = false; };
  }, [userId]);

  return (
    <AdminDialog title="Kullanıcı Detayları" onClose={onClose}>
        {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : loading ? (
          <div className="text-center py-8 text-slate-500">Yükleniyor...</div>
        ) : plan ? (
          <div className="space-y-2">
            {[
              ['İsim', plan.userName],
              ['Hedef', plan.goal],
              ['Yaş', plan.userAge],
              ['Cinsiyet', plan.userGender],
              ['Boy', plan.userHeight ? `${plan.userHeight} cm` : null],
              ['Kilo', plan.userWeight ? `${plan.userWeight} kg` : null],
              ['Hedef Kilo', plan.userTargetWeight ? `${plan.userTargetWeight} kg` : null],
              ['Vücut Yağı', plan.userBodyFat ? `%${plan.userBodyFat}` : null],
              ['Deneyim', plan.userExperience],
              ['Aktivite', plan.userActivityLevel],
              ['Program', plan.userWorkSchedule],
              ['Bütçe', plan.userBudget],
              ['Kalori', plan.dailyCalories ? `${plan.dailyCalories} kcal` : null],
              ['Protein', plan.macros?.protein ? `${plan.macros.protein}g` : null],
              ['Faz', plan.phase != null ? `Faz ${plan.phase}` : null],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-800/50">
                <span className="text-xs text-slate-500 font-inter">{label}</span>
                <span className="text-sm text-white font-outfit font-medium">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">Plan bulunamadı</div>
        )}
    </AdminDialog>
  );
}

// ── Time Ago Helper ──────────────────────────────
function safeSupportUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

function timeAgo(dateStr) {
  if (!dateStr) return '-';
  const now = new Date();
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'Tarih bilinmiyor';
  const diff = Math.max(0, Math.floor((now - d) / 1000));
  if (diff < 60) return 'Az önce';
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
  return d.toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' });
}

// ═════════════════════════════════════════════════
// Main Admin Panel
// ═════════════════════════════════════════════════
export default function AdminPanel({ user }) {
  const navigate = useNavigate();
  const [accessState, setAccessState] = useState('checking');
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const activeTab = ['dashboard', 'users', 'analytics', 'activity', 'support', 'quality'].includes(requestedTab) ? requestedTab : 'dashboard';
  const setActiveTab = (tab) => setSearchParams((current) => { const next = new URLSearchParams(current); next.set('tab', tab); return next; });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [distribution, setDistribution] = useState({
    goals: [], genders: [], ages: [], experiences: [], languages: [], sources: [], campaigns: [], contents: [],
    international: null,
  });
  const [trend, setTrend] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [detailUserId, setDetailUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activityStats, setActivityStats] = useState(null);
  const [retentionStats, setRetentionStats] = useState(null);
  const [activationFunnel, setActivationFunnel] = useState(null);
  const [workoutTrend, setWorkoutTrend] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [supportStats, setSupportStats] = useState(null);
  const [supportFilter, setSupportFilter] = useState('open');
  const [supportSearch, setSupportSearch] = useState('');
  const [updatingTicketId, setUpdatingTicketId] = useState(null);
  const [supportNotes, setSupportNotes] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState({ overview: true, users: true, support: true, quality: true });
  const [notice, setNotice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const requests = useRef({ overview: 0, users: 0, support: 0, quality: 0 });
  const writeLock = useRef(false);
  const dirtyReviews = useRef(new Set());
  const dirtyNotes = useRef(new Set());
  const setLoadError = (message) => setErrors((current) => ({ ...current, action: message }));
  const [lastUpdated, setLastUpdated] = useState(null);
  const [contentReviews, setContentReviews] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [qualityDrafts, setQualityDrafts] = useState({});
  const [qualityUpdatingId, setQualityUpdatingId] = useState(null);

  const PAGE_SIZE = 15;
  const isAllowed = accessState === 'allowed';

  useEffect(() => {
    let active = true;
    if (!user) {
      setAccessState('denied');
      return undefined;
    }
    setAccessState('checking');
    verifyAdminAccess().then((allowed) => {
      if (active) setAccessState(allowed ? 'allowed' : 'denied');
    });
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadData = useCallback(async () => {
    if (!isAllowed) return false;
    const id = ++requests.current.overview;
    setLoading((current) => ({ ...current, overview: true }));
    const tasks = [
      ['İstatistikler', getAdminStats, setStats],
      ['Dağılımlar', () => getPlanDistribution({ strict: true }), setDistribution],
      ['Kayıt eğilimi', () => getRegistrationTrend({ strict: true }), setTrend],
      ['Son kayıtlar', () => getRecentUsers({ strict: true }), setRecentUsers],
      ['Aktivite', getActivityStats, setActivityStats],
      ['Antrenman eğilimi', () => getWorkoutTrend({ strict: true }), setWorkoutTrend],
      ['Destek sayıları', () => getSupportStats({ strict: true }), setSupportStats],
      ['Geri dönüş', getRetentionStats, setRetentionStats],
      ['Aktivasyon', getActivationFunnelStats, setActivationFunnel],
    ];
    const results = await Promise.allSettled(tasks.map(async ([, read]) => {
      const value = await read();
      if (value == null) throw new Error('Veri alınamadı');
      return value;
    }));
    if (id !== requests.current.overview) return false;
    const failed = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') tasks[index][2](result.value);
      else failed.push(tasks[index][0]);
    });
    setErrors((current) => ({ ...current, overview: failed.length ? `${failed.join(', ')} alınamadı. Görünen önceki veriler güncel olmayabilir.` : '' }));
    setLoading((current) => ({ ...current, overview: false }));
    if (!failed.length) setLastUpdated(new Date());
    return !failed.length;
  }, [isAllowed]);

  const loadUsers = useCallback(async () => {
    if (!isAllowed) return false;
    const id = ++requests.current.users;
    setLoading((current) => ({ ...current, users: true }));
    try {
      const result = await getAdminUsers(usersPage, PAGE_SIZE, debouncedSearch);
      if (id !== requests.current.users) return false;
      if (result.error) throw result.error;
      const lastPage = Math.max(0, Math.ceil(result.total / PAGE_SIZE) - 1);
      if (usersPage > lastPage) { setUsersPage(lastPage); return false; }
      setUsers(result.users);
      setUsersTotal(result.total);
      setErrors((current) => ({ ...current, users: '' }));
      return true;
    } catch {
      if (id === requests.current.users) setErrors((current) => ({ ...current, users: 'Kullanıcı listesi alınamadı. Önceki sonuçlar gösteriliyor; yeniden deneyin.' }));
      return false;
    } finally {
      if (id === requests.current.users) setLoading((current) => ({ ...current, users: false }));
    }
  }, [isAllowed, usersPage, debouncedSearch]);

  const loadSupport = useCallback(async () => {
    if (!isAllowed) return false;
    const id = ++requests.current.support;
    setLoading((current) => ({ ...current, support: true }));
    setSupportTickets([]);
    try {
      const tickets = await getSupportTickets(supportFilter);
      if (id !== requests.current.support) return false;
      setSupportTickets(tickets);
      setErrors((current) => ({ ...current, support: '' }));
      return true;
    } catch {
      if (id === requests.current.support) setErrors((current) => ({ ...current, support: 'Destek kayıtları alınamadı. Yeniden deneyin.' }));
      return false;
    } finally {
      if (id === requests.current.support) setLoading((current) => ({ ...current, support: false }));
    }
  }, [isAllowed, supportFilter]);

  const loadQuality = useCallback(async () => {
    if (!isAllowed) return false;
    const id = ++requests.current.quality;
    setLoading((current) => ({ ...current, quality: true }));
    try {
      const [reviews, stories] = await Promise.all([getContentReviews(), getAdminTestimonials('pending')]);
      if (id !== requests.current.quality) return false;
      setContentReviews(reviews);
      setTestimonials(stories);
      setQualityDrafts((previous) => Object.fromEntries(reviews.map((review) => [review.id, dirtyReviews.current.has(review.id) ? previous[review.id] || review : review])));
      setErrors((current) => ({ ...current, quality: '' }));
      return true;
    } catch {
      if (id === requests.current.quality) setErrors((current) => ({ ...current, quality: 'Kalite kayıtları alınamadı. Yazdığınız taslaklar korundu.' }));
      return false;
    } finally {
      if (id === requests.current.quality) setLoading((current) => ({ ...current, quality: false }));
    }
  }, [isAllowed]);

  useEffect(() => { loadData(); return () => { requests.current.overview++; }; }, [loadData]);
  useEffect(() => { loadUsers(); return () => { requests.current.users++; }; }, [loadUsers]);
  useEffect(() => { loadSupport(); return () => { requests.current.support++; }; }, [loadSupport]);
  useEffect(() => { loadQuality(); return () => { requests.current.quality++; }; }, [loadQuality]);
  const hasDrafts = Object.values(supportNotes).length > 0 && dirtyNotes.current.size > 0 || dirtyReviews.current.size > 0;
  useEffect(() => {
    if (!hasDrafts) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasDrafts]);
  useEffect(() => {
    if (!sidebarOpen) return;
    const close = (event) => { if (event.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [sidebarOpen]);

  const visibleSupportTickets = useMemo(() => {
    const query = supportSearch.trim().toLocaleLowerCase('tr-TR');
    const priorityRank = { high: 0, normal: 1, low: 2 };
    return [...supportTickets]
      .filter((ticket) => !query || [ticket.subject, ticket.message, ticket.email, ticket.name]
        .some((value) => String(value || '').toLocaleLowerCase('tr-TR').includes(query)))
      .sort((a, b) => (priorityRank[a.priority] ?? 1) - (priorityRank[b.priority] ?? 1)
        || new Date(b.created_at) - new Date(a.created_at));
  }, [supportTickets, supportSearch]);

  const handleRefresh = async () => {
    if (refreshing || writeLock.current) return;
    setRefreshing(true);
    setNotice('');
    const results = await Promise.all([loadData(), loadUsers(), loadSupport(), loadQuality()]);
    if (results.every(Boolean)) setNotice('Tüm bölümler yenilendi. Kaydedilmemiş taslaklar korundu.');
    setRefreshing(false);
  };

  if (accessState === 'checking') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-3 animate-spin text-orange-400" size={24} />
          <p className="text-sm text-slate-400">Yönetici yetkisi doğrulanıyor...</p>
        </div>
      </div>
    );
  }
  if (!isAllowed) return <Navigate to="/dashboard" replace />;

  const handleDeleteUser = async () => {
    if (!deleteTarget || deleteConfirmation !== 'SİL' || writeLock.current) return;
    writeLock.current = true;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      setDeleteConfirmation('');
      setErrors((current) => ({ ...current, action: '' }));
      setNotice('Kullanıcı hesabı silindi.');
      await Promise.all([loadUsers(), loadData()]);
    } catch {
      setLoadError('Hesap silinemedi. Veriler yenilenerek yeniden kontrol edilmeli.');
    } finally { writeLock.current = false; setDeleting(false); }
  };

  const tabs = [
    { id: 'dashboard', icon: BarChart3, label: 'Genel Bakış' },
    { id: 'users', icon: Users, label: 'Kullanıcılar' },
    { id: 'analytics', icon: PieChart, label: 'Analizler' },
    { id: 'activity', icon: Activity, label: 'Aktivite' },
    { id: 'support', icon: MessageSquare, label: 'Destek' },
    { id: 'quality', icon: ClipboardCheck, label: 'Kalite' },
  ];

  const totalPages = Math.ceil(usersTotal / PAGE_SIZE);
  const loadError = Object.values(errors).filter(Boolean).join(' ');
  const writing = deleting || updatingTicketId != null || qualityUpdatingId != null;
  const adminName = user?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin';

  const handleTicketUpdate = async (ticketId, updates) => {
    if (writeLock.current) return;
    writeLock.current = true;
    setUpdatingTicketId(ticketId);
    try {
      const updated = await updateSupportTicket(ticketId, updates);
      setSupportTickets((tickets) => tickets.map((ticket) => ticket.id === ticketId ? updated : ticket));
      setSupportNotes((notes) => ({ ...notes, [ticketId]: updated.admin_note || '' }));
      setErrors((current) => ({ ...current, action: '' }));
      dirtyNotes.current.delete(ticketId);
      setNotice(updates.status === 'resolved' ? 'Yanıt kaydedildi; destek kaydı çözüldü.' : 'Destek kaydı güncellendi.');
      setSupportStats(await getSupportStats({ strict: true }));
      if (updates.status && supportFilter !== 'all' && updates.status !== supportFilter) {
        setSupportTickets((tickets) => tickets.filter((ticket) => ticket.id !== ticketId));
      }
    } catch (err) {
      setLoadError('Destek işlemi tamamlanamadı. Son durumu yenileyerek kontrol edin.');
    } finally {
      writeLock.current = false;
      setUpdatingTicketId(null);
    }
  };

  const handleResolveTicket = async (ticket) => {
    const adminNote = (supportNotes[ticket.id] ?? ticket.admin_note ?? '').trim();
    if (!adminNote) {
      setLoadError('Kaydı çözmeden önce kullanıcıya kısa bir yanıt yazın.');
      return;
    }
    await handleTicketUpdate(ticket.id, { status: 'resolved', admin_note: adminNote });
  };

  const handleReviewSave = async (reviewId, reviewStatus) => {
    if (writeLock.current) return;
    writeLock.current = true;
    setQualityUpdatingId(reviewId);
    try {
      const updated = await updateContentReview(reviewId, { ...qualityDrafts[reviewId], review_status: reviewStatus });
      setContentReviews((items) => items.map((item) => item.id === reviewId ? updated : item));
      setErrors((current) => ({ ...current, action: '' }));
      dirtyReviews.current.delete(reviewId);
      setNotice('İçerik incelemesi kaydedildi.');
      setQualityDrafts((drafts) => ({ ...drafts, [reviewId]: updated }));
    } catch (err) {
      setLoadError(err.message || 'İnceleme kaydedilemedi.');
    } finally {
      writeLock.current = false;
      setQualityUpdatingId(null);
    }
  };

  const handleTestimonialStatus = async (id, status) => {
    if (writeLock.current) return;
    writeLock.current = true;
    setQualityUpdatingId(id);
    try {
      await updateTestimonialStatus(id, status);
      setErrors((current) => ({ ...current, action: '' }));
      setNotice('Kullanıcı deneyiminin durumu güncellendi.');
      setTestimonials((items) => items.filter((item) => item.id !== id));
    } catch (err) {
      setLoadError(err.message || 'Yorum güncellenemedi.');
    } finally {
      writeLock.current = false;
      setQualityUpdatingId(null);
    }
  };

  return (
    <div className="admin-panel min-h-screen bg-slate-950 text-white flex">
      <style>{`.admin-panel :is(button,a,input,textarea):focus-visible { outline: 2px solid #fb923c; outline-offset: 3px; } .admin-panel .text-slate-500 { color: #94a3b8; } .admin-panel .text-slate-600 { color: #94a3b8; } .admin-panel button { touch-action: manipulation; min-height: 40px; }`}</style>
      <a href="#admin-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:rounded-lg focus:bg-orange-500 focus:p-3 focus:text-black">İçeriğe geç</a>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside id="admin-navigation" className={`fixed lg:sticky lg:top-0 h-dvh shrink-0 inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col
        transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-slate-800 relative">
          <button type="button" aria-label="Yönetim menüsünü kapat" onClick={() => setSidebarOpen(false)} className="absolute right-2 top-3 grid min-h-11 min-w-11 place-items-center text-slate-300 lg:hidden"><X size={20} /></button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold font-outfit text-white">Admin Panel</h1>
              <p className="text-xs text-slate-500 font-inter">FullBalance</p>
            </div>
          </div>
        </div>

        <nav aria-label="Yönetim bölümleri" className="flex-1 py-4 px-3 space-y-1">
          {tabs.map(tab => (
            <button key={tab.id}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); setNotice(''); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-outfit transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
              }`}>
              <tab.icon size={18} />
              <span className="flex-1 text-left">{tab.label}</span>
              {tab.id === 'support' && supportStats?.open > 0 && (
                <span className="min-w-5 rounded-full bg-red-500/15 px-1.5 py-0.5 text-xs font-bold text-red-300">
                  {supportStats?.open}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Admin Info */}
        <div className="px-4 py-3 border-t border-slate-800">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white font-outfit">
              {adminName[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white font-outfit truncate">{adminName}</p>
              <p className="text-xs text-orange-400 font-inter">Admin</p>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all cursor-pointer font-outfit">
            <ArrowLeft size={16} />
            Uygulamaya Dön
          </button>
        </div>
      </aside>

      {/* Main */}
      <main id="admin-content" tabIndex={-1} className="flex-1 min-w-0 min-h-screen overflow-y-auto">
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 px-4 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button aria-label="Yönetim menüsünü aç" aria-expanded={sidebarOpen} aria-controls="admin-navigation" onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white cursor-pointer">
                <Menu size={20} />
              </button>
              <h2 className="text-lg font-bold font-outfit text-white">{tabs.find(t => t.id === activeTab)?.label}</h2>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && <span className="hidden sm:block text-xs text-slate-600">Son tam yenileme: {lastUpdated.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })}</span>}
              <button onClick={handleRefresh} disabled={refreshing || writing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white transition-all cursor-pointer font-inter disabled:opacity-50">
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Yenileniyor…' : 'Yenile'}
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-200">{notice}</div>}
          {hasDrafts && <p className="mb-4 text-xs text-amber-200">Kaydedilmemiş taslaklarınız var. Bölümler arasında geçebilir veya verileri yenileyebilirsiniz; sayfadan ayrılmadan önce kaydedin.</p>}
          {loading[activeTab === 'dashboard' || activeTab === 'analytics' || activeTab === 'activity' ? 'overview' : activeTab] && <p role="status" className="mb-4 flex items-center gap-2 text-sm text-slate-300"><RefreshCw size={16} className="animate-spin" /> Veriler yükleniyor…</p>}
          {loadError && (
            <div role="alert" className="mb-5 flex flex-col gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 text-sm text-red-200">
                <AlertCircle className="mt-0.5 shrink-0" size={16} />
                <span>{loadError}</span>
              </div>
              <button onClick={() => { setErrors((current) => ({ ...current, action: '' })); handleRefresh(); }} disabled={refreshing || writing} className="self-start rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-bold text-red-200 sm:self-auto">Tekrar dene</button>
            </div>
          )}
          <AnimatePresence mode="wait">

            {/* ═══ DASHBOARD ═══ */}
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <AdminOverview stats={stats} supportStats={supportStats} retentionStats={retentionStats} loading={loading.overview} onNavigate={setActiveTab} />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard icon={Users} label="Antrenman Yapan (7 gün)" value={activityStats?.activeUsers ?? '—'} sub="Tekil kullanıcı · bugün dahil" color="#ff6d00" delay={0} />
                  <StatCard icon={UserPlus} label="Bugün (İstanbul)" value={stats?.todayRegistrations ?? '—'} sub="Devam eden gün" color="#00b0ff" delay={0.05} />
                  <StatCard icon={Calendar} label="Son 7 Tam Gün" value={stats?.weekRegistrations ?? '—'} sub="Bugün hariç" color="#00e676" delay={0.1} />
                  <StatCard icon={TrendingUp} label="Son 30 Tam Gün" value={stats?.monthRegistrations ?? '—'} sub={stats ? `Önceki 30 gün: ${stats.previousMonthRegistrations} · fark ${stats.registrationDelta >= 0 ? '+' : ''}${stats.registrationDelta}` : ''} color="#ff4081" delay={0.15} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <StatCard icon={Calendar} label="D1 Geri Dönüş (UTC)" value={retentionStats?.d1Rate == null ? '—' : `%${retentionStats.d1Rate}`} sub={`${retentionStats?.d1Returned ?? 0}/${retentionStats?.d1Eligible ?? 0} ölçülebilen üye`} color="#38bdf8" delay={0.18} />
                  <StatCard icon={TrendingUp} label="D7 Geri Dönüş (UTC)" value={retentionStats?.d7Rate == null ? '—' : `%${retentionStats.d7Rate}`} sub={`${retentionStats?.d7Returned ?? 0}/${retentionStats?.d7Eligible ?? 0} ölçülebilen üye`} color="#a78bfa" delay={0.2} />
                  <StatCard icon={Users} label="Geri Dönüş Ölçümü" value={retentionStats ? `${retentionStats.measurementDays} tam gün` : '—'} sub={retentionStats?.trackingStartedAt ? `${retentionStats.trackingStartedAt} tarihinden beri` : 'Henüz ölçüm yok'} color="#34d399" delay={0.22} />
                </div>

                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
                  <div className="mb-4">
                    <h3 className="font-outfit text-sm font-bold text-white">Son 7 gün kullanım adımları</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Kullanıcı hiçbir kayıt yapmasa bile uygulamayı açtığında aktif sayılır. Adımlar bağımsız tekil kullanıcı sayılarıdır; sıralı bir dönüşüm oranı değildir.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                    {[
                      { icon: Users, label: 'Uygulamayı açtı', value: activationFunnel?.activeUsers, color: '#94a3b8' },
                      { icon: Calendar, label: 'Bugün ekranını gördü', value: activationFunnel?.todayViewed, color: '#38bdf8' },
                      { icon: Dumbbell, label: 'Antrenmana geçti', value: activationFunnel?.workoutPlanViewed, color: '#f97316' },
                      { icon: Eye, label: 'Antrenman gününü açtı', value: activationFunnel?.workoutDayOpened, color: '#a78bfa' },
                      { icon: CheckCircle2, label: 'Antrenmanı tamamladı', value: activationFunnel?.workoutCompleted, color: '#34d399' },
                    ].map((item, index) => {
                      const active = activationFunnel?.activeUsers || 0;
                      const value = item.value ?? '—';
                      return <StatCard key={item.label} icon={item.icon} label={item.label} value={value} sub={!activationFunnel ? 'Ölçüm bekleniyor' : index === 0 ? 'Tekil kullanıcı' : active > 0 ? `Aktiflerin %${Math.round((value / active) * 100)}` : 'Henüz veri yok'} color={item.color} delay={0.24 + index * 0.03} />;
                    })}
                  </div>
                </section>

                {/* Trend */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold font-outfit text-white mb-4">📈 Son 30 Gün — Kayıt Trendi (bugün dahil)</h3>
                  <div className="h-56 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend}>
                        <defs>
                          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff6d00" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ff6d00" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="count" stroke="#ff6d00" strokeWidth={2} fill="url(#trendGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Recent Users */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold font-outfit text-white mb-3 flex items-center gap-2">
                    <Clock size={14} className="text-orange-400" />
                    Son Kayıt Olanlar
                  </h3>
                  <div className="space-y-2">
                    {recentUsers.slice(0, 5).map(u => (
                      <div key={u.id} className="flex items-center justify-between py-2 border-b border-slate-800/30 last:border-0">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white font-outfit">
                            {(u.name || u.email || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs text-white font-outfit font-medium">{u.name || 'İsimsiz'}</p>
                            <p className="text-xs text-slate-500 font-inter">{u.email || '-'}</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 font-inter">{timeAgo(u.created_at)}</span>
                      </div>
                    ))}
                    {recentUsers.length === 0 && (
                      <p className="text-center text-slate-600 text-xs py-4">Henüz kayıt yok</p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ═══ USERS ═══ */}
            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" value={searchQuery}
                    aria-label="Kullanıcı ara" onChange={e => { setSearchQuery(e.target.value); setUsersPage(0); }}
                    placeholder="İsim veya email ile ara..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 font-inter transition-colors" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400" aria-live="polite">
                  <p>{loading.users || searchQuery !== debouncedSearch ? 'Aranıyor…' : `${usersTotal} kullanıcı${usersTotal ? ` · ${usersPage * PAGE_SIZE + 1}–${Math.min((usersPage + 1) * PAGE_SIZE, usersTotal)} arası gösteriliyor` : ''}`}</p>
                  {searchQuery && <button onClick={() => { setSearchQuery(''); setUsersPage(0); }} className="rounded-lg border border-slate-700 px-3 py-2">Aramayı temizle</button>}
                </div>
                {/* User Cards */}
                <div className="space-y-2">
                  {!loading.users && searchQuery === debouncedSearch && users.map(u => (
                    <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white font-outfit shrink-0">
                            {(u.name || u.email || '?')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white font-outfit font-medium truncate">{u.name || 'İsimsiz'}</p>
                            <p className="text-xs text-slate-500 font-inter truncate">{u.email || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <button aria-label={`${u.name || 'İsimsiz kullanıcı'} detaylarını aç`} onClick={() => setDetailUserId(u.id)}
                            className="min-h-11 min-w-11 grid place-items-center p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-blue-400 transition-colors cursor-pointer" title="Detay">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => { setDeleteTarget(u); setDeleteConfirmation(''); }}
                            disabled={writing || refreshing || u.id === user?.id || u.role === 'admin'}
                            className="min-h-11 min-w-11 grid place-items-center p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-20" title={u.id === user?.id || u.role === 'admin' ? 'Yönetici hesabı buradan silinemez' : 'Hesabı kalıcı sil'}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2.5 text-xs text-slate-500 font-inter flex-wrap">
                        <span>{u.created_at ? new Date(u.created_at).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' }) : '-'}</span>
                        <span>•</span>
                        {u.plan_created_at ? (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Plan Aktif</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">Plan Yok</span>
                        )}
                        {u.role === 'admin' && (
                          <>
                            <span>•</span>
                            <span className="px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400">Admin</span>
                          </>
                        )}
                        {u.app_language && <span className="uppercase">{u.app_language}</span>}
                        {u.acquisition_source && <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-300">{u.acquisition_source}</span>}
                        {u.acquisition_campaign && <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-violet-300">{u.acquisition_campaign}</span>}
                        {u.acquisition_content && <span className="max-w-full truncate rounded bg-cyan-500/10 px-1.5 py-0.5 text-cyan-300" title={u.acquisition_content}>{u.acquisition_content}</span>}
                      </div>
                    </motion.div>
                  ))}
                  {users.length === 0 && searchQuery === debouncedSearch && !loading.users && !errors.users && (
                    <div className="text-center py-16 text-slate-500 text-sm font-inter">
                      {searchQuery ? 'Sonuç bulunamadı' : 'Henüz kullanıcı yok'}
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-2 py-3">
                    <p className="text-xs text-slate-500 font-inter">{usersTotal} kullanıcı</p>
                    <div className="flex items-center gap-2">
                      <button aria-label="Önceki kullanıcı sayfası" onClick={() => setUsersPage(p => Math.max(0, p - 1))} disabled={loading.users || usersPage === 0}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer transition-colors">
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs text-slate-400 font-inter">{usersPage + 1} / {totalPages}</span>
                      <button aria-label="Sonraki kullanıcı sayfası" onClick={() => setUsersPage(p => Math.min(totalPages - 1, p + 1))} disabled={loading.users || usersPage >= totalPages - 1}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {detailUserId && <UserDetailModal userId={detailUserId} onClose={() => setDetailUserId(null)} />}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ═══ ANALYTICS ═══ */}
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard
                    icon={Users}
                    label="EN + ES Kayıt (30 gün)"
                    value={distribution.international?.registrations ?? '—'}
                    sub={distribution.international ? `EN ${distribution.international.english} · ES ${distribution.international.spanish}` : 'Veri bekleniyor'}
                    color="#00b0ff"
                  />
                  <StatCard
                    icon={Target}
                    label="Plan Oluşturan"
                    value={distribution.international?.activated ?? '—'}
                    sub="EN / ES arayüz dili"
                    color="#00e676"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="EN + ES Plan Oranı"
                    value={distribution.international ? `%${distribution.international.activationRate}` : '—'}
                    sub="Kayıttan kişisel plana"
                    color="#7c4dff"
                  />
                  <StatCard
                    icon={BarChart3}
                    label="Kaynağı Belirlenen"
                    value={distribution.international?.attributed ?? '—'}
                    sub={distribution.international ? `${distribution.international.direct} doğrudan geliş` : 'Veri bekleniyor'}
                    color="#ffab00"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MiniDonut data={distribution.goals} colorMap={GOAL_COLORS} title="🎯 Hedef Dağılımı" />
                  <MiniDonut data={distribution.genders} colorMap={GENDER_COLORS} title="👤 Cinsiyet Dağılımı" />
                  <MiniDonut data={distribution.experiences} colorMap={EXP_COLORS} title="💪 Deneyim Seviyesi" />
                  <MiniDonut data={distribution.languages} colorMap={LANGUAGE_COLORS} title="🌍 Kayıt Dili" />
                  <MiniDonut data={distribution.sources} title="📣 Kazanım Kaynağı" />
                  {distribution.campaigns?.length > 0 && <MiniDonut data={distribution.campaigns} title="Kampanyalar" />}
                  {distribution.contents?.length > 0 && <MiniDonut data={distribution.contents} title="Kayıt Geçişleri" />}

                  {/* Age Bar Chart */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <h3 className="text-sm font-bold font-outfit text-white mb-2">📊 Yaş Dağılımı</h3>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={distribution.ages}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {(distribution.ages || []).map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ═══ SUPPORT ═══ */}
            {activeTab === 'support' && (
              <motion.div key="support" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard icon={AlertCircle} label="Açık" value={supportStats?.open ?? '—'} color="#ff4081" delay={0} />
                  <StatCard icon={Clock} label="İnceleniyor" value={supportStats?.reviewing ?? '—'} color="#ffab00" delay={0.05} />
                  <StatCard icon={CheckCircle2} label="Çözüldü" value={supportStats?.resolved ?? '—'} color="#00e676" delay={0.1} />
                  <StatCard icon={MessageSquare} label="Toplam" value={supportStats?.total ?? '—'} color="#00b0ff" delay={0.15} />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {[
                    ['open', 'Açık'],
                    ['reviewing', 'İnceleniyor'],
                    ['resolved', 'Çözüldü'],
                    ['all', 'Tümü'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      aria-pressed={supportFilter === value} disabled={writing || refreshing} onClick={() => setSupportFilter(value)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition-colors ${
                        supportFilter === value
                          ? 'border-orange-500/50 bg-orange-500/15 text-orange-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="search"
                    value={supportSearch}
                    onChange={(event) => setSupportSearch(event.target.value)}
                    aria-label="Destek kaydı ara" placeholder="Konu, mesaj, isim veya e-posta ara..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-500/50"
                  />
                </div>

                <p className="text-xs text-slate-400">Seçilen durumdaki {supportTickets.length} kayıtta {visibleSupportTickets.length} sonuç. Öncelikli talepler önce gösterilir.</p>
                <div className="space-y-3">
                  {visibleSupportTickets.map((ticket) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-lg border text-xs font-bold ${SUPPORT_STATUS_COLORS[ticket.status] || SUPPORT_STATUS_COLORS.open}`}>
                              {SUPPORT_STATUS_LABELS[ticket.status] || ticket.status}
                            </span>
                            <span className="px-2 py-1 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-300 text-xs font-bold">
                              {SUPPORT_CATEGORY_LABELS[ticket.category] || ticket.category}
                            </span>
                            {ticket.priority === 'high' && (
                              <span className="px-2 py-1 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 text-xs font-bold">
                                Öncelikli
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold font-outfit text-white break-words">{ticket.subject}</h3>
                          <p className="text-xs text-slate-500 mt-1">{timeAgo(ticket.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {['open', 'reviewing'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleTicketUpdate(ticket.id, { status })}
                              disabled={writing || refreshing || ticket.status === status}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
                            >
                              {SUPPORT_STATUS_LABELS[status]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-slate-800/70 bg-slate-950/50 p-4">
                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">{ticket.message}</p>
                      </div>

                      <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                        <label htmlFor={`support-reply-${ticket.id}`} className="mb-2 block text-xs font-bold uppercase text-slate-500">
                          Kullanıcıya çözüm yanıtı
                        </label>
                        <textarea
                          id={`support-reply-${ticket.id}`} disabled={writing}
                          value={supportNotes[ticket.id] ?? ticket.admin_note ?? ''}
                          onChange={(event) => { dirtyNotes.current.add(ticket.id); setSupportNotes((notes) => ({ ...notes, [ticket.id]: event.target.value })); }}
                          rows={3}
                          maxLength={2000}
                          placeholder="Neyin düzeldiğini ve kullanıcının ne yapması gerektiğini kısa ve net yaz."
                          className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/50"
                        />
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            onClick={() => handleTicketUpdate(ticket.id, { admin_note: (supportNotes[ticket.id] ?? ticket.admin_note ?? '').trim() || null })}
                            disabled={writing || refreshing}
                            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:text-white disabled:opacity-40"
                          >
                            Yanıtı Kaydet
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveTicket(ticket)}
                            disabled={writing || refreshing || ticket.status === 'resolved'}
                            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500/15 disabled:opacity-40"
                          >
                            Yanıtı Gönder ve Çöz
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid sm:grid-cols-2 gap-2 text-xs text-slate-500">
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail size={14} className="text-slate-600 shrink-0" />
                          {ticket.email ? <a href={`mailto:${ticket.email}`} className="truncate hover:text-blue-300">{ticket.email}</a> : <span>E-posta yok</span>}
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <Users size={14} className="text-slate-600 shrink-0" />
                          <span className="truncate">{ticket.name || 'İsim yok'}</span>
                        </div>
                      </div>

                      {safeSupportUrl(ticket.page_url) && (
                        <a href={safeSupportUrl(ticket.page_url)} target="_blank" rel="noopener noreferrer" className="mt-2 block truncate text-xs text-slate-600 hover:text-blue-300">{ticket.page_url}</a>
                      )}
                    </motion.div>
                  ))}

                  {visibleSupportTickets.length === 0 && !loading.support && !errors.support && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
                      <MessageSquare size={28} className="mx-auto text-slate-600 mb-3" />
                      <p className="text-sm text-slate-500">{supportSearch ? 'Aramayla eşleşen destek kaydı yok.' : 'Bu filtrede destek kaydı yok.'}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══ QUALITY ═══ */}
            {activeTab === 'quality' && (
              <motion.div key="quality" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <div className="mb-5 flex items-start gap-3">
                    <ClipboardCheck className="mt-0.5 text-emerald-400" size={20} />
                    <div>
                      <h2 className="font-outfit text-lg font-bold">İçerik güvence kayıtları</h2>
                      <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">Bu alan bir uzman varmış gibi görünmek için değildir. Yalnızca gerçek ve nitelikli bir dış uzman içeriği fiilen incelediğinde adı, mesleki yeterliliği ve doğrulanabilir kanıtı kaydedilir. Bekleyen kayıtlar kullanıcıya onaylanmış olarak gösterilmez.</p>
                    </div>
                  </div>
                  {!loading.quality && !errors.quality && contentReviews.length === 0 && <p className="py-6 text-sm text-slate-400">İncelenecek içerik kaydı bulunmuyor.</p>}
                  <div className="grid gap-3 lg:grid-cols-2">
                    {contentReviews.map((review) => {
                      const draft = qualityDrafts[review.id] || review;
                      const setField = (field, value) => { dirtyReviews.current.add(review.id); setQualityDrafts((items) => ({ ...items, [review.id]: { ...items[review.id], [field]: value } })); };
                      return (
                        <article key={review.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                          <div className="mb-3 flex items-center justify-between gap-2"><h3 className="text-sm font-bold">{CONTENT_LABELS[review.content_area] || review.content_area}</h3><span className={`rounded-full px-2 py-1 text-xs font-bold ${review.review_status === 'approved' ? 'bg-emerald-500/10 text-emerald-300' : review.review_status === 'changes_requested' ? 'bg-red-500/10 text-red-300' : 'bg-amber-500/10 text-amber-300'}`}>{CONTENT_REVIEW_STATUS_LABELS[review.review_status] || review.review_status}</span></div>
                          <div className="space-y-2">
                            <input disabled={writing} value={draft.reviewer_name || ''} onChange={(event) => setField('reviewer_name', event.target.value)} aria-label={`Uzman adı: ${CONTENT_LABELS[review.content_area] || review.content_area}`} placeholder="Uzman adı" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs outline-none focus:border-emerald-500" />
                            <input disabled={writing} value={draft.reviewer_credential || ''} onChange={(event) => setField('reviewer_credential', event.target.value)} aria-label={`Uzmanlık veya sertifika: ${CONTENT_LABELS[review.content_area] || review.content_area}`} placeholder="Uzmanlık / sertifika" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs outline-none focus:border-emerald-500" />
                            <input disabled={writing} value={draft.evidence_url || ''} onChange={(event) => setField('evidence_url', event.target.value)} aria-label={`Doğrulama bağlantısı: ${CONTENT_LABELS[review.content_area] || review.content_area}`} placeholder="https:// doğrulama veya belge bağlantısı" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs outline-none focus:border-emerald-500" />
                            <textarea disabled={writing} value={draft.notes || ''} onChange={(event) => setField('notes', event.target.value)} aria-label={`İnceleme notu: ${CONTENT_LABELS[review.content_area] || review.content_area}`} placeholder="İnceleme notu" rows={2} className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs outline-none focus:border-emerald-500" />
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <button disabled={writing || refreshing} onClick={() => handleReviewSave(review.id, 'in_review')} className="min-h-9 rounded-lg border border-blue-500/30 text-xs font-bold text-blue-300">İncelemede</button>
                            <button disabled={writing || refreshing} onClick={() => handleReviewSave(review.id, 'changes_requested')} className="min-h-9 rounded-lg border border-red-500/30 text-xs font-bold text-red-300">Düzeltme</button>
                            <button disabled={writing || refreshing} onClick={() => handleReviewSave(review.id, 'approved')} className="min-h-9 rounded-lg bg-emerald-600 text-xs font-bold text-white">Doğrula</button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <div className="mb-5 flex items-start gap-3"><Star className="mt-0.5 text-amber-400" size={20} /><div><h2 className="font-outfit text-lg font-bold">Bekleyen kullanıcı deneyimleri</h2><p className="mt-1 text-xs text-slate-500">Yayın izni verilenler onaylanabilir; "Gizli" etiketli girişler yalnızca ekibe yazılmış geri bildirimdir ve yayınlanamaz.</p></div></div>
                  <div className="space-y-3">
                    {testimonials.map((story) => (
                      <article key={story.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                        <div className="flex items-center justify-between"><span className="text-sm text-amber-400">{'★'.repeat(story.rating)}</span><span className="flex items-center gap-2 text-xs uppercase text-slate-600">{!story.consent_public && <span className="rounded-full border border-slate-600 px-2 py-0.5 text-slate-300">Gizli geri bildirim</span>}{story.language}</span></div>
                        {story.result_summary && <p className="mt-3 text-xs font-bold text-cyan-300">{story.result_summary}</p>}
                        <p className="mt-2 text-xs leading-5 text-slate-300">{story.body}</p>
                        <div className="mt-3 grid grid-cols-2 gap-2"><button disabled={writing || refreshing} onClick={() => handleTestimonialStatus(story.id, 'rejected')} className="min-h-9 rounded-lg border border-red-500/30 text-xs font-bold text-red-300">{story.consent_public ? 'Reddet' : 'Okundu, arşivle'}</button>{story.consent_public ? <button disabled={writing || refreshing} onClick={() => handleTestimonialStatus(story.id, 'approved')} className="min-h-9 rounded-lg bg-emerald-600 text-xs font-bold text-white">Anonim yayınla</button> : <span className="grid min-h-9 place-items-center rounded-lg border border-slate-700 text-xs text-slate-500">Yayınlanamaz</span>}</div>
                      </article>
                    ))}
                    {testimonials.length === 0 && !loading.quality && !errors.quality && <p className="py-8 text-center text-sm text-slate-600">Bekleyen yorum yok.</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══ ACTIVITY ═══ */}
            {activeTab === 'activity' && (
              <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

                {/* Engagement Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard icon={Dumbbell} label="Toplam Antrenman" value={activityStats?.totalWorkouts ?? '—'} color="#ff6d00" delay={0} />
                  <StatCard icon={Activity} label="Bugün Yapılan" value={activityStats?.todayWorkouts ?? '—'} color="#00b0ff" delay={0.05} />
                  <StatCard icon={Zap} label="Bu Hafta" value={activityStats?.weekWorkouts ?? '—'} color="#00e676" delay={0.1} />
                  <StatCard icon={Users} label="Aktif Kullanıcı" value={activityStats?.activeUsers ?? '—'} sub="Son 7 gün" color="#ff4081" delay={0.15} />
                </div>

                {/* Workout Trend */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold font-outfit text-white mb-4">🏋️ Son 14 Gün — Antrenman Aktivitesi</h3>
                  <div className="h-56 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={workoutTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#ff6d00" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Data Tracking Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <StatCard icon={Droplets} label="Su Kaydı" value={activityStats?.totalWater ?? '—'} sub="Toplam giriş" color="#38bdf8" delay={0.25} />
                  <StatCard icon={Scale} label="Kilo Takibi" value={activityStats?.totalProgress ?? '—'} sub="Toplam giriş" color="#a78bfa" delay={0.3} />
                  <StatCard icon={Ruler} label="Ölçüm Kaydı" value={activityStats?.totalMeasurements ?? '—'} sub="Toplam giriş" color="#34d399" delay={0.35} />
                </div>

                {/* Engagement rate */}
                {stats && activityStats && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <h3 className="text-sm font-bold font-outfit text-white mb-4">📊 Engagement Oranları</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Plan Oluşturma Oranı', value: stats.totalUsers > 0 ? Math.round((stats.usersWithPlans / stats.totalUsers) * 100) : 0, color: '#ff6d00' },
                        { label: 'Haftalık Aktif Kullanıcı', value: stats.totalUsers > 0 ? Math.round((activityStats.activeUsers / stats.totalUsers) * 100) : 0, color: '#00e676' },
                        { label: 'Antrenman / Kullanıcı (ort.)', value: stats.usersWithPlans > 0 ? (activityStats.totalWorkouts / stats.usersWithPlans).toFixed(1) : 0, color: '#00b0ff', isRaw: true },
                      ].map((item, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-400 font-inter">{item.label}</span>
                            <span className="text-sm font-bold font-outfit text-white">{item.isRaw ? item.value : `%${item.value}`}</span>
                          </div>
                          {!item.isRaw && (
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: item.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(item.value, 100)}%` }}
                                transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
      {deleteTarget && <AdminDialog title="Hesabı kalıcı olarak sil" busy={deleting} onClose={() => setDeleteTarget(null)}>
        <p className="text-sm leading-6 text-slate-300"><strong className="text-white">{deleteTarget.name || deleteTarget.email}</strong> hesabı ve uygulama verileri kalıcı olarak silinecek. Bu işlem geri alınamaz.</p>
        <label className="mt-5 block text-sm" htmlFor="admin-delete-confirm">Onaylamak için SİL yazın</label>
        <input id="admin-delete-confirm" value={deleteConfirmation} disabled={deleting} onChange={(event) => setDeleteConfirmation(event.target.value)} autoComplete="off" className="mt-2 w-full rounded-xl border border-red-500/40 bg-slate-950 p-3" />
        <div className="mt-5 flex justify-end gap-3"><button disabled={deleting} onClick={() => setDeleteTarget(null)} className="rounded-xl bg-slate-800 px-4 py-3">Vazgeç</button><button disabled={writing || deleteConfirmation !== 'SİL'} onClick={handleDeleteUser} className="rounded-xl bg-red-600 px-4 py-3 font-bold disabled:opacity-40">{deleting ? 'Siliniyor…' : 'Kalıcı olarak sil'}</button></div>
      </AdminDialog>}

    </div>
  );
}
