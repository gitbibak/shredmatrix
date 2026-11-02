// Optional "buy me a protein shake" support. Everything in the app stays free;
// the buttons stay hidden until SUPPORT_URL is set to the founder's own page
// (Buy Me a Coffee or similar), so nothing points at a page that does not exist.
export const SUPPORT_URL = '';

export function isSupportEnabled(url = SUPPORT_URL) {
  return /^https:\/\/[^\s]+$/.test(url);
}

export const supportCopy = {
  tr: {
    title: 'Full Balance\'a destek ol',
    short: 'Full Balance ücretsiz ve reklamsız. Beğendiysen bir protein shake ısmarlayarak gelişimine destek olabilirsin 🥤',
    afterWorkout: 'Antrenmanı bitirdin! Full Balance ücretsiz kalsın diye bir protein shake ısmarlar mısın? 🥤',
    cta: 'Bir protein shake ısmarla',
    why: 'Neden destek?',
    footer: 'Destek ol 🥤',
    long: [
      'Merhaba, ben Tolga 👋',
      'Full Balance\'ı, herkesin kişisel antrenman ve beslenme planına ücretsiz ulaşabilmesi için geliştiriyorum. Abonelik, reklam ya da premium duvarı yok, bundan sonra da olmayacak.',
      'Uygulamanın sunucuları, yapay zekâ araçları ve sürekli geliştirilmesi bir maliyet ve emek gerektiriyor. Verdiğin destek; Full Balance\'ın ayakta kalmasına, yeni özelliklerin eklenmesine, bu işe zaman ayırıp hayatımı sürdürebilmeme ve yeni projeler geliştirebilmeme yardımcı oluyor.',
      'Destek olmak tamamen isteğe bağlı; uygulamanın her özelliği herkes için ücretsiz kalacak. Bir protein shake ısmarlarsan çok mutlu olurum 🥤 Kullandığın ve paylaştığın için de ayrıca teşekkür ederim.',
    ],
  },
  en: {
    title: 'Support Full Balance',
    short: 'Full Balance is free and ad-free. If it helps you, you can support its development with a protein shake 🥤',
    afterWorkout: 'Workout done! Want to keep Full Balance free by buying me a protein shake? 🥤',
    cta: 'Buy me a protein shake',
    why: 'Why support?',
    footer: 'Support 🥤',
    long: [
      'Hi, I\'m Tolga 👋',
      'I build Full Balance so anyone can get a personal training and nutrition plan for free. No subscription, no ads, no premium wall, and that won\'t change.',
      'Servers, AI tools and ongoing development take time and money. Your support keeps Full Balance running, funds new features, and helps me keep doing this work, make a living and build new projects.',
      'Supporting is completely optional; every feature stays free for everyone. If you\'d like to buy me a protein shake, I\'d be really grateful 🥤 And thank you for using and sharing the app.',
    ],
  },
  es: {
    title: 'Apoya a Full Balance',
    short: 'Full Balance es gratis y sin anuncios. Si te ayuda, puedes apoyar su desarrollo invitándome a un batido de proteínas 🥤',
    afterWorkout: '¡Entreno terminado! ¿Me invitas a un batido de proteínas para que Full Balance siga siendo gratis? 🥤',
    cta: 'Invítame a un batido de proteínas',
    why: '¿Por qué apoyar?',
    footer: 'Apoyar 🥤',
    long: [
      'Hola, soy Tolga 👋',
      'Desarrollo Full Balance para que cualquiera pueda tener un plan personal de entrenamiento y nutrición gratis. Sin suscripción, sin anuncios ni muros premium, y seguirá así.',
      'Los servidores, las herramientas de IA y el desarrollo continuo requieren tiempo y dinero. Tu apoyo mantiene Full Balance en marcha, financia nuevas funciones y me ayuda a seguir dedicándome a esto, ganarme la vida y crear nuevos proyectos.',
      'Apoyar es totalmente opcional; todas las funciones seguirán siendo gratuitas para todos. Si quieres invitarme a un batido de proteínas, te lo agradeceré mucho 🥤 Y gracias por usar y compartir la app.',
    ],
  },
};

export function supportText(lang) {
  return supportCopy[lang] || supportCopy.en;
}
