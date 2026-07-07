import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clipboard, Link2, RefreshCw, Share2, UserRoundCheck, UsersRound, X } from 'lucide-react';
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
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <UserRoundCheck size={16} className="text-emerald-400" />
          <h3 className="text-sm font-bold font-outfit text-white">
            {lang === 'tr' ? 'PT Raporu' : lang === 'es' ? 'Informe PT' : 'Trainer Report'}
          </h3>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50 cursor-pointer transition-colors"
          aria-label="Refresh trainer report"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-2 text-center">
          <p className="text-[9px] text-slate-500 mb-0.5">7d</p>
          <p className="text-sm font-bold text-orange-400">{summary.workoutsLast7}</p>
        </div>
        <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-2 text-center">
          <p className="text-[9px] text-slate-500 mb-0.5">Water</p>
          <p className="text-sm font-bold text-blue-400">
            {summary.waterAvg == null ? '-' : summary.waterAvg.toFixed(1)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-2 text-center">
          <p className="text-[9px] text-slate-500 mb-0.5">Sleep</p>
          <p className="text-sm font-bold text-purple-400">
            {summary.sleepAvg == null ? '-' : summary.sleepAvg.toFixed(1)}
          </p>
        </div>
      </div>

      <pre className="max-h-44 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950/70 border border-slate-800 p-3 text-[10px] leading-relaxed text-slate-300 mb-4">
        {reportText}
      </pre>

      <div className="grid gap-3 mb-4">
        <div className="rounded-xl bg-slate-950/50 border border-slate-800 p-3">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <Link2 size={14} className="text-cyan-400 shrink-0" />
              <p className="text-xs font-semibold text-white truncate">
                {lang === 'tr' ? 'PT Bağlantısı' : lang === 'es' ? 'Conexión PT' : 'Trainer Link'}
              </p>
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
              className="min-w-0 flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={connectionBusy || !connectCode.trim()}
              className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold cursor-pointer hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
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
