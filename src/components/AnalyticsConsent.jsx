import { useState } from 'react';
import { BarChart3, ShieldCheck } from 'lucide-react';
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
      className="fixed bottom-3 left-3 right-3 z-[9999] mx-auto max-w-lg rounded-2xl border border-slate-700 bg-slate-900/98 p-4 text-white shadow-2xl shadow-black/50 backdrop-blur-xl sm:bottom-5"
      aria-labelledby="analytics-consent-title"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/12 text-blue-300">
          <BarChart3 size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="analytics-consent-title" className="text-sm font-extrabold font-outfit">{t('analyticsConsent.title')}</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{t('analyticsConsent.desc')}</p>
          <p className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300">
            <ShieldCheck size={13} /> {t('analyticsConsent.private')}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => choose('denied')} className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-xs font-bold text-slate-300">
          {t('analyticsConsent.decline')}
        </button>
        <button type="button" onClick={() => choose('granted')} className="rounded-xl bg-blue-500 px-3 py-3 text-xs font-extrabold text-white hover:bg-blue-400">
          {t('analyticsConsent.allow')}
        </button>
      </div>
    </aside>
  );
}
