import { Mail, MessageSquare, Search, User } from 'lucide-react';
import { Pill, SkeletonRows, formatNumber, timeAgo } from './adminUi';

export const SUPPORT_STATUS_LABELS = { open: 'Açık', reviewing: 'İnceleniyor', resolved: 'Çözüldü' };
const SUPPORT_STATUS_TONES = { open: 'red', reviewing: 'amber', resolved: 'green' };
const SUPPORT_CATEGORY_LABELS = {
  support: 'Destek', bug: 'Hata', idea: 'Öneri', account: 'Hesap', privacy: 'Gizlilik', partnership: 'İş Birliği',
};

export function safeSupportUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export default function SupportSection({
  stats, tickets, filter, onFilterChange, search, onSearchChange, notes, onNoteChange,
  onStatusChange, onSaveNote, onResolve, busy, loading, error,
}) {
  const filters = [
    ['open', 'Açık', stats?.open],
    ['reviewing', 'İnceleniyor', stats?.reviewing],
    ['resolved', 'Çözüldü', stats?.resolved],
    ['all', 'Tümü', stats?.total],
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3 sm:flex-row sm:items-center sm:p-4">
        <div role="group" aria-label="Destek durumu" className="flex gap-1.5 overflow-x-auto">
          {filters.map(([value, label, count]) => (
            <button
              key={value} type="button" aria-pressed={filter === value} disabled={busy} onClick={() => onFilterChange(value)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
                filter === value ? 'border-orange-500/40 bg-orange-500/10 text-orange-200' : 'border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {label}
              {count != null && <span aria-hidden="true" className="rounded-md bg-slate-800 px-1.5 tabular-nums text-slate-300">{formatNumber(count)}</span>}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input
            type="search" value={search} onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Destek kaydı ara" placeholder="Konu, mesaj, isim veya e-posta"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-orange-500/60 focus:outline-none"
          />
        </div>
      </div>

      {loading && tickets.length === 0 && <SkeletonRows rows={4} />}

      {!loading && !error && tickets.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center">
          <MessageSquare size={26} className="mx-auto mb-3 text-slate-600" aria-hidden="true" />
          <p className="text-sm text-slate-400">{search ? 'Aramayla eşleşen destek kaydı yok.' : 'Bu filtrede destek kaydı yok.'}</p>
        </div>
      )}

      <ul className="space-y-3">
        {tickets.map((ticket) => {
          const note = notes[ticket.id] ?? ticket.admin_note ?? '';
          const pageUrl = safeSupportUrl(ticket.page_url);
          return (
            <li key={ticket.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-1.5">
                <Pill tone={SUPPORT_STATUS_TONES[ticket.status] || 'slate'}>{SUPPORT_STATUS_LABELS[ticket.status] || ticket.status}</Pill>
                <Pill tone="blue">{SUPPORT_CATEGORY_LABELS[ticket.category] || ticket.category}</Pill>
                {ticket.priority === 'high' && <Pill tone="red">Öncelikli</Pill>}
                <span className="ml-auto text-xs text-slate-400">{timeAgo(ticket.created_at)}</span>
              </div>
              <h3 className="mt-2 break-words font-outfit text-base font-bold text-white">{ticket.subject}</h3>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                <span className="inline-flex min-w-0 items-center gap-1.5"><User size={13} aria-hidden="true" /><span className="truncate">{ticket.name || 'İsim yok'}</span></span>
                <span className="inline-flex min-w-0 items-center gap-1.5"><Mail size={13} aria-hidden="true" />{ticket.email ? <a href={`mailto:${ticket.email}`} className="truncate hover:text-sky-300">{ticket.email}</a> : 'E-posta yok'}</span>
                {pageUrl && <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:text-sky-300">{pageUrl}</a>}
              </div>

              <p className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-slate-950/60 p-3 text-sm leading-relaxed text-slate-200">{ticket.message}</p>

              <label htmlFor={`support-reply-${ticket.id}`} className="mt-3 block text-xs font-semibold text-slate-400">Kullanıcıya çözüm yanıtı</label>
              <textarea
                id={`support-reply-${ticket.id}`} disabled={busy} value={note} rows={3} maxLength={2000}
                onChange={(event) => onNoteChange(ticket.id, event.target.value)}
                placeholder="Neyin düzeldiğini ve kullanıcının ne yapması gerektiğini kısa ve net yaz."
                className="mt-1.5 w-full resize-y rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm leading-relaxed text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none"
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  {['open', 'reviewing'].map((status) => (
                    <button key={status} type="button" onClick={() => onStatusChange(ticket, status)} disabled={busy || ticket.status === status} className="rounded-lg border border-slate-800 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white disabled:opacity-40">
                      {SUPPORT_STATUS_LABELS[status]} yap
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => onSaveNote(ticket)} disabled={busy} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white disabled:opacity-40">Yanıtı Kaydet</button>
                  <button type="button" onClick={() => onResolve(ticket)} disabled={busy || ticket.status === 'resolved'} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-40">Yanıtı Gönder ve Çöz</button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
