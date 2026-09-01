import { useEffect, useState } from 'react';
import { Check, Copy, ImageDown, MessageCircle, Share2, Users } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { getReferralSummary } from '../lib/dataService';
import { trackEvent, trackShare } from '../lib/analytics';
import { buildTrackedShareUrl } from '../lib/shareLinks';
import { renderShareCard, shareCardImage } from '../lib/shareImage';

const SURFACE_CAMPAIGN = {
  today: 'invite_today',
  profile: 'invite_profile',
  workout: 'invite_workout',
  share: 'invite_share',
};

export function buildInviteMessage(t, { userName, streak, workoutCount } = {}) {
  const name = String(userName || '').trim();
  if (workoutCount >= 1 && name) {
    return t('referral.messageWorkout').replace('{name}', name).replace('{count}', String(workoutCount));
  }
  if (streak >= 2 && name) {
    return t('referral.messageStreak').replace('{name}', name).replace('{days}', String(streak));
  }
  if (name) return t('referral.messagePersonal').replace('{name}', name);
  return t('referral.message');
}

/**
 * Invite loop shared by the Today tab, profile page and the post-workout
 * celebration. Uses the member's server-side code when signed in and falls
 * back to a local code so the card still works offline.
 */
export default function InviteFriendsCard({
  surface = 'today',
  compact = false,
  userName = '',
  streak = 0,
  workoutCount = 0,
  title,
  description,
  className = '',
  imageCard = null,
}) {
  const { t, lang } = useTranslation();
  const [summary, setSummary] = useState({ code: '', invited: 0, activated: 0 });
  const [copied, setCopied] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);

  useEffect(() => {
    trackEvent('invite_opened', { source: surface });
    let cancelled = false;
    getReferralSummary()
      .then((data) => { if (!cancelled && data?.code) setSummary(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [surface]);

  const shareUrl = buildTrackedShareUrl({
    language: lang,
    source: 'member_referral',
    medium: 'referral',
    campaign: SURFACE_CAMPAIGN[surface] || 'invite',
    referralCode: summary.code,
  });
  const message = buildInviteMessage(t, { userName, streak, workoutCount });
  const fullText = `${message}\n${shareUrl}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      trackShare(`invite_copy_${surface}`);
      trackEvent('invite_sent', { cardType: 'invite', destination: 'copy', source: surface, referralCode: summary.code || undefined });
      setTimeout(() => setCopied(false), 2000);
    } catch { /* Clipboard may be unavailable in some webviews. */ }
  };

  const shareWhatsApp = () => {
    trackShare(`invite_whatsapp_${surface}`);
    trackEvent('invite_sent', { cardType: 'invite', destination: 'whatsapp', source: surface, referralCode: summary.code || undefined });
    window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank', 'noopener,noreferrer');
  };

  const shareNative = async () => {
    if (navigator.share) {
      trackShare(`invite_native_${surface}`);
      trackEvent('invite_sent', { cardType: 'invite', destination: 'native', source: surface, referralCode: summary.code || undefined });
      await navigator.share({ title: 'Full Balance', text: message, url: shareUrl }).catch(() => {});
    } else {
      await copyLink();
    }
  };

  const shareImage = async () => {
    if (!imageCard || imageBusy) return;
    setImageBusy(true);
    try {
      const blob = await renderShareCard(imageCard);
      const outcome = await shareCardImage({ blob, text: message, url: shareUrl, filename: `fullbalance-${surface}.png` });
      trackShare(`invite_image_${surface}_${outcome}`);
    } finally {
      setImageBusy(false);
    }
  };

  const hasProgress = summary.invited > 0;

  return (
    <section className={`rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/10 via-slate-900 to-slate-900 ${compact ? 'p-4' : 'p-5'} ${className}`}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-300">
          <Users size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-outfit text-sm font-bold text-white">{title || t('referral.cardTitle')}</h3>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{description || t('referral.cardDesc')}</p>
        </div>
      </div>

      {hasProgress && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2 text-center">
            <p className="font-outfit text-lg font-bold text-white">{summary.invited}</p>
            <p className="text-[9px] text-slate-500">{t('referral.statInvited')}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2 text-center">
            <p className="font-outfit text-lg font-bold text-emerald-400">{summary.activated}</p>
            <p className="text-[9px] text-slate-500">{t('referral.statActivated')}</p>
          </div>
        </div>
      )}

      {imageCard && (
        <button type="button" onClick={shareImage} disabled={imageBusy} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3 text-xs font-bold text-slate-950 shadow-lg shadow-orange-500/20 disabled:opacity-60">
          <ImageDown size={16} /> {imageBusy ? '…' : t('referral.shareImage')}
        </button>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button type="button" onClick={shareWhatsApp} className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20">
          <MessageCircle size={15} /> WhatsApp
        </button>
        <button type="button" onClick={shareNative} className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-2 text-[11px] font-bold text-blue-300 hover:bg-blue-500/20">
          <Share2 size={15} /> {t('referral.shareLink')}
        </button>
        <button type="button" onClick={copyLink} aria-label={t('referral.copyLink')} className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950/70 px-2 font-mono text-[11px] font-bold text-orange-300 hover:border-orange-500/40">
          {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} className="text-slate-400" />}
          <span className="truncate">{copied ? t('referral.copied') : (summary.code || '…')}</span>
        </button>
      </div>
      {!compact && <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{t('referral.rewardHint')}</p>}
    </section>
  );
}
