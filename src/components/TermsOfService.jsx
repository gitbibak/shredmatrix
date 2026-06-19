import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';

export default function TermsOfService() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const sections = [
    { title: t('terms.s1.title') || 'Hizmet Tanımı', content: t('terms.s1.content') || 'Full Balance, kişiselleştirilmiş fitness, beslenme ve wellness programları sunan ücretsiz bir web uygulamasıdır. Uygulama eğitim ve bilgi amaçlıdır; tıbbi tavsiye niteliği taşımaz.' },
    { title: t('terms.s2.title') || 'Kullanım Koşulları', content: t('terms.s2.content') || 'Uygulamayı kullanmak için 16 yaşından büyük olmanız gerekmektedir. Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi kimseyle paylaşmayın.' },
    { title: t('terms.s3.title') || 'Sorumluluk Reddi', content: t('terms.s3.content') || 'Full Balance tarafından sağlanan antrenman ve beslenme programları genel bilgi amaçlıdır. Herhangi bir sağlık sorununuz varsa programa başlamadan önce doktorunuza danışın. Uygulamada yer alan bilgiler profesyonel tıbbi tavsiye yerine geçmez.' },
    { title: t('terms.s4.title') || 'Fikri Mülkiyet', content: t('terms.s4.content') || 'Full Balance\'ın tüm içeriği (tasarım, metin, görseller, algoritmalar) telif hakkı ile korunmaktadır. İçeriğin izinsiz kopyalanması, dağıtılması veya ticari amaçla kullanılması yasaktır.' },
    { title: t('terms.s5.title') || 'Hesap Sonlandırma', content: t('terms.s5.content') || 'Hesabınızı istediğiniz zaman silebilirsiniz. Kötüye kullanım, spam veya diğer kullanıcılara zarar verme durumunda hesabınız askıya alınabilir veya silinebilir.' },
    { title: t('terms.s6.title') || 'Değişiklikler', content: t('terms.s6.content') || 'Bu kullanım şartlarını önceden bildirimde bulunmaksızın güncelleme hakkımız saklıdır. Güncel şartlar her zaman bu sayfada yayınlanır.' },
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
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <FileText size={20} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold font-outfit">{t('terms.title') || 'Kullanım Şartları'}</h1>
              <p className="text-xs text-slate-500">{t('terms.updated') || 'Son güncelleme: Haziran 2026'}</p>
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
