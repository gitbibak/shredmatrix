// Values must match profiles_heard_from_check in
// supabase/migrations/20261105120000_profile_heard_from.sql.
export const HEARD_FROM_OPTIONS = ['instagram', 'tiktok', 'youtube', 'google', 'ai_assistant', 'friend', 'forum', 'other'];

export const heardFromCopy = {
  tr: {
    title: 'Full Balance\'ı nereden duydun?',
    desc: 'Tek dokunuş yeterli. Daha çok kişiye ulaşmamıza yardım eder.',
    dismiss: 'Soruyu kapat',
    thanks: 'Teşekkürler! Cevabın kaydedildi.',
    error: 'Kaydedilemedi. Bağlantını kontrol edip tekrar dene.',
    options: { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', google: 'Google araması', ai_assistant: 'ChatGPT / yapay zekâ', friend: 'Arkadaş / aile', forum: 'Forum / Reddit / Ekşi', other: 'Diğer' },
    adminLabel: 'Nereden duydu',
  },
  en: {
    title: 'How did you hear about Full Balance?',
    desc: 'One tap is enough. It helps us reach more people.',
    dismiss: 'Close question',
    thanks: 'Thanks! Your answer was saved.',
    error: 'Could not save. Check your connection and try again.',
    options: { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', google: 'Google search', ai_assistant: 'ChatGPT / AI assistant', friend: 'Friend / family', forum: 'Forum / Reddit', other: 'Other' },
    adminLabel: 'Heard from',
  },
  es: {
    title: '¿Cómo conociste Full Balance?',
    desc: 'Basta con un toque. Nos ayuda a llegar a más personas.',
    dismiss: 'Cerrar pregunta',
    thanks: '¡Gracias! Tu respuesta se guardó.',
    error: 'No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.',
    options: { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', google: 'Búsqueda en Google', ai_assistant: 'ChatGPT / asistente de IA', friend: 'Amigo / familia', forum: 'Foro / Reddit', other: 'Otro' },
    adminLabel: 'Cómo nos conoció',
  },
};
