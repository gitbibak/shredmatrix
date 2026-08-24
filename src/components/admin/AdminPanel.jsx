import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Users, PieChart, Activity, Search,
  TrendingUp, UserPlus, Calendar, Target, ChevronLeft, ChevronRight,
  Trash2, Eye, X, Shield, RefreshCw, Menu, ArrowLeft, Clock, Zap,
  Dumbbell, Droplets, Scale, Ruler, MessageSquare, Mail, CheckCircle2, AlertCircle,
  ClipboardCheck, Star
} from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
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
        <span className="text-[10px] text-slate-500 font-outfit uppercase tracking-wider leading-tight">{label}</span>
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold font-outfit text-white">{value}</p>
      {sub && <p className="text-[10px] text-slate-500 mt-1 font-inter">{sub}</p>}
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
      <p className="text-slate-600 text-sm font-inter">Veri yok</p>
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
            <span className="text-[10px] text-slate-400 font-inter">{entry.name} ({entry.value} — %{total > 0 ? Math.round(entry.value / total * 100) : 0})</span>
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

  useEffect(() => {
    getUserPlanDetails(userId).then(p => { setPlan(p); setLoading(false); });
  }, [userId]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-outfit text-white">Kullanıcı Detayları</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {loading ? (
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
      </motion.div>
    </motion.div>
  );
}

// ── Time Ago Helper ──────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return '-';
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Az önce';
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
  return d.toLocaleDateString('tr-TR');
}

// ═════════════════════════════════════════════════
// Main Admin Panel
// ═════════════════════════════════════════════════
export default function AdminPanel({ user }) {
  const navigate = useNavigate();
  const [accessState, setAccessState] = useState('checking');
  const [activeTab, setActiveTab] = useState('dashboard');
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
    international: { registrations: 0, activated: 0, activationRate: 0, english: 0, spanish: 0, attributed: 0, direct: 0 },
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
  const [supportStats, setSupportStats] = useState({ open: 0, reviewing: 0, resolved: 0, total: 0 });
  const [supportFilter, setSupportFilter] = useState('open');
  const [supportSearch, setSupportSearch] = useState('');
  const [updatingTicketId, setUpdatingTicketId] = useState(null);
  const [supportNotes, setSupportNotes] = useState({});
  const [loadError, setLoadError] = useState('');
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
    if (!isAllowed) return;
    try {
      const [s, d, t, r, a, w, support, retention, funnel] = await Promise.all([
        getAdminStats(),
        getPlanDistribution(),
        getRegistrationTrend(),
        getRecentUsers(),
        getActivityStats(),
        getWorkoutTrend(),
        getSupportStats(),
        getRetentionStats(),
        getActivationFunnelStats(),
      ]);
      if (!s || !a) throw new Error('Bazı yönetim verileri alınamadı.');
      setStats(s);
      setDistribution(d);
      setTrend(t);
      setRecentUsers(r);
      setActivityStats(a);
      setWorkoutTrend(w);
      setSupportStats(support);
      setRetentionStats(retention);
      setActivationFunnel(funnel);
      setLoadError('');
      setLastUpdated(new Date());
    } catch (err) {
      setLoadError(err.message || 'Yönetim verileri yüklenemedi.');
    }
  }, [isAllowed]);

  const loadUsers = useCallback(async () => {
    if (!isAllowed) return;
    const result = await getAdminUsers(usersPage, PAGE_SIZE, debouncedSearch);
    if (result.error) setLoadError('Kullanıcı listesi yüklenemedi. Lütfen yeniden deneyin.');
    setUsers(result.users);
    setUsersTotal(result.total);
  }, [isAllowed, usersPage, debouncedSearch]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => {
    if (!isAllowed) return;
    getSupportTickets(supportFilter)
      .then(setSupportTickets)
      .catch(() => setLoadError('Destek kayıtları yüklenemedi. Lütfen yeniden deneyin.'));
  }, [isAllowed, supportFilter]);
  useEffect(() => {
    if (!isAllowed) return;
    Promise.all([getContentReviews(), getAdminTestimonials('pending')])
      .then(([reviews, stories]) => {
        setContentReviews(reviews);
        setTestimonials(stories);
        setQualityDrafts(Object.fromEntries(reviews.map((review) => [review.id, review])));
      })
      .catch(() => setLoadError('Kalite inceleme kayıtları yüklenemedi.'));
  }, [isAllowed]);

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
    setRefreshing(true);
    try {
      await Promise.all([loadData(), loadUsers()]);
      setSupportTickets(await getSupportTickets(supportFilter));
      const [reviews, stories] = await Promise.all([getContentReviews(), getAdminTestimonials('pending')]);
      setContentReviews(reviews);
      setTestimonials(stories);
      setQualityDrafts(Object.fromEntries(reviews.map((review) => [review.id, review])));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('[Admin] Refresh error:', error);
      setLoadError('Yonetim verileri yenilenemedi. Baglantiyi kontrol edip tekrar deneyin.');
    } finally {
      setRefreshing(false);
    }
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

  const handleDeleteUser = async (userId, name) => {
    if (!confirm(`"${name}" hesabı ve tüm uygulama verileri kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam edilsin mi?`)) return;
    try {
      await deleteUser(userId);
      await loadUsers();
      await loadData();
    } catch (err) {
      alert('Silme başarısız: ' + err.message);
    }
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
  const adminName = user?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin';

  const handleTicketUpdate = async (ticketId, updates) => {
    setUpdatingTicketId(ticketId);
    try {
      const updated = await updateSupportTicket(ticketId, updates);
      setSupportTickets((tickets) => tickets.map((ticket) => ticket.id === ticketId ? updated : ticket));
      setSupportNotes((notes) => ({ ...notes, [ticketId]: updated.admin_note || '' }));
      setSupportStats(await getSupportStats());
      if (updates.status && supportFilter !== 'all' && updates.status !== supportFilter) {
        setSupportTickets((tickets) => tickets.filter((ticket) => ticket.id !== ticketId));
      }
    } catch (err) {
      alert('Destek kaydı güncellenemedi: ' + err.message);
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const handleResolveTicket = async (ticket) => {
    const adminNote = (supportNotes[ticket.id] ?? ticket.admin_note ?? '').trim();
    if (!adminNote) {
      alert('Kullanıcının çözümü anlayabilmesi için kısa bir yanıt yaz.');
      return;
    }
    await handleTicketUpdate(ticket.id, { status: 'resolved', admin_note: adminNote });
  };

  const handleReviewSave = async (reviewId, reviewStatus) => {
    setQualityUpdatingId(reviewId);
    try {
      const updated = await updateContentReview(reviewId, { ...qualityDrafts[reviewId], review_status: reviewStatus });
      setContentReviews((items) => items.map((item) => item.id === reviewId ? updated : item));
      setQualityDrafts((drafts) => ({ ...drafts, [reviewId]: updated }));
    } catch (err) {
      alert(err.message || 'İnceleme kaydedilemedi.');
    } finally {
      setQualityUpdatingId(null);
    }
  };

  const handleTestimonialStatus = async (id, status) => {
    setQualityUpdatingId(id);
    try {
      await updateTestimonialStatus(id, status);
      setTestimonials((items) => items.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message || 'Yorum güncellenemedi.');
    } finally {
      setQualityUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col
        transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold font-outfit text-white">Admin Panel</h1>
              <p className="text-[10px] text-slate-500 font-inter">FullBalance</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {tabs.map(tab => (
            <button key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-outfit transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
              }`}>
              <tab.icon size={18} />
              <span className="flex-1 text-left">{tab.label}</span>
              {tab.id === 'support' && supportStats.open > 0 && (
                <span className="min-w-5 rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] font-bold text-red-300">
                  {supportStats.open}
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
              <p className="text-[9px] text-orange-400 font-inter">Admin</p>
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
      <main className="flex-1 min-h-screen overflow-y-auto">
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 px-4 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white cursor-pointer">
                <Menu size={20} />
              </button>
              <h2 className="text-lg font-bold font-outfit text-white">{tabs.find(t => t.id === activeTab)?.label}</h2>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && <span className="hidden sm:block text-[10px] text-slate-600">{lastUpdated.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>}
              <button onClick={handleRefresh} disabled={refreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white transition-all cursor-pointer font-inter disabled:opacity-50">
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                Yenile
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {loadError && (
            <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 text-sm text-red-200">
                <AlertCircle className="mt-0.5 shrink-0" size={16} />
                <span>{loadError}</span>
              </div>
              <button onClick={handleRefresh} className="self-start rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-bold text-red-200 sm:self-auto">Tekrar dene</button>
            </div>
          )}
          <AnimatePresence mode="wait">

            {/* ═══ DASHBOARD ═══ */}
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard icon={Users} label="Toplam Kullanıcı" value={stats?.totalUsers ?? '—'} color="#ff6d00" delay={0} />
                  <StatCard icon={UserPlus} label="Bugün Kayıt" value={stats?.todayRegistrations ?? '—'} color="#00b0ff" delay={0.05} />
                  <StatCard icon={Calendar} label="Bu Hafta" value={stats?.weekRegistrations ?? '—'} color="#00e676" delay={0.1} />
                  <StatCard icon={TrendingUp} label="Aylık Büyüme" value={stats?.monthlyGrowth != null ? `%${stats.monthlyGrowth}` : '—'} sub={`${stats?.monthRegistrations ?? 0} yeni kayıt`} color="#ff4081" delay={0.15} />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard icon={Target} label="Plan Aktivasyonu" value={retentionStats ? `%${retentionStats.activationRate}` : '—'} sub={`${retentionStats?.activated ?? 0}/${retentionStats?.registrations ?? 0} son 60 gün`} color="#ffab00" delay={0.16} />
                  <StatCard icon={Calendar} label="D1 Geri Dönüş" value={retentionStats?.d1Rate == null ? '—' : `%${retentionStats.d1Rate}`} sub={`${retentionStats?.d1Returned ?? 0}/${retentionStats?.d1Eligible ?? 0} uygun kullanıcı`} color="#38bdf8" delay={0.18} />
                  <StatCard icon={TrendingUp} label="D7 Geri Dönüş" value={retentionStats?.d7Rate == null ? '—' : `%${retentionStats.d7Rate}`} sub={`${retentionStats?.d7Returned ?? 0}/${retentionStats?.d7Eligible ?? 0} uygun kullanıcı`} color="#a78bfa" delay={0.2} />
                  <StatCard icon={Users} label="Ölçüm Penceresi" value="60 gün" sub="Yeni kohort takibi" color="#34d399" delay={0.22} />
                </div>

                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
                  <div className="mb-4">
                    <h3 className="font-outfit text-sm font-bold text-white">Son 7 gün aktivasyon hunisi</h3>
                    <p className="mt-1 text-[10px] leading-5 text-slate-500">Kullanıcı hiçbir kayıt yapmasa bile uygulamayı açtığında aktif sayılır. Aşağıdaki adımlar bu sürümden itibaren birikir.</p>
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
                      const value = item.value ?? 0;
                      return <StatCard key={item.label} icon={item.icon} label={item.label} value={value} sub={index === 0 ? 'Tekil kullanıcı' : active > 0 ? `Aktiflerin %${Math.round((value / active) * 100)}` : 'Henüz veri yok'} color={item.color} delay={0.24 + index * 0.03} />;
                    })}
                  </div>
                </section>

                {/* Trend */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold font-outfit text-white mb-4">📈 Son 30 Gün — Kayıt Trendi</h3>
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

                {/* Quick stats */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <StatCard icon={Target} label="Plan Oluşturanlar" value={stats?.usersWithPlans ?? '—'}
                    sub={stats ? `%${stats.totalUsers > 0 ? Math.round((stats.usersWithPlans / stats.totalUsers) * 100) : 0} dönüşüm` : ''} color="#7c4dff" delay={0.25} />
                  <StatCard icon={Zap} label="Aktif Kullanan (7 gün)" value={activityStats?.activeUsers ?? '—'} sub="Son 7 günde antrenman yapan" color="#00e676" delay={0.3} />
                  <StatCard icon={MessageSquare} label="Açık Destek" value={stats?.openSupportTickets ?? '—'} sub="Kullanıcı mesajları" color="#ff4081" delay={0.35} />
                </div>

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
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white font-outfit">
                            {(u.name || u.email || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs text-white font-outfit font-medium">{u.name || 'İsimsiz'}</p>
                            <p className="text-[10px] text-slate-500 font-inter">{u.email || '-'}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-inter">{timeAgo(u.created_at)}</span>
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
                    onChange={e => { setSearchQuery(e.target.value); setUsersPage(0); }}
                    placeholder="İsim veya email ile ara..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 font-inter transition-colors" />
                </div>

                {/* User Cards */}
                <div className="space-y-2">
                  {users.map(u => (
                    <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white font-outfit shrink-0">
                            {(u.name || u.email || '?')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white font-outfit font-medium truncate">{u.name || 'İsimsiz'}</p>
                            <p className="text-[11px] text-slate-500 font-inter truncate">{u.email || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <button onClick={() => setDetailUserId(u.id)}
                            className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-blue-400 transition-colors cursor-pointer" title="Detay">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleDeleteUser(u.id, u.name || u.email)}
                            disabled={u.id === user?.id || u.role === 'admin'}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-20" title={u.id === user?.id || u.role === 'admin' ? 'Yönetici hesabı buradan silinemez' : 'Hesabı kalıcı sil'}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2.5 text-[10px] text-slate-500 font-inter flex-wrap">
                        <span>{u.created_at ? new Date(u.created_at).toLocaleDateString('tr-TR') : '-'}</span>
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
                  {users.length === 0 && (
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
                      <button onClick={() => setUsersPage(p => Math.max(0, p - 1))} disabled={usersPage === 0}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer transition-colors">
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs text-slate-400 font-inter">{usersPage + 1} / {totalPages}</span>
                      <button onClick={() => setUsersPage(p => Math.min(totalPages - 1, p + 1))} disabled={usersPage >= totalPages - 1}
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
                    label="Yurtdışı Kayıt (30 gün)"
                    value={distribution.international?.registrations ?? 0}
                    sub={`EN ${distribution.international?.english ?? 0} · ES ${distribution.international?.spanish ?? 0}`}
                    color="#00b0ff"
                  />
                  <StatCard
                    icon={Target}
                    label="Plan Oluşturan"
                    value={distribution.international?.activated ?? 0}
                    sub="Yurtdışı kayıtlar"
                    color="#00e676"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Yurtdışı Aktivasyon"
                    value={`%${distribution.international?.activationRate ?? 0}`}
                    sub="Kayıttan kişisel plana"
                    color="#7c4dff"
                  />
                  <StatCard
                    icon={BarChart3}
                    label="Kaynağı Belirlenen"
                    value={distribution.international?.attributed ?? 0}
                    sub={`${distribution.international?.direct ?? 0} doğrudan geliş`}
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
                  <StatCard icon={AlertCircle} label="Açık" value={supportStats.open} color="#ff4081" delay={0} />
                  <StatCard icon={Clock} label="İnceleniyor" value={supportStats.reviewing} color="#ffab00" delay={0.05} />
                  <StatCard icon={CheckCircle2} label="Çözüldü" value={supportStats.resolved} color="#00e676" delay={0.1} />
                  <StatCard icon={MessageSquare} label="Toplam" value={supportStats.total} color="#00b0ff" delay={0.15} />
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
                      onClick={() => setSupportFilter(value)}
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
                    placeholder="Konu, mesaj, isim veya e-posta ara..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-500/50"
                  />
                </div>

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
                            <span className={`px-2 py-1 rounded-lg border text-[10px] font-bold ${SUPPORT_STATUS_COLORS[ticket.status] || SUPPORT_STATUS_COLORS.open}`}>
                              {SUPPORT_STATUS_LABELS[ticket.status] || ticket.status}
                            </span>
                            <span className="px-2 py-1 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-300 text-[10px] font-bold">
                              {SUPPORT_CATEGORY_LABELS[ticket.category] || ticket.category}
                            </span>
                            {ticket.priority === 'high' && (
                              <span className="px-2 py-1 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 text-[10px] font-bold">
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
                              disabled={updatingTicketId === ticket.id || ticket.status === status}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-[10px] text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
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
                        <label className="mb-2 block text-[10px] font-bold uppercase text-slate-500">
                          Kullanıcıya çözüm yanıtı
                        </label>
                        <textarea
                          value={supportNotes[ticket.id] ?? ticket.admin_note ?? ''}
                          onChange={(event) => setSupportNotes((notes) => ({ ...notes, [ticket.id]: event.target.value }))}
                          rows={3}
                          maxLength={2000}
                          placeholder="Neyin düzeldiğini ve kullanıcının ne yapması gerektiğini kısa ve net yaz."
                          className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/50"
                        />
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            onClick={() => handleTicketUpdate(ticket.id, { admin_note: (supportNotes[ticket.id] ?? ticket.admin_note ?? '').trim() || null })}
                            disabled={updatingTicketId === ticket.id}
                            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-[10px] font-bold text-slate-300 transition-colors hover:text-white disabled:opacity-40"
                          >
                            Yanıtı Kaydet
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveTicket(ticket)}
                            disabled={updatingTicketId === ticket.id || ticket.status === 'resolved'}
                            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[10px] font-bold text-emerald-300 transition-colors hover:bg-emerald-500/15 disabled:opacity-40"
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

                      {ticket.page_url && (
                        <a href={ticket.page_url} target="_blank" rel="noreferrer" className="mt-2 block truncate text-[10px] text-slate-600 hover:text-blue-300">{ticket.page_url}</a>
                      )}
                    </motion.div>
                  ))}

                  {visibleSupportTickets.length === 0 && (
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
                  <div className="grid gap-3 lg:grid-cols-2">
                    {contentReviews.map((review) => {
                      const draft = qualityDrafts[review.id] || review;
                      const setField = (field, value) => setQualityDrafts((items) => ({ ...items, [review.id]: { ...draft, [field]: value } }));
                      return (
                        <article key={review.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                          <div className="mb-3 flex items-center justify-between gap-2"><h3 className="text-sm font-bold">{CONTENT_LABELS[review.content_area] || review.content_area}</h3><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${review.review_status === 'approved' ? 'bg-emerald-500/10 text-emerald-300' : review.review_status === 'changes_requested' ? 'bg-red-500/10 text-red-300' : 'bg-amber-500/10 text-amber-300'}`}>{CONTENT_REVIEW_STATUS_LABELS[review.review_status] || review.review_status}</span></div>
                          <div className="space-y-2">
                            <input value={draft.reviewer_name || ''} onChange={(event) => setField('reviewer_name', event.target.value)} placeholder="Uzman adı" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs outline-none focus:border-emerald-500" />
                            <input value={draft.reviewer_credential || ''} onChange={(event) => setField('reviewer_credential', event.target.value)} placeholder="Uzmanlık / sertifika" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs outline-none focus:border-emerald-500" />
                            <input value={draft.evidence_url || ''} onChange={(event) => setField('evidence_url', event.target.value)} placeholder="https:// doğrulama veya belge bağlantısı" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs outline-none focus:border-emerald-500" />
                            <textarea value={draft.notes || ''} onChange={(event) => setField('notes', event.target.value)} placeholder="İnceleme notu" rows={2} className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs outline-none focus:border-emerald-500" />
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <button disabled={qualityUpdatingId === review.id} onClick={() => handleReviewSave(review.id, 'in_review')} className="min-h-9 rounded-lg border border-blue-500/30 text-[10px] font-bold text-blue-300">İncelemede</button>
                            <button disabled={qualityUpdatingId === review.id} onClick={() => handleReviewSave(review.id, 'changes_requested')} className="min-h-9 rounded-lg border border-red-500/30 text-[10px] font-bold text-red-300">Düzeltme</button>
                            <button disabled={qualityUpdatingId === review.id} onClick={() => handleReviewSave(review.id, 'approved')} className="min-h-9 rounded-lg bg-emerald-600 text-[10px] font-bold text-white">Doğrula</button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <div className="mb-5 flex items-start gap-3"><Star className="mt-0.5 text-amber-400" size={20} /><div><h2 className="font-outfit text-lg font-bold">Bekleyen kullanıcı deneyimleri</h2><p className="mt-1 text-xs text-slate-500">Yalnızca açık paylaşım izni bulunan anonim yorumlar gösterilir.</p></div></div>
                  <div className="space-y-3">
                    {testimonials.map((story) => (
                      <article key={story.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                        <div className="flex items-center justify-between"><span className="text-sm text-amber-400">{'★'.repeat(story.rating)}</span><span className="text-[9px] uppercase text-slate-600">{story.language}</span></div>
                        {story.result_summary && <p className="mt-3 text-xs font-bold text-cyan-300">{story.result_summary}</p>}
                        <p className="mt-2 text-xs leading-5 text-slate-300">{story.body}</p>
                        <div className="mt-3 grid grid-cols-2 gap-2"><button disabled={qualityUpdatingId === story.id} onClick={() => handleTestimonialStatus(story.id, 'rejected')} className="min-h-9 rounded-lg border border-red-500/30 text-xs font-bold text-red-300">Reddet</button><button disabled={qualityUpdatingId === story.id} onClick={() => handleTestimonialStatus(story.id, 'approved')} className="min-h-9 rounded-lg bg-emerald-600 text-xs font-bold text-white">Anonim yayınla</button></div>
                      </article>
                    ))}
                    {testimonials.length === 0 && <p className="py-8 text-center text-sm text-slate-600">Bekleyen yorum yok.</p>}
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
    </div>
  );
}
