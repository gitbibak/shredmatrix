import { useEffect, useRef, useState } from 'react';
import { Lightbulb, MessageSquareHeart, X } from 'lucide-react';
import { getUserId } from '../lib/dataService';
import { trackEvent } from '../lib/analytics';
import { canAsk, hasSeen, markSeen, recordAsk, reviewDue, supportPaused } from '../lib/engagementAsks';
import { activeFounderNote } from '../data/founderNotes';
import { SUPPORT_URL, isSupportEnabled } from '../data/support';
import IdeaBox, { ideaCopy } from './IdeaBox';
import SupportCard from './SupportCard';
import UserStoryForm from './UserStoryForm';

// One engagement card on the Today tab per session: the monthly founder note
// while it is active and unseen, then the support card (every 14 days for
// members past their first 3 days), otherwise (rarely) the idea box. Steps
// aside while the rating prompt is due.
const CLOSE = { tr: 'Kapat', en: 'Close', es: 'Cerrar' };

function pick(userId) {
  if (reviewDue({ userId })) return null;
  const note = activeFounderNote();
  if (note && !hasSeen(`note:${note.id}`, { userId }) && canAsk('founder_note', { userId })) return { kind: 'founder_note', note };
  if (isSupportEnabled(SUPPORT_URL) && canAsk('support', { userId })) return { kind: 'support' };
  if (canAsk('idea', { userId })) return { kind: 'idea' };
  return null;
}

export default function EngagementSlot({ lang = 'tr' }) {
  const [slot, setSlot] = useState(() => pick(getUserId()));
  const recorded = useRef(false);
  useEffect(() => {
    if (!slot || recorded.current) return;
    recorded.current = true;
    recordAsk(slot.kind, { userId: getUserId() });
    trackEvent('engagement_ask_shown', { kind: slot.kind, placement: 'today' });
  }, [slot]);
  const [open, setOpen] = useState(null);
  if (!slot) return null;
  const userId = getUserId();

  if (slot.kind === 'support') {
    return (
      <div className="relative">
        <SupportCard lang={lang} placement="today" />
        <button type="button" onClick={() => setSlot(null)} aria-label={CLOSE[lang] || CLOSE.en} className="absolute right-1 top-1 grid h-11 w-11 place-items-center text-slate-500 hover:text-slate-300"><X size={18} /></button>
      </div>
    );
  }

  if (slot.kind === 'idea') {
    return <IdeaBox lang={lang} placement="today" />;
  }

  const note = slot.note;
  const c = note[lang] || note.en;
  const done = () => markSeen(`note:${note.id}`, { userId });
  const close = () => { done(); trackEvent('founder_note_action', { action: 'close', noteId: note.id }); setSlot(null); };
  const act = (action) => { done(); trackEvent('founder_note_action', { action, noteId: note.id }); setOpen(action); };
  const showSupport = isSupportEnabled(SUPPORT_URL) && !supportPaused({ userId });

  return (
    <section aria-labelledby="founder-note-title" className="relative overflow-hidden rounded-2xl border border-orange-400/30 bg-gradient-to-br from-orange-500/[0.12] via-slate-900 to-slate-900 p-4 sm:p-5">
      <button type="button" onClick={close} aria-label={c.close} className="absolute right-1 top-1 grid h-11 w-11 place-items-center text-slate-500 hover:text-slate-300"><X size={18} /></button>
      <div className="flex items-start gap-3 pr-8">
        <img src="/brand/mark.svg" alt="" aria-hidden="true" width="28" height="29" className="mt-0.5 shrink-0" />
        <div className="min-w-0">
          <h3 id="founder-note-title" className="font-outfit text-sm font-bold text-white">{c.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{c.body}</p>
        </div>
      </div>
      {!open && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => act('idea')} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-950"><Lightbulb size={16} />{c.idea}</button>
          <button type="button" onClick={() => act('review')} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-200 hover:text-white"><MessageSquareHeart size={16} />{c.review}</button>
          {showSupport && (
            <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" onClick={() => { done(); trackEvent('founder_note_action', { action: 'support', noteId: note.id }); trackEvent('support_link_click', { placement: 'founder_note', language: lang }); }} className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-amber-300 hover:text-amber-200">{c.support}</a>
          )}
        </div>
      )}
      {open === 'idea' && <div className="mt-4"><IdeaBox lang={lang} placement="founder_note" compact /><p className="mt-2 text-[11px] text-slate-500">{(ideaCopy[lang] || ideaCopy.en).desc}</p></div>}
      {open === 'review' && <div className="mt-4"><UserStoryForm lang={lang} embedded /></div>}
    </section>
  );
}
