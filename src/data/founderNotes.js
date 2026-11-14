// Note from the founder on the Today tab. The first note whose dates include
// today is active; each member sees it once. Only describe things that really
// shipped (see src/data/changelog.js). A note with primary: 'support' leads
// with the support link and follows the support ask rules (not in the first
// 3 days, never after a low rating).
export const FOUNDER_NOTES = [
  {
    id: '2026-11-support',
    from: '2026-11-15',
    until: '2026-12-14',
    primary: 'support',
    tr: {
      title: 'Kurucudan bir rica',
      body: 'Merhaba, ben Tolga 👋 Full Balance\'ı tek başıma geliştiriyorum ve her özelliğini ücretsiz, reklamsız tutuyorum. Sunucular ve fotoğrafla kalori analizi her ay bir maliyet çıkarıyor. Uygulama işine yarıyorsa bir protein shake ısmarlayarak ücretsiz kalmasına destek olabilirsin. Mümkün değilse hiç sorun değil; kısa bir yorum da en az o kadar değerli.',
      idea: 'Fikrini yaz', review: 'Yorum yap', support: 'Protein shake ısmarla 🥤', close: 'Kapat',
    },
    en: {
      title: 'A small ask from the founder',
      body: 'Hi, I\'m Tolga 👋 I build Full Balance on my own and keep every feature free and ad-free. Servers and photo calorie analysis cost money every month. If the app helps you, buying me a protein shake helps keep it free. If that is not possible, no problem at all; a short review is just as valuable.',
      idea: 'Share an idea', review: 'Write a review', support: 'Buy me a protein shake 🥤', close: 'Close',
    },
    es: {
      title: 'Una pequeña petición del fundador',
      body: 'Hola, soy Tolga 👋 Desarrollo Full Balance yo solo y mantengo todas sus funciones gratis y sin anuncios. Los servidores y el análisis de calorías con foto cuestan dinero cada mes. Si la app te ayuda, invitarme a un batido de proteínas ayuda a que siga siendo gratis. Si no es posible, ningún problema; una reseña breve vale igual.',
      idea: 'Compartir una idea', review: 'Escribir una reseña', support: 'Invítame a un batido 🥤', close: 'Cerrar',
    },
  },
  {
    id: '2026-11',
    from: '2026-11-06',
    until: '2026-12-05',
    tr: {
      title: 'Kurucudan bir not',
      body: 'Merhaba, ben Tolga 👋 Bu ay Full Balance\'a 28 günlük challenge\'ı, yazdırılabilir antrenman takvimini ve yemek kalori tablolarını ekledim; uygulamanın ikonu ve ana sayfası da yenilendi. Sıradaki özelliği senin fikrinle seçmek istiyorum: en çok neyi eksik buluyorsun?',
      idea: 'Fikrini yaz', review: 'Yorum yap', support: 'Destek ol 🥤', close: 'Kapat',
    },
    en: {
      title: 'A note from the founder',
      body: 'Hi, I\'m Tolga 👋 This month I added the 28-day challenge, a printable workout calendar and home-dish calorie tables, and the app got a new icon and home page. I\'d like to pick the next feature with you: what do you miss most?',
      idea: 'Share an idea', review: 'Write a review', support: 'Support 🥤', close: 'Close',
    },
    es: {
      title: 'Una nota del fundador',
      body: 'Hola, soy Tolga 👋 Este mes añadí el reto de 28 días, un calendario de entreno imprimible y tablas de calorías de platos caseros, y la app estrenó icono y página de inicio. Quiero elegir la próxima función contigo: ¿qué echas más en falta?',
      idea: 'Compartir una idea', review: 'Escribir una reseña', support: 'Apoyar 🥤', close: 'Cerrar',
    },
  },
];

export function activeFounderNote(today = new Date().toISOString().slice(0, 10)) {
  return FOUNDER_NOTES.find((note) => note.from <= today && today <= note.until) || null;
}
