import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  CalendarCheck2,
  Clipboard,
  Link2,
  RefreshCw,
  Share2,
  ShieldCheck,
  Target,
  TrendingUp,
  UserRoundCheck,
  UsersRound,
  X,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  connectTrainerByCode,
  createTrainerInvite,
  getMeasurements,
  getMyTrainers,
  getProgress,
  getSleep,
  getTrainerClients,
  getWaterHistory,
  getWorkoutLogs,
  removeTrainerConnection,
} from '../lib/dataService';
import { formatTrainerReport, summarizeTrainerData } from '../utils/trainerReport';
import { useToast } from './ToastProvider';

const LABELS = {
  tr: {
    title: 'PT Gelişim Raporu',
    athlete: 'Sporcu',
    goal: 'Hedef',
    calories: 'Kalori',
    macros: 'Makrolar',
    training: 'Antrenman',
    workouts7: 'Son 7 gün antrenman',
    workouts30: 'Son 30 gün antrenman',
    water: 'Su',
    sleep: 'Uyku',
    latestWeight: 'Son kilo',
    bodyFat: 'Yağ oranı',
    weightChange: 'Kilo değişimi',
    measurements: 'Ölçüler',
    generated: 'Oluşturma',
    noData: 'Veri yok',
  },
  en: {},
  es: {
    title: 'Informe para Entrenador',
    athlete: 'Atleta',
    goal: 'Objetivo',
    calories: 'Calorías',
    macros: 'Macros',
    training: 'Entrenamiento',
    workouts7: 'Entrenos últimos 7 días',
    workouts30: 'Entrenos últimos 30 días',
    water: 'Agua',
    sleep: 'Sueño',
    latestWeight: 'Peso actual',
    bodyFat: 'Grasa corporal',
    weightChange: 'Cambio de peso',
    measurements: 'Medidas',
    generated: 'Generado',
    noData: 'Sin datos',
  },
};

function formatMetric(value, fallback = '-') {
  if (value == null) return fallback;
  if (typeof value === 'number') return value.toFixed(1).replace(/\.0$/, '');
  return value;
}

export default function TrainerReport({ plan }) {
  const { lang } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    workoutLogs: [],
    progressEntries: [],
    measurements: [],
    waterHistory: [],
    sleepEntries: [],
  });
  const [invite, setInvite] = useState(null);
  const [connectCode, setConnectCode] = useState('');
  const [clients, setClients] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [connectionBusy, setConnectionBusy] = useState(false);

  const loadConnections = async () => {
    const [clientRows, trainerRows] = await Promise.all([
      getTrainerClients().catch(() => []),
      getMyTrainers().catch(() => []),
    ]);
    setClients(clientRows);
    setTrainers(trainerRows);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [workoutLogs, progressEntries, measurements, waterHistory, sleepEntries] = await Promise.all([
        getWorkoutLogs().catch(() => []),
        getProgress().catch(() => []),
        getMeasurements().catch(() => []),
        getWaterHistory(30).catch(() => []),
        getSleep(30).catch(() => []),
      ]);
      setData({ workoutLogs, progressEntries, measurements, waterHistory, sleepEntries });
      await loadConnections();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = useMemo(() => summarizeTrainerData({ plan, ...data }), [plan, data]);
  const reportText = useMemo(
    () => formatTrainerReport(summary, LABELS[lang] || LABELS.en),
    [summary, lang],
  );
  const connectedCount = clients.length + trainers.length;
  const readinessScore = Math.min(100, Math.round(
    summary.workoutsLast7 * 12
    + (summary.waterTargetDays || 0) * 4
    + (summary.sleepAvg ? Math.min(summary.sleepAvg, 8) * 4 : 0)
    + (summary.latestProgress ? 10 : 0),
  ));
  const readinessLabel = readinessScore >= 80
    ? (lang === 'tr' ? 'PT için hazır' : 'Trainer ready')
    : readinessScore >= 50
      ? (lang === 'tr' ? 'Takip edilebilir' : 'Trackable')
      : (lang === 'tr' ? 'Veri birikiyor' : 'Building data');
  const trainerNames = [
    ...clients.map((item) => item.client?.name || item.client?.email || 'Client'),
    ...trainers.map((item) => item.trainer?.name || item.trainer?.email || 'Trainer'),
  ];
  const reportHighlights = [
    {
      icon: CalendarCheck2,
      label: lang === 'tr' ? '7 gün' : '7 days',
      value: summary.workoutsLast7,
      sub: lang === 'tr' ? 'antrenman' : 'workouts',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
    },
    {
      icon: Target,
      label: lang === 'tr' ? 'Su hedefi' : 'Water target',
      value: `${summary.waterTargetDays || 0}/7`,
      sub: summary.waterAvg == null ? '-' : `${formatMetric(summary.waterAvg)} glass`,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
    {
      icon: TrendingUp,
      label: lang === 'tr' ? 'Kilo trendi' : 'Weight trend',
      value: summary.weightChange == null ? '-' : `${summary.weightChange > 0 ? '+' : ''}${formatMetric(summary.weightChange)} kg`,
      sub: summary.latestProgress?.weight ? `${summary.latestProgress.weight} kg` : (lang === 'tr' ? 'veri yok' : 'no data'),
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
  ];

  const copyReport = async () => {
    await navigator.clipboard.writeText(reportText);
    toast.success(lang === 'tr' ? 'PT raporu kopyalandı' : 'Trainer report copied');
  };

  const copyInvite = async () => {
    if (!invite?.code) return;
    await navigator.clipboard.writeText(invite.code);
    toast.success(lang === 'tr' ? 'Davet kodu kopyalandı' : 'Invite code copied');
  };

  const createInvite = async () => {
    setConnectionBusy(true);
    try {
      const nextInvite = await createTrainerInvite();
      setInvite(nextInvite);
      toast.success(lang === 'tr' ? 'PT davet kodu oluşturuldu' : 'Trainer invite created');
    } catch (err) {
      toast.error(err?.message || (lang === 'tr' ? 'Davet kodu oluşturulamadı' : 'Invite could not be created'));
    } finally {
      setConnectionBusy(false);
    }
  };

  const connectTrainer = async (event) => {
    event.preventDefault();
    setConnectionBusy(true);
    try {
      await connectTrainerByCode(connectCode);
      setConnectCode('');
      await loadConnections();
      toast.success(lang === 'tr' ? 'PT bağlantısı kuruldu' : 'Trainer connected');
    } catch (err) {
      toast.error(err?.message || (lang === 'tr' ? 'PT bağlantısı kurulamadı' : 'Trainer could not be connected'));
    } finally {
      setConnectionBusy(false);
    }
  };

  const removeConnection = async (connectionId) => {
    setConnectionBusy(true);
    try {
      await removeTrainerConnection(connectionId);
      await loadConnections();
      toast.success(lang === 'tr' ? 'Bağlantı kaldırıldı' : 'Connection removed');
    } catch (err) {
      toast.error(err?.message || (lang === 'tr' ? 'Bağlantı kaldırılamadı' : 'Connection could not be removed'));
    } finally {
      setConnectionBusy(false);
    }
  };

  const shareReport = async () => {
    if (navigator.share) {
      await navigator.share({
        title: LABELS[lang]?.title || 'PT Progress Report',
        text: reportText,
      });
      return;
    }
    await copyReport();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-hidden relative"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" />
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <UserRoundCheck size={17} className="text-emerald-400 shrink-0" />
            <h3 className="text-base font-bold font-outfit text-white">
              {lang === 'tr' ? 'PT Kontrol Merkezi' : lang === 'es' ? 'Centro PT' : 'Trainer Hub'}
            </h3>
          </div>
          <p className="text-[11px] text-slate-500">
            {lang === 'tr' ? 'Rapor, bağlantı ve paylaşım tek panelde' : 'Report, links and sharing in one panel'}
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="p-2.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white disabled:opacity-50 cursor-pointer transition-colors"
          aria-label="Refresh trainer report"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="rounded-2xl bg-slate-950/60 border border-slate-800/70 p-4 mb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider mb-1">
              {lang === 'tr' ? 'Coach skoru' : 'Coach score'}
            </p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black font-outfit text-white leading-none">{readinessScore}</span>
              <span className="text-xs text-slate-500 pb-1">/100</span>
            </div>
            <p className="text-xs text-emerald-400 font-semibold mt-2">{readinessLabel}</p>
          </div>
          <div className="w-24 h-24 rounded-full border border-emerald-500/25 bg-emerald-500/10 flex items-center justify-center shrink-0">
            <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
              <Award size={26} className="text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {reportHighlights.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`rounded-xl ${item.bg} border ${item.border} p-2.5 min-w-0`}>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon size={12} className={item.color} />
                <p className="text-[9px] text-slate-400 truncate">{item.label}</p>
              </div>
              <p className={`text-sm font-bold font-outfit ${item.color}`}>{item.value}</p>
              <p className="text-[9px] text-slate-500 truncate mt-0.5">{item.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-slate-950/50 border border-slate-800/70 p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={14} className="text-blue-400" />
          <p className="text-xs font-semibold text-white">
            {lang === 'tr' ? 'Rapor özeti' : 'Report summary'}
          </p>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          {lang === 'tr'
            ? `${summary.athleteName} için ${summary.trainingDaysPerWeek} günlük plan, ${summary.workoutsLast30} son 30 gün antrenmanı ve ${summary.latestProgress?.weight ? `${summary.latestProgress.weight} kg güncel kilo` : 'henüz kilo verisi yok'} bilgisi hazır.`
            : `${summary.trainingDaysPerWeek}-day plan, ${summary.workoutsLast30} workouts in 30 days and current body metrics are ready for sharing.`}
        </p>
      </div>

      <div className="grid gap-3 mb-4">
        <div className="rounded-xl bg-slate-950/50 border border-slate-800 p-3">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <Link2 size={14} className="text-cyan-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {lang === 'tr' ? 'PT Bağlantısı' : lang === 'es' ? 'Conexión PT' : 'Trainer Link'}
                </p>
                <p className="text-[9px] text-slate-500 truncate">
                  {connectedCount
                    ? trainerNames.join(', ')
                    : (lang === 'tr' ? 'Kod üret veya PT kodu gir' : 'Create or enter a code')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={createInvite}
              disabled={connectionBusy}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-semibold cursor-pointer hover:bg-cyan-500/20 disabled:opacity-50 transition-colors"
            >
              {lang === 'tr' ? 'Kod Üret' : lang === 'es' ? 'Crear Código' : 'Create Code'}
            </button>
          </div>

          {invite?.code && (
            <button
              type="button"
              onClick={copyInvite}
              className="w-full flex items-center justify-between gap-2 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-left cursor-pointer hover:border-cyan-500/40 transition-colors"
            >
              <span className="font-mono text-sm font-bold text-cyan-300 tracking-normal">{invite.code}</span>
              <Clipboard size={13} className="text-slate-400" />
            </button>
          )}

          <form onSubmit={connectTrainer} className="flex gap-2 mt-3">
            <input
              value={connectCode}
              onChange={(event) => setConnectCode(event.target.value.toUpperCase())}
              placeholder={lang === 'tr' ? 'PT kodu' : lang === 'es' ? 'Código PT' : 'Trainer code'}
              className="min-w-0 flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={connectionBusy || !connectCode.trim()}
              className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold cursor-pointer hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
            >
              {lang === 'tr' ? 'Bağlan' : lang === 'es' ? 'Conectar' : 'Connect'}
            </button>
          </form>
        </div>

        {(clients.length > 0 || trainers.length > 0) && (
          <div className="rounded-xl bg-slate-950/50 border border-slate-800 p-3">
            <div className="flex items-center gap-2 mb-2">
              <UsersRound size={14} className="text-emerald-400" />
              <p className="text-xs font-semibold text-white">
                {lang === 'tr' ? 'Aktif Bağlantılar' : lang === 'es' ? 'Conexiones Activas' : 'Active Links'}
              </p>
            </div>

            <div className="space-y-2">
              {[...clients.map((item) => ({ ...item, label: item.client?.name || item.client?.email || 'Client' })),
                ...trainers.map((item) => ({ ...item, label: item.trainer?.name || item.trainer?.email || 'Trainer' }))].map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-900/80 border border-slate-800 px-3 py-2">
                  <span className="min-w-0 truncate text-xs text-slate-300">{item.label}</span>
                  <button
                    type="button"
                    onClick={() => removeConnection(item.id)}
                    disabled={connectionBusy}
                    className="p-1 rounded-md text-slate-500 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                    aria-label="Remove trainer connection"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={copyReport}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold cursor-pointer hover:bg-emerald-500/20 transition-colors"
        >
          <Clipboard size={14} />
          {lang === 'tr' ? 'Kopyala' : lang === 'es' ? 'Copiar' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={shareReport}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold cursor-pointer hover:bg-blue-500/20 transition-colors"
        >
          <Share2 size={14} />
          {lang === 'tr' ? 'Paylaş' : lang === 'es' ? 'Compartir' : 'Share'}
        </button>
      </div>
    </motion.div>
  );
}
