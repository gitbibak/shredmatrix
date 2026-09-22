import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { getAnalyticsConsent, setAnalyticsConsent } from '../lib/analytics';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const [analyticsChoice, setAnalyticsChoice] = useState(() => getAnalyticsConsent());

  const updateAnalyticsChoice = (choice) => {
    setAnalyticsConsent(choice);
    setAnalyticsChoice(choice);
  };

  const sections = [
    { title: ({ tr: 'İsteğe bağlı eğitmen takibi', en: 'Optional coach sharing', es: 'Seguimiento opcional con entrenador' })[lang], content: ({
      tr: 'Eğitmen bağlantısı isteğe bağlıdır. Daveti kabul edip paylaşımı onayladığınızda adınız ve bağlantı isteğiniz eğitmene gösterilir. Eğitmen isteği kabul ettikten sonra bu bağlantıya ait atanmış program, kaydettiğiniz antrenmanlar ve notlar iki tarafça görülebilir. Ayrı izin verirseniz bağlantı başladıktan sonra kaydedilen kilo, yağ oranı ve vücut ölçüleriniz de paylaşılır. Fotoğraflar, e-posta, beslenme, uyku ve diğer kişisel notlar bu özellik üzerinden paylaşılmaz. Eğitmenin mesleki unvanı Full Balance tarafından doğrulanmaz. Kilo/ölçüm paylaşımını kapatabilir veya bağlantıyı sonlandırabilirsiniz; takip süresi dolduğunda da yeni erişim kapanır. Daha önce görülmüş ya da dışarıya kopyalanmış veriler geri alınamaz. Kişisel antrenman geçmişiniz bağlantı sonrasında korunur; hesabınızı silme hakkınız devam eder. Salon üyeliği, ödeme ve turnike bilgileri bu bağlantıya dahil değildir.',
      en: 'Coach connections are optional. After you confirm sharing, the coach sees your name and connection request. Once the coach accepts, both parties can access the assigned program, workouts and notes recorded for that connection. Separately opting in also shares weight, body fat and measurements recorded after the connection started. Photos, email, nutrition, sleep and other private notes are not shared through this feature. Full Balance does not verify professional credentials. You can stop sharing measurements or end the connection; expiry also blocks further access. Previously viewed or externally copied data cannot be recalled. Your personal workout history remains after disconnecting, and you can still delete your account. Gym memberships, payments and turnstile data are not part of this connection.',
      es: 'La conexión con un entrenador es opcional. Al confirmar, el entrenador ve tu nombre y solicitud. Tras aceptar, ambas partes pueden ver el programa asignado, los entrenamientos y notas de esa conexión. Con un permiso adicional, también se comparten peso, grasa corporal y medidas registrados desde el inicio de la conexión. No se comparten fotos, correo, nutrición, sueño ni otras notas privadas mediante esta función. Full Balance no verifica credenciales profesionales. Puedes desactivar las medidas o terminar la conexión; la caducidad también bloquea nuevos accesos. No es posible recuperar datos ya vistos o copiados externamente. Tu historial personal se conserva y puedes eliminar tu cuenta. No se incluyen membresías, pagos ni tornos del gimnasio.',
    })[lang] },
    { title: t('privacy.s1.title') || 'Toplanan Veriler', content: t('privacy.s1.content') || 'Full Balance, yalnızca uygulamanın çalışması için gerekli olan verileri toplar: ad, e-posta adresi, fiziksel ölçüler (boy, kilo, yaş, cinsiyet), hedef ve tercih bilgileri. Bu veriler kişiselleştirilmiş beslenme ve antrenman planınızı oluşturmak için kullanılır.' },
    { title: t('privacy.s2.title') || 'Verilerin Saklanması', content: t('privacy.s2.content') || 'Verileriniz iki katmanlı güvenlik ile saklanır: (1) Cihazınızın yerel depolaması (localStorage) ve (2) Supabase şifreli bulut sunucuları (AES-256 şifreleme). Verilerinize yalnızca siz erişebilirsiniz.' },
    { title: t('privacy.s3.title') || 'Üçüncü Taraf Paylaşımı', content: t('privacy.s3.content') || 'Kişisel ve sağlık verileriniz satılmaz veya reklam amacıyla paylaşılmaz. Yalnızca açık izin verirseniz anonim kullanım olayları Google Analytics ile ölçülür; ad, e-posta, sağlık, alerji ve vücut verileri gönderilmez.' },
    { title: t('privacy.s4.title') || 'Çerezler ve Analitik İzni', content: t('privacy.s4.content') || 'Analitik depolama varsayılan olarak kapalıdır. Google Analytics yalnızca izin verirseniz etkinleşir; tercihiniz cihazınızda saklanır.' },
    { title: t('privacy.s5.title') || 'Veri Silme Hakkı', content: t('privacy.s5.content') || 'Hesabınızı istediğiniz zaman Profil > Hesabı Sil bölümünden kalıcı olarak silebilirsiniz. Silme işlemi tüm verilerinizi hem yerel depolamadan hem de bulut sunucularından geri dönüşümsüz olarak kaldırır.' },
    { title: t('privacy.s6.title') || 'İletişim', content: t('privacy.s6.content') || 'Gizlilik politikamız hakkında sorularınız için info@fullbalance.app adresinden bize ulaşabilirsiniz.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-orange-400 text-sm font-outfit mb-8 transition-colors cursor-pointer group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {t('common.back') || 'Geri'}
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Shield size={20} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold font-outfit">{t('privacy.title') || 'Gizlilik Politikası'}</h1>
              <p className="text-xs text-slate-500">{t('privacy.updated') || 'Son güncelleme: Ağustos 2026'}</p>
            </div>
          </div>

          <div className="space-y-6">
            {sections.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800"
              >
                <h2 className="text-sm font-bold font-outfit text-white mb-2">{i + 1}. {s.title}</h2>
                <p className="text-xs text-slate-400 leading-relaxed">{s.content}</p>
              </motion.div>
            ))}
          </div>

          <section className="mt-6 rounded-2xl border border-blue-500/20 bg-slate-900 p-5" aria-labelledby="analytics-settings-title">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                <BarChart3 size={18} />
              </span>
              <div>
                <h2 id="analytics-settings-title" className="text-sm font-bold font-outfit text-white">{t('privacy.analyticsSettings.title')}</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{t('privacy.analyticsSettings.desc')}</p>
                <p className="mt-2 text-[10px] font-semibold text-slate-500">
                  {t('privacy.analyticsSettings.current')}: {analyticsChoice === 'granted' ? t('privacy.analyticsSettings.allowed') : analyticsChoice === 'denied' ? t('privacy.analyticsSettings.denied') : t('privacy.analyticsSettings.unset')}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateAnalyticsChoice('denied')}
                className={`rounded-xl border px-3 py-3 text-xs font-bold ${analyticsChoice === 'denied' ? 'border-slate-500 bg-slate-700 text-white' : 'border-slate-700 bg-slate-800 text-slate-400'}`}
              >
                {t('privacy.analyticsSettings.reject')}
              </button>
              <button
                type="button"
                onClick={() => updateAnalyticsChoice('granted')}
                className={`rounded-xl px-3 py-3 text-xs font-bold ${analyticsChoice === 'granted' ? 'bg-blue-400 text-slate-950' : 'bg-blue-500 text-white'}`}
              >
                {t('privacy.analyticsSettings.allow')}
              </button>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
