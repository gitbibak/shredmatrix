import { useEffect, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../i18n/LanguageContext';
import { trackEvent } from '../lib/analytics';

// Read before the auth client consumes the link: the reset email signs the
// member in, and without this prompt their password would stay unknown.
const OPENED_FROM_RECOVERY_LINK = typeof window !== 'undefined'
  && [window.location.hash, window.location.search].some((part) => /(^|[#&?])type=recovery(&|$)/.test(part));

const COPY = {
  tr: {
    title: 'Yeni şifreni belirle',
    desc: 'Şifre sıfırlama bağlantısıyla giriş yaptın. Bir sonraki girişin için yeni bir şifre seç.',
    password: 'Yeni şifre',
    confirm: 'Yeni şifre (tekrar)',
    rule: 'En az 10 karakter; büyük-küçük harf, rakam ve sembol kullan.',
    mismatch: 'Şifreler eşleşmiyor.',
    save: 'Şifreyi kaydet',
    saving: 'Kaydediliyor…',
    failed: 'Şifre kaydedilemedi. Lütfen tekrar dene.',
    done: 'Şifren güncellendi.',
    later: 'Şimdi değil',
  },
  en: {
    title: 'Set your new password',
    desc: 'You signed in with a password reset link. Choose a new password for next time.',
    password: 'New password',
    confirm: 'New password (again)',
    rule: 'Use at least 10 characters with uppercase, lowercase, a number and a symbol.',
    mismatch: 'The passwords do not match.',
    save: 'Save password',
    saving: 'Saving…',
    failed: 'The password could not be saved. Please try again.',
    done: 'Your password is updated.',
    later: 'Not now',
  },
  es: {
    title: 'Elige tu nueva contraseña',
    desc: 'Entraste con un enlace para restablecer la contraseña. Elige una nueva para la próxima vez.',
    password: 'Nueva contraseña',
    confirm: 'Nueva contraseña (otra vez)',
    rule: 'Usa al menos 10 caracteres, mayúscula, minúscula, número y símbolo.',
    mismatch: 'Las contraseñas no coinciden.',
    save: 'Guardar contraseña',
    saving: 'Guardando…',
    failed: 'No se pudo guardar la contraseña. Inténtalo de nuevo.',
    done: 'Tu contraseña está actualizada.',
    later: 'Ahora no',
  },
};

export const isStrongPassword = (value) => value.length >= 10
  && /[a-z]/.test(value)
  && /[A-Z]/.test(value)
  && /\d/.test(value)
  && /[^A-Za-z0-9]/.test(value);

export default function PasswordRecoveryPrompt({ initiallyOpen = OPENED_FROM_RECOVERY_LINK }) {
  const { lang } = useTranslation();
  const c = COPY[lang] || COPY.en;
  const [open, setOpen] = useState(initiallyOpen);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!supabase) return undefined;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setOpen(true);
    });
    return () => data?.subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!done) return undefined;
    const timer = window.setTimeout(() => setOpen(false), 1800);
    return () => window.clearTimeout(timer);
  }, [done]);

  if (!open || !supabase) return null;

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (!isStrongPassword(password)) { setError(c.rule); return; }
    if (password !== confirm) { setError(c.mismatch); return; }
    setSaving(true);
    setError('');
    const { error: updateError } = await supabase.auth.updateUser({ password }).catch((err) => ({ error: err }));
    setSaving(false);
    if (updateError) {
      setError(c.failed);
      trackEvent('password_recovery_result', { result: 'failed' });
      return;
    }
    trackEvent('password_recovery_result', { result: 'updated' });
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/85 p-4" role="dialog" aria-modal="true" aria-labelledby="recovery-title">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300"><KeyRound size={20} /></span>
        <h2 id="recovery-title" className="mt-3 font-outfit text-lg font-bold text-white">{done ? c.done : c.title}</h2>
        {!done && (
          <>
            <p className="mt-1 text-sm leading-6 text-slate-400">{c.desc}</p>
            <label className="mt-4 block text-xs font-semibold text-slate-300">
              {c.password}
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-base text-white outline-none focus:border-cyan-500"
              />
            </label>
            <label className="mt-3 block text-xs font-semibold text-slate-300">
              {c.confirm}
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className="mt-1 h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-base text-white outline-none focus:border-cyan-500"
              />
            </label>
            <p className={`mt-2 text-xs leading-5 ${error ? 'text-red-300' : 'text-slate-500'}`} role={error ? 'alert' : undefined}>{error || c.rule}</p>
            <button type="submit" disabled={saving} className="mt-4 min-h-12 w-full rounded-xl bg-cyan-600 text-sm font-bold text-white disabled:opacity-50">
              {saving ? c.saving : c.save}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="mt-1 min-h-11 w-full text-xs font-semibold text-slate-400">
              {c.later}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
