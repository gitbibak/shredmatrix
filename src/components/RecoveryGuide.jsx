import { Droplets, Moon, ShieldCheck, Utensils } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

const ITEMS = [
  { key: 'hydration', icon: Droplets, color: 'text-cyan-300', bg: 'bg-cyan-500/10' },
  { key: 'meal', icon: Utensils, color: 'text-emerald-300', bg: 'bg-emerald-500/10' },
  { key: 'sleep', icon: Moon, color: 'text-violet-300', bg: 'bg-violet-500/10' },
];

export default function RecoveryGuide() {
  const { t } = useTranslation();

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
          <ShieldCheck size={19} />
        </span>
        <div>
          <h3 className="font-outfit text-sm font-bold text-white">{t('recoveryGuide.title')}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{t('recoveryGuide.desc')}</p>
        </div>
      </div>

      <div className="space-y-2">
        {ITEMS.map(({ key, icon: Icon, color, bg }) => (
          <div key={key} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/55 p-3">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg} ${color}`}>
              <Icon size={15} />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-200">{t(`recoveryGuide.${key}.title`)}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{t(`recoveryGuide.${key}.desc`)}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-amber-200/70">{t('recoveryGuide.medical')}</p>
    </section>
  );
}
