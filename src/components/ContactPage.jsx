import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, Shield, Sparkles } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

const CONTACT_EMAIL = 'info@fullbalance.app';

export default function ContactPage() {
  const { t } = useTranslation();
  const subject = encodeURIComponent(t('contact.mailSubject') || 'Full Balance Support');
  const body = encodeURIComponent(t('contact.mailBody') || 'Hello Full Balance team,');

  return (
    <div className="min-h-screen bg-slate-950 bg-grid text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
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

          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`}
            className="flex items-center justify-between gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 hover:bg-emerald-500/15 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Mail size={20} className="text-emerald-300 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400">{t('contact.emailLabel')}</p>
                <p className="text-sm font-bold text-white truncate">{CONTACT_EMAIL}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-300 shrink-0">
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
      </div>
    </div>
  );
}
