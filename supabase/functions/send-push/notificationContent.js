export const NOTIFICATION_CONTENT = {
  tr: {
    messages: [
      {
        title: 'Bugün için tek adım',
        body: 'Planını aç ve sıradaki adımı tamamla. Küçük bir başlangıç yeter.',
        category: 'next_step',
      },
      {
        title: '2 dakikalık kontrol',
        body: 'Antrenman, su veya uyku: Bugün ekranında birini güncelle.',
        category: 'check_in',
      },
      {
        title: 'Rutinini bugün sürdür',
        body: 'Tek bir kayıt bile haftalık ilerlemeni görünür kılar.',
        category: 'routine',
      },
    ],
  },
  en: {
    messages: [
      {
        title: 'One step for today',
        body: 'Open Today and complete your next step. A small start is enough.',
        category: 'next_step',
      },
      {
        title: 'A 2-minute check-in',
        body: 'Workout, water, or sleep: update one item on Today.',
        category: 'check_in',
      },
      {
        title: 'Keep your routine going',
        body: 'Even one quick log makes your weekly progress visible.',
        category: 'routine',
      },
    ],
  },
  es: {
    messages: [
      {
        title: 'Un paso para hoy',
        body: 'Abre Hoy y completa tu siguiente paso. Un pequeño comienzo basta.',
        category: 'next_step',
      },
      {
        title: 'Un control de 2 minutos',
        body: 'Entrenamiento, agua o sueño: actualiza uno en Hoy.',
        category: 'check_in',
      },
      {
        title: 'Mantén tu rutina',
        body: 'Un solo registro hace visible tu progreso semanal.',
        category: 'routine',
      },
    ],
  },
};

function stableIndex(value, length) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) % length;
}

export function getDailyNotification(language, localDate, subscriptionId) {
  const safeLanguage = Object.hasOwn(NOTIFICATION_CONTENT, language) ? language : 'en';
  const content = NOTIFICATION_CONTENT[safeLanguage];
  const message = content.messages[stableIndex(`${localDate}:${subscriptionId}`, content.messages.length)];

  return {
    ...message,
    language: safeLanguage,
    url: `/dashboard?entry=push&message=${message.category}`,
  };
}

// One-off notes from the founder that replace a day's reminder (not water
// breaks) for everyone with notifications on. Keep them rare: at most one a
// month, and only for things members would want to know.
export const PUSH_ANNOUNCEMENTS = [
  {
    date: '2026-11-15',
    category: 'founder_support',
    tr: ['Kurucudan bir rica 🥤', 'Full Balance ücretsiz ve reklamsız kalsın diye küçük bir destek isteğim var. Detaylar Bugün ekranında.'],
    en: ['A small ask from the founder 🥤', 'A short note on keeping Full Balance free and ad-free. Details on your Today screen.'],
    es: ['Una pequeña petición del fundador 🥤', 'Una nota breve para que Full Balance siga gratis y sin anuncios. Detalles en tu pantalla Hoy.'],
  },
];

export function announcementFor(language, localDate, kind) {
  if (kind === 'water') return null;
  const note = PUSH_ANNOUNCEMENTS.find((item) => item.date === localDate);
  if (!note) return null;
  const safeLanguage = ['tr', 'en', 'es'].includes(language) ? language : 'en';
  const [title, body] = note[safeLanguage];
  return {
    title,
    body,
    category: note.category,
    language: safeLanguage,
    url: `/dashboard?entry=push&message=${note.category}`,
  };
}
