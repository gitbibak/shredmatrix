import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, Share2, MessageCircle, Check, Gift } from 'lucide-react';
import { trackShare, trackReferral } from '../lib/analytics';

const REFERRAL_KEY = 'fb_referral_code';
const REFERRAL_COUNT_KEY = 'fb_referral_count';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'FB';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function ReferralSystem() {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let c = localStorage.getItem(REFERRAL_KEY);
    if (!c) { c = generateCode(); localStorage.setItem(REFERRAL_KEY, c); }
    setCode(c);
    setCount(parseInt(localStorage.getItem(REFERRAL_COUNT_KEY) || '0'));
    // Check incoming referral
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && ref !== c) {
      localStorage.setItem('fb_referred_by', ref);
      trackReferral(ref);
    }
  }, []);

  const shareUrl = `https://fullbalance.app/?ref=${code}`;
  const shareText = 'Antrenman, beslenme, su, uyku — hepsi tek panelde, sonsuza kadar ücretsiz! 💪';

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    trackShare('copy_link');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    trackShare('whatsapp');
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
  };

  const shareNative = async () => {
    if (navigator.share) {
      trackShare('native');
      await navigator.share({ title: 'Full Balance', text: shareText, url: shareUrl }).catch(() => {});
    } else {
      copyLink();
    }
  };

  const progress = Math.min(count / 3, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gift size={16} className="text-orange-400" />
          <span className="text-xs font-bold font-outfit text-white">Arkadaşlarını Davet Et</span>
        </div>
        <span className="text-[9px] text-slate-500">{count}/3 davet</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-800 rounded-full mb-3 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>

      {/* Referral code */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 bg-slate-900/60 border border-slate-700/30 rounded-lg px-3 py-2 text-center">
          <span className="text-xs font-mono font-bold text-orange-400 tracking-wider">{code}</span>
        </div>
      </div>

      {/* Share buttons */}
      <div className="flex gap-2">
        <button
          onClick={copyLink}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/30 text-slate-300 hover:text-white hover:border-orange-500/30 transition-colors text-[10px] font-medium cursor-pointer"
        >
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          {copied ? 'Kopyalandı!' : 'Link Kopyala'}
        </button>
        <button
          onClick={shareWhatsApp}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/15 border border-green-500/25 text-green-400 hover:bg-green-500/25 transition-colors text-[10px] font-medium cursor-pointer"
        >
          <MessageCircle size={12} />
          WhatsApp
        </button>
        <button
          onClick={shareNative}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 hover:bg-blue-500/25 transition-colors text-[10px] font-medium cursor-pointer"
        >
          <Share2 size={12} />
          Paylaş
        </button>
      </div>

      {count >= 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-center">
          <span className="text-[10px] text-amber-400 font-bold">🏅 Davetçi Rozeti Kazanıldı!</span>
        </motion.div>
      )}
    </motion.div>
  );
}
