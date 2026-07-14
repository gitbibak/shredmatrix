import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Award,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  FileDown,
  Flame,
  Moon,
  Scale,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  UtensilsCrossed,
  Waves,
} from 'lucide-react';

const BASE_URL = 'https://fullbalance.app';
const OG_IMAGE = `${BASE_URL}/og/full-balance-og-tr.png`;

const pages = {
  'ucretsiz-fitness-uygulamasi': {
    icon: Sparkles,
    accent: '#22c55e',
    title: 'Ücretsiz Fitness Uygulaması',
    titleAccent: 'Full Balance',
    metaTitle: 'Ücretsiz Fitness Uygulaması | Full Balance',
    description: 'Full Balance; antrenman, beslenme, ilerleme, gelişim raporu, Excel dışa aktarma, su, uyku ve kilo takibini tek yerde sunan tamamen ücretsiz fitness uygulamasıdır.',
    keywords: 'ücretsiz fitness uygulaması, ücretsiz antrenman uygulaması, ücretsiz beslenme uygulaması, Full Balance',
    heroCopy: 'Kredi kartı, abonelik ve premium duvarı olmadan hedefe göre antrenman, beslenme ve ilerleme takibi.',
    sections: [
      { title: 'Tamamen ücretsiz başlangıç', body: 'Kullanıcı hesap oluşturur, hedefini seçer ve kişisel planını ücret ödemeden kullanmaya başlar.' },
      { title: 'Tek panelde günlük takip', body: 'Antrenman, kalori, makro, su, uyku, kilo ve vücut ölçümleri aynı deneyimde toplanır.' },
      { title: 'Mobil öncelikli deneyim', body: 'Telefon ekranında hızlı kullanım, bildirimler, PWA kurulumu ve güvenli oturum akışı desteklenir.' },
    ],
    faqs: [
      ['Full Balance ücretsiz mi?', 'Evet. Full Balance ücretsizdir; kredi kartı, abonelik veya premium duvarı gerektirmez.'],
      ['Uygulama hangi hedefleri destekler?', 'Kas gelişimi, yağ yakımı, yoga, pilates, reformer ve meditasyon hedeflerini destekler.'],
      ['Telefonda kullanılabilir mi?', 'Evet. Full Balance mobil öncelikli tasarlanmıştır ve PWA olarak telefona eklenebilir.'],
    ],
  },
  'kalori-makro-takibi': {
    icon: UtensilsCrossed,
    accent: '#f97316',
    title: 'Kalori ve',
    titleAccent: 'Makro Takibi',
    metaTitle: 'Kalori ve Makro Takip Uygulaması | Full Balance',
    description: 'BMR, TDEE, BMI, günlük kalori, protein, karbonhidrat ve yağ hedeflerini hesaplayan ücretsiz beslenme ve makro takip uygulaması.',
    keywords: 'kalori takip uygulaması, makro takip, BMR hesaplama, TDEE hesaplama, BMI hesaplama',
    heroCopy: 'Hedefe göre kalori, makro ve 7 günlük menü önerilerini aynı kişisel planda topla.',
    sections: [
      { title: 'BMR, TDEE ve BMI hesaplama', body: 'Boy, kilo, yaş, cinsiyet ve aktivite bilgilerine göre temel metabolizma ve günlük enerji ihtiyacı hesaplanır.' },
      { title: 'Hedefe göre makrolar', body: 'Kas gelişimi veya yağ yakımı gibi hedeflere göre protein, karbonhidrat ve yağ dağılımı önerilir.' },
      { title: '7 günlük menü fikri', body: 'Kullanıcının bütçe ve tercih bilgilerine göre daha uygulanabilir beslenme planı oluşturulur.' },
    ],
    faqs: [
      ['BMR ve TDEE nedir?', 'BMR temel metabolizma hızını, TDEE ise günlük toplam enerji harcamasını ifade eder.'],
      ['Makro hedefleri kişisel mi?', 'Evet. Hedef, kilo, aktivite ve profil bilgilerine göre kişiselleştirilir.'],
      ['Beslenme planı ücretsiz mi?', 'Evet. Full Balance içindeki beslenme ve kalori özellikleri ücretsizdir.'],
    ],
  },
  'antrenman-programi': {
    icon: Dumbbell,
    accent: '#ef4444',
    title: 'Kişisel Antrenman',
    titleAccent: 'Programı',
    metaTitle: 'Kişisel Antrenman Programı | Full Balance',
    description: 'Kas gelişimi, yağ yakımı, yoga, pilates, reformer ve meditasyon için hedefe göre 24 program sunan ücretsiz antrenman planlayıcı.',
    keywords: 'antrenman programı, haftalık fitness programı, kas gelişimi programı, yağ yakımı programı',
    heroCopy: 'Hedef, deneyim ve faz sistemine göre gün gün split, set, tekrar, dinlenme ve form rehberi.',
    sections: [
      { title: '6 hedef, 4 faz', body: 'Kas gelişimi, yağ yakımı, yoga, pilates, reformer ve meditasyon için faz bazlı planlama yapılır.' },
      { title: 'Set, tekrar ve dinlenme', body: 'Her antrenmanda egzersiz detayları, tekrar aralığı ve dinlenme süresi net olarak gösterilir.' },
      { title: 'Form rehberi ve timer', body: 'Egzersiz açıklamaları, ipuçları ve dinlenme zamanlayıcısı antrenman akışını daha düzenli hale getirir.' },
    ],
    faqs: [
      ['Kaç program var?', '6 hedef ve 4 faz yapısıyla 24 temel program bulunur.'],
      ['Yeni başlayanlar kullanabilir mi?', 'Evet. Faz sistemi başlangıç seviyesinden ileri seviyeye ilerler.'],
      ['Yoga ve pilates de var mı?', 'Evet. Yoga, pilates, reformer ve meditasyon hedefleri de desteklenir.'],
    ],
  },
  'ilerleme-takibi': {
    icon: TrendingUp,
    accent: '#3b82f6',
    title: 'İlerleme Takibi ve',
    titleAccent: 'Gelişim Analizi',
    metaTitle: 'İlerleme Takibi ve Gelişim Analizi | Full Balance',
    description: 'Kilo, yağ oranı, vücut ölçüleri, fotoğraf, su, uyku ve antrenman verilerini takip eden ücretsiz gelişim takip uygulaması.',
    keywords: 'ilerleme takip uygulaması, kilo takibi, vücut ölçüsü takip, fitness gelişim takibi',
    heroCopy: 'Gelişimi sadece tartıyla değil; ölçüler, fotoğraflar, uyku, su ve antrenman verileriyle birlikte gör.',
    sections: [
      { title: 'Kilo ve ölçüm geçmişi', body: 'Kilo, yağ oranı ve vücut ölçümleri kayıt altına alınır; değişim daha net görünür.' },
      { title: 'Fotoğrafla gelişim', body: 'İlerleme fotoğrafları kullanıcının görsel dönüşümünü takip etmesine yardımcı olur.' },
      { title: 'Haftalık rapor mantığı', body: 'Antrenman, su, uyku ve kilo verileri haftalık değerlendirmeye dönüşür.' },
    ],
    faqs: [
      ['Sadece kilo mu takip edilir?', 'Hayır. Ölçüler, yağ oranı, fotoğraf, su, uyku ve antrenman verileri de takip edilir.'],
      ['Veriler dışa aktarılır mı?', 'Evet. İlerleme verileri Excel ve rapor çıktısı olarak dışa aktarılabilir.'],
      ['Rapor olarak alınabilir mi?', 'Evet. Gelişim verileri rapor ve Excel çıktısı olarak dışa aktarılabilir.'],
    ],
  },
  'su-uyku-kilo-takibi': {
    icon: Waves,
    accent: '#14b8a6',
    title: 'Su, Uyku ve',
    titleAccent: 'Kilo Takibi',
    metaTitle: 'Su, Uyku ve Kilo Takip Uygulaması | Full Balance',
    description: 'Günlük su hedefi, uyku süresi, kilo trendi ve vücut ölçülerini takip eden ücretsiz sağlık ve fitness takip uygulaması.',
    keywords: 'su takip uygulaması, uyku takip, kilo takip, vücut ölçüsü takip',
    heroCopy: 'Günlük alışkanlıkları basit kayıtlarla görünür hale getir; denge puanını ve hedef ilerlemesini takip et.',
    sections: [
      { title: 'Su hedefi', body: 'Günlük bardak hedefi ve hatırlatma mantığıyla su tüketimi daha düzenli izlenir.' },
      { title: 'Uyku kaydı', body: 'Uyku süresi haftalık değerlendirmeye dahil edilir ve toparlanma takibine destek olur.' },
      { title: 'Kilo trendi', body: 'Tek günlük dalgalanma yerine kayıt geçmişiyle daha anlamlı değişim izlenir.' },
    ],
    faqs: [
      ['Su takibi nasıl çalışır?', 'Günlük hedefe göre bardak kayıtları tutulur ve ilerleme panelde görünür.'],
      ['Uyku verisi rapora girer mi?', 'Evet. Uyku verileri rapor ve denge değerlendirmesine dahil edilir.'],
      ['Kilo trendi rapora dahil olur mu?', 'Evet. Kilo bilgisi gelişim raporuna dahil edilebilir.'],
    ],
  },
  'yoga-pilates-reformer': {
    icon: Target,
    accent: '#a855f7',
    title: 'Yoga, Pilates ve',
    titleAccent: 'Reformer Planları',
    metaTitle: 'Yoga, Pilates ve Reformer Programları | Full Balance',
    description: 'Yoga, pilates, reformer ve meditasyon hedefleri için esneklik, core, postür, nefes ve zihinsel denge odaklı ücretsiz planlar.',
    keywords: 'yoga uygulaması, pilates programı, reformer programı, meditasyon uygulaması',
    heroCopy: 'Fitness dışındaki wellness hedefleri de aynı kişisel plan, takip ve rapor yapısına dahil edilir.',
    sections: [
      { title: 'Yoga ve mobilite', body: 'Esneklik, mobilite, nefes ve poz akışlarıyla daha dengeli bir pratik oluşturulur.' },
      { title: 'Pilates ve core', body: 'Core stabilitesi, postür ve kontrollü hareket düzeni için hedefe uygun planlar sunulur.' },
      { title: 'Reformer ve direnç', body: 'Reformer hedefinde direnç, kontrollü progresyon ve tam vücut çalışma mantığı öne çıkar.' },
    ],
    faqs: [
      ['Full Balance sadece fitness mı?', 'Hayır. Yoga, pilates, reformer ve meditasyon hedefleri de vardır.'],
      ['Pilates programı ücretsiz mi?', 'Evet. Pilates ve reformer planları da ücretsizdir.'],
      ['Meditasyon destekleniyor mu?', 'Evet. Meditasyon hedefinde nefes, odak ve zihinsel denge pratikleri bulunur.'],
    ],
  },
  'excel-rapor-disari-aktarma': {
    icon: FileDown,
    accent: '#0ea5e9',
    title: 'Excel ve Rapor',
    titleAccent: 'Dışa Aktarma',
    metaTitle: 'Excel ve Fitness Raporu Dışa Aktarma | Full Balance',
    description: 'Antrenman, kilo, ölçüm, su, uyku ve ilerleme verilerini Excel ve rapor formatında dışa aktaran ücretsiz fitness takip uygulaması.',
    keywords: 'fitness excel export, antrenman raporu indir, gelişim raporu, fitness verileri dışa aktarma',
    heroCopy: 'Veriler uygulamada kalmak zorunda değil; gelişim kayıtlarını paylaşılabilir rapora ve Excel çıktısına dönüştür.',
    sections: [
      { title: 'Excel çıktısı', body: 'Kilo, ölçüm, su, uyku ve antrenman kayıtları düzenli tablo formatında dışa aktarılabilir.' },
      { title: 'Rapor indir', body: 'Kişisel takip için özetlenmiş gelişim raporu indirilebilir ve paylaşılabilir.' },
      { title: 'Veri sahipliği', body: 'Kullanıcının ilerleme verisini dışa alabilmesi, uygulamaya güveni ve taşınabilirliği artırır.' },
    ],
    faqs: [
      ['Excel dışa aktarma var mı?', 'Evet. İlerleme verileri Excel formatında indirilebilir.'],
      ['PDF/rapor indirilebilir mi?', 'Evet. Gelişim raporu indirilebilir ve paylaşılabilir.'],
      ['Hangi veriler aktarılır?', 'Kilo, ölçümler, su, uyku, antrenman ve ilerleme verileri aktarılabilir.'],
    ],
  },
};

const supportCards = [
  { icon: Shield, text: 'Kredi kartı yok' },
  { icon: Award, text: 'Premium duvarı yok' },
  { icon: BarChart3, text: 'Takip ve rapor dahil' },
  { icon: Scale, text: 'Kişisel metrikler' },
  { icon: Moon, text: 'Uyku ve toparlanma' },
  { icon: Flame, text: 'Hedef odaklı plan' },
];

function upsertMeta(selector, createAttrs, content) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(createAttrs).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonical(url) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', url);
}

function useSeo(page, slug) {
  useEffect(() => {
    const url = `${BASE_URL}/${slug}`;
    document.documentElement.lang = 'tr';
    document.title = page.metaTitle;
    upsertCanonical(url);
    upsertMeta('meta[name="description"]', { name: 'description' }, page.description);
    upsertMeta('meta[name="keywords"]', { name: 'keywords' }, page.keywords);
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, page.metaTitle);
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, page.description);
    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, url);
    upsertMeta('meta[property="og:image"]', { property: 'og:image' }, OG_IMAGE);
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, page.metaTitle);
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, page.description);
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, OG_IMAGE);

    const scriptId = 'seo-page-json-ld';
    document.getElementById(scriptId)?.remove();
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: page.metaTitle,
          description: page.description,
          inLanguage: 'tr',
          isPartOf: { '@id': `${BASE_URL}/#website` },
          about: { '@id': `${BASE_URL}/#app` },
        },
        {
          '@type': 'FAQPage',
          '@id': `${url}#faq`,
          mainEntity: page.faqs.map(([question, answer]) => ({
            '@type': 'Question',
            name: question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: answer,
            },
          })),
        },
      ],
    });
    document.head.appendChild(script);
    return () => document.getElementById(scriptId)?.remove();
  }, [page, slug]);
}

export default function SeoLandingPage({ slug }) {
  const pageExists = Boolean(pages[slug]);
  const page = pages[slug] || pages['ucretsiz-fitness-uygulamasi'];
  const canonicalSlug = pageExists ? slug : 'ucretsiz-fitness-uygulamasi';

  useSeo(page, canonicalSlug);
  if (!pageExists) return <Navigate to="/" replace />;
  const Icon = page.icon;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:pb-24 sm:pt-28">
        <div className="absolute left-1/2 top-0 h-[520px] w-[min(900px,100vw)] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <nav className="mb-14 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 font-outfit text-sm font-bold text-white">
              <Sparkles size={18} className="text-orange-400" />
              FULL BALANCE
            </Link>
            <Link
              to="/auth"
              className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/20"
            >
              Ücretsiz Başla
            </Link>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
                style={{ borderColor: `${page.accent}55`, color: page.accent, backgroundColor: `${page.accent}12` }}
              >
                <Icon size={14} />
                Tamamen ücretsiz
              </div>
              <h1 className="font-outfit text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                {page.title}{' '}
                <span className="bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">
                  {page.titleAccent}
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
                {page.heroCopy}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/auth"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-blue-500 px-6 py-4 font-outfit text-sm font-bold text-white shadow-xl shadow-orange-500/20"
                >
                  Ücretsiz Hesap Oluştur
                  <ChevronRight size={16} />
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700/60 px-6 py-4 font-outfit text-sm font-bold text-slate-300"
                >
                  Ana Sayfayı Gör
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-5 shadow-2xl shadow-black/20">
              <div className="grid grid-cols-2 gap-3">
                {supportCards.map((card) => {
                  const CardIcon = card.icon;
                  return (
                    <div key={card.text} className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4">
                      <CardIcon size={20} className="mb-3 text-orange-400" />
                      <p className="font-outfit text-sm font-bold text-white">{card.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800/60 bg-slate-900/35 px-4 py-14">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {page.sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-slate-800/70 bg-slate-950/55 p-6">
              <CheckCircle2 size={22} className="mb-4" style={{ color: page.accent }} />
              <h2 className="font-outfit text-lg font-bold text-white">{section.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-400">SSS</p>
            <h2 className="mt-3 font-outfit text-3xl font-extrabold text-white">Sık Sorulan Sorular</h2>
          </div>
          <div className="space-y-4">
            {page.faqs.map(([question, answer]) => (
              <article key={question} className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-5">
                <h3 className="font-outfit text-base font-bold text-white">{question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{answer}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 rounded-2xl border border-orange-500/25 bg-orange-500/10 p-6 text-center">
            <p className="text-sm leading-relaxed text-orange-100">
              Full Balance tıbbi tavsiye sunmaz. Egzersiz veya beslenme programına başlamadan önce sağlık uzmanına danışılması önerilir.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export const SEO_PAGE_SLUGS = Object.keys(pages);
