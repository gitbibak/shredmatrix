import { ClipboardCheck, Star } from 'lucide-react';
import { Panel, Pill, SkeletonRows } from './adminUi';

const CONTENT_LABELS = { strength: 'Kuvvet', fat_loss: 'Yağ Yakımı', nutrition: 'Beslenme', yoga: 'Yoga', pilates: 'Pilates', reformer: 'Reformer', meditation: 'Meditasyon' };
const REVIEW_STATUS = {
  pending: ['Bekliyor', 'amber'],
  in_review: ['İncelemede', 'blue'],
  changes_requested: ['Düzeltme istendi', 'red'],
  approved: ['Doğrulandı', 'green'],
};

const inputClass = 'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none';

export default function ContentSection({ testimonials, reviews, drafts, onDraftChange, onReviewSave, onTestimonialStatus, busy, loading, error }) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <Panel
        id="testimonials"
        title={<span className="inline-flex items-center gap-2"><Star size={16} className="text-amber-400" aria-hidden="true" />Bekleyen kullanıcı yorumları</span>}
        description="Yayın izni verilenler anonim yayınlanabilir. 'Gizli' etiketli girişler yalnızca ekibe yazılmış geri bildirimdir ve yayınlanamaz."
      >
        {loading && testimonials.length === 0 && <SkeletonRows rows={3} />}
        {!loading && !error && testimonials.length === 0 && <p className="py-3 text-sm text-slate-500">Bekleyen yorum yok.</p>}
        <ul className="grid gap-3 lg:grid-cols-2">
          {testimonials.map((story) => (
            <li key={story.id} className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-amber-400" aria-label={`${story.rating} yıldız`}>{'★'.repeat(story.rating)}</span>
                <span className="flex items-center gap-1.5">
                  {!story.consent_public && <Pill>Gizli geri bildirim</Pill>}
                  {story.language && <Pill>{String(story.language).toUpperCase()}</Pill>}
                </span>
              </div>
              {story.result_summary && <p className="mt-3 text-xs font-bold text-cyan-300">{story.result_summary}</p>}
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-200">{story.body}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" disabled={busy} onClick={() => onTestimonialStatus(story.id, 'rejected')} className="min-h-9 rounded-lg border border-rose-500/30 text-xs font-bold text-rose-300 disabled:opacity-40">
                  {story.consent_public ? 'Reddet' : 'Okundu, arşivle'}
                </button>
                {story.consent_public
                  ? <button type="button" disabled={busy} onClick={() => onTestimonialStatus(story.id, 'approved')} className="min-h-9 rounded-lg bg-emerald-600 text-xs font-bold text-white disabled:opacity-40">Anonim yayınla</button>
                  : <span className="grid min-h-9 place-items-center rounded-lg border border-slate-700 text-xs text-slate-500">Yayınlanamaz</span>}
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        id="reviews"
        title={<span className="inline-flex items-center gap-2"><ClipboardCheck size={16} className="text-emerald-400" aria-hidden="true" />Uzman inceleme kayıtları</span>}
        description="Yalnızca gerçek ve nitelikli bir dış uzman içeriği fiilen incelediğinde adı, yeterliliği ve doğrulanabilir kanıtı girilir. Bekleyen kayıtlar kullanıcıya onaylanmış gösterilmez."
      >
        {loading && reviews.length === 0 && <SkeletonRows rows={3} />}
        {!loading && !error && reviews.length === 0 && <p className="py-3 text-sm text-slate-500">İncelenecek içerik kaydı bulunmuyor.</p>}
        <div className="grid gap-3 lg:grid-cols-2">
          {reviews.map((review) => {
            const draft = drafts[review.id] || review;
            const area = CONTENT_LABELS[review.content_area] || review.content_area;
            const [statusLabel, statusTone] = REVIEW_STATUS[review.review_status] || [review.review_status, 'slate'];
            const field = (name, label, placeholder) => (
              <input disabled={busy} value={draft[name] || ''} onChange={(event) => onDraftChange(review.id, name, event.target.value)} aria-label={`${label}: ${area}`} placeholder={placeholder} className={inputClass} />
            );
            return (
              <article key={review.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-white">{area}</h4>
                  <Pill tone={statusTone}>{statusLabel}</Pill>
                </div>
                <div className="space-y-2">
                  {field('reviewer_name', 'Uzman adı', 'Uzman adı')}
                  {field('reviewer_credential', 'Uzmanlık veya sertifika', 'Uzmanlık / sertifika')}
                  {field('evidence_url', 'Doğrulama bağlantısı', 'https:// doğrulama veya belge bağlantısı')}
                  <textarea disabled={busy} value={draft.notes || ''} onChange={(event) => onDraftChange(review.id, 'notes', event.target.value)} aria-label={`İnceleme notu: ${area}`} placeholder="İnceleme notu" rows={2} className={`${inputClass} resize-y`} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button type="button" disabled={busy} onClick={() => onReviewSave(review.id, 'in_review')} className="min-h-9 rounded-lg border border-sky-500/30 text-xs font-bold text-sky-300 disabled:opacity-40">İncelemede</button>
                  <button type="button" disabled={busy} onClick={() => onReviewSave(review.id, 'changes_requested')} className="min-h-9 rounded-lg border border-rose-500/30 text-xs font-bold text-rose-300 disabled:opacity-40">Düzeltme</button>
                  <button type="button" disabled={busy} onClick={() => onReviewSave(review.id, 'approved')} className="min-h-9 rounded-lg bg-emerald-600 text-xs font-bold text-white disabled:opacity-40">Doğrula</button>
                </div>
              </article>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
