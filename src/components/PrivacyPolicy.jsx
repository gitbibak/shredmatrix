import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const sections = [
    { title: t('privacy.s1.title') || 'Toplanan Veriler', content: t('privacy.s1.content') || 'Full Balance, yalnızca uygulamanın çalışması için gerekli olan verileri toplar: ad, e-posta adresi, fiziksel ölçüler (boy, kilo, yaş, cinsiyet), hedef ve tercih bilgileri. Bu veriler kişiselleştirilmiş beslenme ve antrenman planınızı oluşturmak için kullanılır.' },
    { title: t('privacy.s2.title') || 'Verilerin Saklanması', content: t('privacy.s2.content') || 'Verileriniz iki katmanlı güvenlik ile saklanır: (1) Cihazınızın yerel depolaması (localStorage) ve (2) Supabase şifreli bulut sunucuları (AES-256 şifreleme). Verilerinize yalnızca siz erişebilirsiniz.' },
    { title: t('privacy.s3.title') || 'Üçüncü Taraf Paylaşımı', content: t('privacy.s3.content') || 'Kişisel verileriniz hiçbir koşulda üçüncü taraflarla paylaşılmaz, satılmaz veya kiralanmaz. Reklam ağları, analitik şirketleri veya diğer kurumlarla veri alışverişi yapılmaz.' },
    { title: t('privacy.s4.title') || 'Çerezler ve Takip', content: t('privacy.s4.content') || 'Full Balance herhangi bir çerez (cookie), takip pikseli veya üçüncü taraf analitik aracı kullanmaz. Uygulama tamamen çevrimdışı çalışabilir.' },
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
              <p className="text-xs text-slate-500">{t('privacy.updated') || 'Son güncelleme: Haziran 2026'}</p>
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
        </motion.div>
      </div>
    </div>
  );
}
