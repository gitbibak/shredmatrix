export const BLOG_LANGUAGES = ['tr', 'en', 'es'];

export function getArticleLanguage(article) {
  return BLOG_LANGUAGES.includes(article?.language) ? article.language : 'tr';
}

export function getBlogPath(language = 'tr') {
  return language === 'en' || language === 'es' ? `/${language}/blog` : '/blog';
}

export function getArticlePath(article) {
  return `${getBlogPath(getArticleLanguage(article))}/${article.slug}`;
}

export function getBlogLanguage(pathname = '') {
  if (pathname === '/en/blog' || pathname.startsWith('/en/blog/')) return 'en';
  if (pathname === '/es/blog' || pathname.startsWith('/es/blog/')) return 'es';
  return 'tr';
}

const copy = {
  tr: {
    locale: 'tr-TR', languageName: 'Türkçe', indexTitle: 'Sağlıklı Yaşam ve Longevity Rehberleri | Full Balance',
    indexDescription: 'Antrenman, beslenme, uyku, mobilite ve longevity hakkında uygulanabilir, kaynaklı ve ücretsiz Full Balance rehberleri.',
    schemaName: 'Full Balance Rehber', guide: 'Rehber', eyebrow: 'Kaynaklı ve uygulanabilir içerikler',
    heading: 'Sağlıklı yaşamı karmaşıklaştırmadan anlayın.',
    lead: 'Antrenman, beslenme, uyku, mobilite ve longevity hakkında sade rehberler. Tıbbi vaatler değil, sürdürülebilir alışkanlıklar.',
    read: 'Rehberi oku', readAria: 'rehberini oku', allGuides: 'Tüm rehberler', home: 'Ana Sayfa',
    published: 'Yayın', updated: 'Güncelleme', author: 'Full Balance Editör Ekibi',
    relatedToolsAria: 'İlgili Full Balance araçları', relatedTools: 'İlgili araçlar ve programlar',
    disclaimer: 'Bu içerik genel bilgilendirme amaçlıdır; tıbbi tanı veya tedavi önerisi değildir. Sağlık durumunuza uygun kararlar için doktorunuza danışın.',
    editorialHeading: 'Bu rehber nasıl hazırlandı?', editorialBody: 'İçerik birincil ve kurumsal sağlık kaynakları temel alınarak hazırlanır; tıbbi vaat içermez ve önemli güncellemelerde yeniden değerlendirilir.',
    editorialLink: 'Yayın ilkelerimizi incele', sources: 'Kaynaklar', related: 'İlgili rehberler',
    ctaTitle: 'Alışkanlıklarını tek yerde takip et', ctaDescription: 'Antrenman, uyku, beslenme, mobilite ve kişisel longevity görünümü ücretsiz.', ctaLabel: 'Ücretsiz başla',
    indexCtaTitle: 'Takibi uygulamada sadeleştirin', indexCtaDescription: 'Altı kişisel modül, beslenme ve longevity takibi tamamen ücretsiz.',
    editorialFooter: 'Yayın ilkeleri ve içerik süreci',
  },
  en: {
    locale: 'en-US', languageName: 'English', indexTitle: 'Health and Longevity Guides | Full Balance',
    indexDescription: 'Practical, sourced guides to training, nutrition, sleep, mobility, and healthy aging.',
    schemaName: 'Full Balance Guides', guide: 'Guides', eyebrow: 'Evidence-based, practical guides',
    heading: 'Make healthy living easier to understand.',
    lead: 'Clear guides to training, nutrition, sleep, mobility, and longevity. Sustainable habits without medical promises.',
    read: 'Read guide', readAria: 'Read guide:', allGuides: 'All guides', home: 'Home',
    published: 'Published', updated: 'Updated', author: 'Full Balance Editorial Team',
    relatedToolsAria: 'Related Full Balance tools', relatedTools: 'Related tools and programs',
    disclaimer: 'This content is for general information only and is not medical diagnosis or treatment advice. Consult your doctor about decisions related to your health.',
    editorialHeading: 'How was this guide prepared?', editorialBody: 'We use primary and institutional health sources, make no medical promises, and review important updates.',
    editorialLink: 'Read our editorial policy', sources: 'Sources', related: 'Related guides',
    ctaTitle: 'Track your habits in one place', ctaDescription: 'Track training, sleep, nutrition, mobility, and your personal longevity overview for free.', ctaLabel: 'Get started free',
    indexCtaTitle: 'Make tracking simpler', indexCtaDescription: 'Six personal modules, nutrition, and longevity tracking are free.',
    editorialFooter: 'Editorial policy and content process',
  },
  es: {
    locale: 'es-ES', languageName: 'Español', indexTitle: 'Guías de Salud y Longevidad | Full Balance',
    indexDescription: 'Guías prácticas y documentadas sobre entrenamiento, nutrición, sueño, movilidad y envejecimiento saludable.',
    schemaName: 'Guías Full Balance', guide: 'Guías', eyebrow: 'Contenido práctico con fuentes',
    heading: 'Entiende la vida saludable sin complicaciones.',
    lead: 'Guías claras sobre entrenamiento, nutrición, sueño, movilidad y longevidad. Hábitos sostenibles sin promesas médicas.',
    read: 'Leer guía', readAria: 'Leer guía:', allGuides: 'Todas las guías', home: 'Inicio',
    published: 'Publicado', updated: 'Actualizado', author: 'Equipo editorial de Full Balance',
    relatedToolsAria: 'Herramientas relacionadas de Full Balance', relatedTools: 'Herramientas y programas relacionados',
    disclaimer: 'Este contenido es solo informativo y no constituye diagnóstico ni tratamiento médico. Consulta a tu médico para decisiones sobre tu salud.',
    editorialHeading: '¿Cómo se preparó esta guía?', editorialBody: 'Usamos fuentes sanitarias primarias e institucionales, evitamos las promesas médicas y revisamos las actualizaciones importantes.',
    editorialLink: 'Lee nuestra política editorial', sources: 'Fuentes', related: 'Guías relacionadas',
    ctaTitle: 'Sigue tus hábitos en un solo lugar', ctaDescription: 'Registra entrenamiento, sueño, nutrición, movilidad y tu panorama personal de longevidad gratis.', ctaLabel: 'Empieza gratis',
    indexCtaTitle: 'Simplifica el seguimiento', indexCtaDescription: 'Seis módulos personales, nutrición y seguimiento de longevidad gratis.',
    editorialFooter: 'Política editorial y proceso de contenido',
  },
};

export function getBlogCopy(language = 'tr') {
  return copy[language] || copy.tr;
}
