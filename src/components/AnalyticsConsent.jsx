import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { getAnalyticsConsent, setAnalyticsConsent } from '../lib/analytics';
import { useTranslation } from '../i18n/LanguageContext';

export default function AnalyticsConsent() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(() => getAnalyticsConsent() == null);

  if (!visible) return null;

  const choose = (choice) => {
    setAnalyticsConsent(choice);
    setVisible(false);
  };

  return (
    <aside
      className="fixed bottom-3 left-3 right-3 z-[9999] mx-auto max-w-md rounded-xl border border-slate-700 bg-slate-900/98 p-3.5 text-white shadow-2xl shadow-black/50 backdrop-blur-xl sm:bottom-5"
      role="dialog"
      aria-modal="false"
      aria-labelledby="analytics-consent-title"
      aria-describedby="analytics-consent-description"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">
          <ShieldCheck size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="analytics-consent-title" className="text-sm font-extrabold font-outfit">{t('analyticsConsent.title')}</h2>
          <p id="analytics-consent-description" className="mt-1 text-xs leading-relaxed text-slate-300">
            {t('analyticsConsent.desc')}
          </p>
          <a href="/privacy" className="mt-1.5 inline-block text-[11px] font-semibold text-slate-400 underline decoration-slate-600 underline-offset-2 hover:text-white">
            {t('analyticsConsent.details')}
          </a>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => choose('denied')} className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-xs font-bold text-slate-300">
          {t('analyticsConsent.decline')}
        </button>
        <button type="button" onClick={() => choose('granted')} className="rounded-xl border border-slate-600 bg-slate-700 px-3 py-3 text-xs font-extrabold text-white hover:bg-slate-600">
          {t('analyticsConsent.allow')}
        </button>
      </div>
    </aside>
  );
}
