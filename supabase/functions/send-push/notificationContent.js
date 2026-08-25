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
