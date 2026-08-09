import { Link } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Mail, MessageSquare, Shield, Sparkles, Send, CheckCircle2, AlertCircle, Clock, LoaderCircle } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { getMySupportTickets, submitSupportTicket } from '../lib/supportService';

const CONTACT_EMAIL = 'info@fullbalance.app';
const CATEGORY_OPTIONS = ['support', 'bug', 'idea', 'account', 'privacy', 'partnership'];

const STATUS_STYLES = {
  open: 'border-red-500/25 bg-red-500/10 text-red-300',
  reviewing: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
  resolved: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
};

export default function ContactPage({ user }) {
  const { t, lang } = useTranslation();
  const subject = encodeURIComponent(t('contact.mailSubject') || 'Full Balance Support');
  const body = encodeURIComponent(t('contact.mailBody') || 'Hello Full Balance team,');
  const [form, setForm] = useState({
    category: 'support',
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(Boolean(user?.id));

  const loadTickets = useCallback(async () => {
    if (!user?.id) {
      setTickets([]);
      setTicketsLoading(false);
      return;
    }

    setTicketsLoading(true);
    try {
      setTickets(await getMySupportTickets());
    } catch (loadError) {
      console.warn('[Support] Tickets could not be loaded:', loadError?.message || loadError);
    } finally {
      setTicketsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      name: current.name || user.name || '',
      email: current.email || user.email || '',
    }));
  }, [user]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (status !== 'submitting') {
      setStatus('idle');
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('submitting');
    setError('');

    try {
      await submitSupportTicket(form);
      setStatus('success');
      setForm({
        category: 'support',
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: '',
      });
      await loadTickets();
    } catch (err) {
      setStatus('error');
      setError(err?.message || t('contact.formError'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-grid text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to={user ? '/dashboard' : '/'}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-orange-400 transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          {t('contact.back')}
        </Link>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <MessageSquare size={22} className="text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
                FULL BALANCE
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit">
                {t('contact.title')}
              </h1>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-6">
            {t('contact.desc')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">{t('contact.categoryLabel')}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORY_OPTIONS.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => updateField('category', category)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                      form.category === category
                        ? 'border-orange-500/60 bg-orange-500/15 text-orange-300'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {t(`contact.categories.${category}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">{t('contact.nameLabel')}</label>
                <input
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  placeholder={t('contact.namePlaceholder')}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-orange-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">{t('contact.emailInputLabel')}</label>
                <input
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder={t('contact.emailPlaceholder')}
                  type="email"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-orange-500/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">{t('contact.subjectLabel')}</label>
              <input
                value={form.subject}
                onChange={(event) => updateField('subject', event.target.value)}
                placeholder={t('contact.subjectPlaceholder')}
                required
                maxLength={160}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-orange-500/60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">{t('contact.messageLabel')}</label>
              <textarea
                value={form.message}
                onChange={(event) => updateField('message', event.target.value)}
                placeholder={t('contact.messagePlaceholder')}
                required
                rows={6}
                maxLength={4000}
                className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-orange-500/60"
              />
            </div>

            {status === 'success' && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <span>{t('contact.formSuccess')}</span>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error || t('contact.formError')}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-950/30 transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              <Send size={18} />
              {status === 'submitting' ? t('contact.sending') : t('contact.submit')}
            </button>
          </form>

          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`}
            className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 hover:bg-slate-950/70 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Mail size={18} className="text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-500">{t('contact.emailLabel')}</p>
                <p className="text-xs font-bold text-slate-300 truncate">{CONTACT_EMAIL}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-400 shrink-0">
              {t('contact.sendMail')}
            </span>
          </a>

          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <Sparkles size={18} className="text-cyan-300 mb-2" />
              <h2 className="text-sm font-bold font-outfit mb-1">{t('contact.supportTitle')}</h2>
              <p className="text-xs text-slate-500 leading-relaxed">{t('contact.supportDesc')}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <Shield size={18} className="text-orange-300 mb-2" />
              <h2 className="text-sm font-bold font-outfit mb-1">{t('contact.privacyTitle')}</h2>
              <p className="text-xs text-slate-500 leading-relaxed">{t('contact.privacyDesc')}</p>
            </div>
          </div>
        </div>

        {user && (
          <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 shadow-xl shadow-black/10">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold font-outfit">{t('contact.myRequests')}</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{t('contact.myRequestsDesc')}</p>
              </div>
              <MessageSquare size={20} className="mt-1 shrink-0 text-cyan-300" />
            </div>

            {ticketsLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-500">
                <LoaderCircle size={16} className="animate-spin" />
                {t('contact.loadingRequests')}
              </div>
            ) : tickets.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-6 text-center text-xs text-slate-500">
                {t('contact.noRequests')}
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <article key={ticket.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="break-words text-sm font-bold text-white">{ticket.subject}</h3>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-600">
                          <Clock size={11} />
                          <span>{new Intl.DateTimeFormat(lang || 'tr', { dateStyle: 'medium' }).format(new Date(ticket.created_at))}</span>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] font-bold ${STATUS_STYLES[ticket.status] || STATUS_STYLES.open}`}>
                        {t(`contact.status.${ticket.status}`)}
                      </span>
                    </div>

                    {ticket.status === 'resolved' && (
                      <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                        <p className="text-[10px] font-bold uppercase text-emerald-300">{t('contact.adminResponse')}</p>
                        <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-emerald-100/80">
                          {ticket.admin_note || t('contact.resolvedNoticeBody')}
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
