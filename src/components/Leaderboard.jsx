import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, Users, ChevronUp, ChevronDown, Flame, TrendingUp, X } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { supabase, isSupabaseReady } from '../lib/supabase';

/**
 * Leaderboard — Haftalık antrenman sıralaması
 * Anonim: sadece ilk isim + puan gösterilir
 */
export default function Leaderboard({ plan }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [leaders, setLeaders] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('workouts'); // workouts | streak | score

  /* ── Lock body scroll ── */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  /* ── Fetch leaderboard data ── */
  useEffect(() => {
    if (!open || !isSupabaseReady()) return;
    fetchLeaderboard();
  }, [open, activeTab]);

  async function fetchLeaderboard() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Get current week start (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      const weekStart = monday.toISOString().split('T')[0];

      // Fetch leaderboard scores for this week
      const { data: scores, error } = await supabase
        .from('leaderboard_scores')
        .select('user_id, display_name, workouts, streak, score, updated_at')
        .eq('week_start', weekStart)
        .order(activeTab === 'streak' ? 'streak' : activeTab === 'score' ? 'score' : 'workouts', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('[Leaderboard] Fetch error:', error.message);
        // Use demo data if table doesn't exist yet
        setLeaders(getDemoData());
        setMyRank({ rank: 5, ...getDemoData()[4] });
        setLoading(false);
        return;
      }

      if (scores && scores.length > 0) {
        setLeaders(scores);
        const myIdx = scores.findIndex(s => s.user_id === user.id);
        if (myIdx >= 0) {
          setMyRank({ rank: myIdx + 1, ...scores[myIdx] });
        }
      } else {
        setLeaders(getDemoData());
        setMyRank({ rank: 5, ...getDemoData()[4] });
      }
    } catch (err) {
      console.warn('[Leaderboard]', err?.message);
      setLeaders(getDemoData());
    } finally {
      setLoading(false);
    }
  }

  function getDemoData() {
    return [
      { display_name: 'Ahmet K.', workouts: 6, streak: 14, score: 92 },
      { display_name: 'Elif S.', workouts: 5, streak: 21, score: 88 },
      { display_name: 'Mert Y.', workouts: 5, streak: 10, score: 85 },
      { display_name: 'Zeynep A.', workouts: 4, streak: 7, score: 78 },
      { display_name: 'Sen', workouts: 3, streak: 5, score: 72 },
      { display_name: 'Burak D.', workouts: 3, streak: 3, score: 65 },
      { display_name: 'Ayşe T.', workouts: 2, streak: 2, score: 55 },
      { display_name: 'Can M.', workouts: 2, streak: 1, score: 48 },
    ];
  }

  const getRankIcon = (index) => {
    if (index === 0) return <Crown size={16} className="text-yellow-400" />;
    if (index === 1) return <Medal size={16} className="text-slate-300" />;
    if (index === 2) return <Medal size={16} className="text-amber-600" />;
    return <span className="text-[11px] font-bold text-slate-500 w-4 text-center">{index + 1}</span>;
  };

  const getValue = (item) => {
    if (activeTab === 'streak') return `${item.streak} 🔥`;
    if (activeTab === 'score') return `${item.score}`;
    return `${item.workouts}`;
  };

  const tabs = [
    { id: 'workouts', label: t('leaderboard.workouts') || 'Antrenman', icon: '🏋️' },
    { id: 'streak', label: t('leaderboard.streak') || 'Seri', icon: '🔥' },
    { id: 'score', label: t('leaderboard.score') || 'Puan', icon: '⭐' },
  ];

  return (
    <>
      {/* Trigger Card */}
      <motion.button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-4 text-left cursor-pointer hover:border-purple-500/40 transition-colors"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
              <Trophy size={18} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white font-outfit">
                {t('leaderboard.title') || 'Sıralama Tablosu'}
              </p>
              <p className="text-[11px] text-slate-400">
                {t('leaderboard.subtitle') || 'Bu haftanın en iyileri'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {myRank && (
              <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                #{myRank.rank}
              </span>
            )}
            <ChevronUp size={14} className="text-slate-500 rotate-90" />
          </div>
        </div>
      </motion.button>

      {/* Full Leaderboard Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[85] flex items-end sm:items-center justify-center bg-slate-950/90 backdrop-blur-md overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            onTouchMove={(e) => e.preventDefault()}
          >
            <motion.div
              className="w-full max-w-md max-h-[85vh] bg-slate-900 rounded-t-3xl sm:rounded-3xl overflow-hidden"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-b border-slate-800 px-5 pt-5 pb-4">
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800/60 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <Trophy size={22} className="text-purple-400" />
                  <h2 className="font-outfit text-lg font-bold text-white">
                    {t('leaderboard.title') || 'Sıralama Tablosu'}
                  </h2>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl p-1">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Leaderboard List */}
              <div className="px-4 py-3 overflow-y-auto max-h-[55vh] scrollbar-hide">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {leaders.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                          idx < 3
                            ? 'bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-slate-700/30'
                            : 'hover:bg-slate-800/40'
                        } ${item.display_name === 'Sen' ? 'ring-1 ring-orange-500/30 bg-orange-500/5' : ''}`}
                      >
                        {/* Rank */}
                        <div className="w-6 flex items-center justify-center shrink-0">
                          {getRankIcon(idx)}
                        </div>

                        {/* Avatar placeholder */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          idx === 1 ? 'bg-slate-500/20 text-slate-300' :
                          idx === 2 ? 'bg-amber-600/20 text-amber-500' :
                          'bg-slate-700/50 text-slate-400'
                        }`}>
                          {item.display_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            item.display_name === 'Sen' ? 'text-orange-400 font-bold' : 'text-white'
                          }`}>
                            {item.display_name}
                          </p>
                        </div>

                        {/* Value */}
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-bold font-outfit ${
                            idx === 0 ? 'text-yellow-400' :
                            idx < 3 ? 'text-purple-300' :
                            'text-slate-300'
                          }`}>
                            {getValue(item)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* My Position Footer */}
              {myRank && (
                <div className="border-t border-slate-800 px-5 py-3 bg-slate-900/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{t('leaderboard.yourRank') || 'Senin sıran'}</span>
                      <span className="text-sm font-bold text-orange-400">#{myRank.rank}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {t('leaderboard.weekReset') || 'Her Pazartesi sıfırlanır'}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
