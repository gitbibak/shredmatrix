// Monthly note from the founder on the Today tab. One active note at a time;
// each member sees it until they act on it or close it. Only describe things
// that really shipped (see src/data/changelog.js).
export const FOUNDER_NOTES = [
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
