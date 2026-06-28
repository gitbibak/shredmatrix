import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve('output/marketing-kit');
const ASSET_DIR = path.join(ROOT, 'assets');
const REVIEW_DIR = path.join(ROOT, 'review');
const HTML_PATH = path.join(REVIEW_DIR, 'asset-board.html');
const REVIEW_BOARD_PATH = path.join(REVIEW_DIR, 'review-board.html');
const skipScreenshots = process.env.SKIP_SCREENSHOTS === '1';

if (!skipScreenshots) {
  fs.rmSync(ASSET_DIR, { recursive: true, force: true });
  fs.rmSync(REVIEW_DIR, { recursive: true, force: true });
}

for (const dir of [
  ASSET_DIR,
  REVIEW_DIR,
  path.join(ASSET_DIR, 'producthunt'),
  path.join(ASSET_DIR, 'gumroad'),
  path.join(ASSET_DIR, 'social'),
  path.join(ASSET_DIR, 'revenuecat'),
  path.join(ASSET_DIR, 'campaigns'),
]) {
  fs.mkdirSync(dir, { recursive: true });
}

const shots = {
  landingDesktop: '../source-screenshots/landing-desktop.png',
  landingMobile: '../source-screenshots/landing-mobile.png',
  onboardingMobile: '../source-screenshots/onboarding-mobile.png',
  nutritionDesktop: '../source-screenshots/dashboard-nutrition-desktop.png',
  nutritionMobile: '../source-screenshots/dashboard-nutrition-mobile.png',
  workoutDesktop: '../source-screenshots/dashboard-workout-desktop.png',
  workoutMobile: '../source-screenshots/dashboard-workout-mobile.png',
  progressDesktop: '../source-screenshots/dashboard-progress-desktop.png',
  progressMobile: '../source-screenshots/dashboard-progress-mobile.png',
  achievementsDesktop: '../source-screenshots/dashboard-achievements-desktop.png',
  profileDesktop: '../source-screenshots/dashboard-profile-desktop.png',
  shareCard: '../source-screenshots/share-card-modal.png',
};

const locales = {
  en: {
    label: 'English',
    freeBadge: 'FREE FOREVER',
    foreverBadge: 'FREE FOREVER',
    noCard: 'No card',
    noPaywall: 'No paywall',
    mobilePwa: 'Mobile-first PWA',
    heroTitle: 'Free forever.<br/><span>One balanced plan.</span>',
    heroText: 'Full Balance turns personal metrics into a daily wellness dashboard for workouts, meals, water, sleep, progress and consistency. No paywall, no card, no subscription.',
    nutritionTitle: 'Nutrition that changes with the training day.',
    nutritionText: 'Macro targets, meal plans, calorie lookup, water and sleep tracking live in the same flow.',
    workoutTitle: 'Training plans with phase logic.',
    workoutText: 'Weekly split, exercise details, rest timer, supplement guide and a program advisor help the plan stay actionable.',
    progressTitle: 'Progress is more than a number.',
    progressText: 'Weight, body fat, weekly summaries and body measurements make small consistency signals visible.',
    achievementsTitle: 'Make consistency feel worth coming back to.',
    achievementsText: 'Badges, progress photos, profile stats, data export and share cards turn the app into a personal wellness record.',
    mobileTitle: 'Designed for the phone first.',
    mobileText: 'Start with onboarding, then check in from the dashboard whenever the day changes. Always free, always open.',
    gumroadTitle: 'Completely free,<br/>forever.',
    gumroadText: 'A mobile-first balance system for workouts, nutrition, water, sleep, measurements and achievements. No card, no premium wall.',
    gumroadChip1: 'Always free',
    gumroadChip2: 'No card required',
    gumroadThumb: 'Free.<br/>Forever.<br/><span>Stay balanced.</span>',
    ogTitle: 'Completely free.<br/>Forever.',
    ogText: 'Full Balance keeps daily training and nutrition decisions in one calm flow. No card, no paywall.',
    squareTitle: 'Free.<br/><span>Forever.</span>',
    squareText: 'Nutrition · Workout · Progress · Achievements · Profile',
    storyTitle: 'Your daily plan<br/>in your pocket.',
    storyText: 'Calories, water, sleep, workouts and progress in one flow. Free forever.',
    revenueTitle: 'Free forever.<br/>No paywall.',
    revenueLead: 'Full Balance is built around a simple promise: every core wellness flow stays free.',
    revenueFeatures: [
      ['No subscription', 'No monthly plan, no yearly plan, no trial countdown.'],
      ['No premium wall', 'Nutrition, workouts, progress, achievements and profile remain open.'],
      ['No card required', 'Start from the web app without payment friction.'],
    ],
    revenueAccess: 'Full Balance Access',
    revenuePrice: '$0 forever',
    revenueNote: 'Use this as a no-paywall statement, not a paid offering.',
    revenueCta: 'Open fullbalance.app',
    revenueFooter: 'No purchase · No restore flow · Terms · Privacy',
    nutritionStats: [['$0', 'forever'], ['Macro', 'split'], ['Water', 'habit'], ['Sleep', 'check-in']],
    progressStats: [['-1.8 kg', 'sample trend'], ['50%', 'weekly completion'], ['6', 'entries'], ['$0', 'forever']],
    achievementChips: ['Achievements', 'Progress photos', 'Export', 'Share card'],
    mobileChips: ['Free forever', '5-step onboarding', 'Bottom navigation', 'PWA install'],
    campaign: {
      freeForever: {
        eyebrow: 'Free forever promise',
        title: 'No subscription pressure. Just the plan.',
        text: 'Full Balance stays open: workouts, nutrition, progress, achievements and profile with no card or premium wall.',
        bullets: ['No card', 'No paywall', '$0 forever'],
        cta: 'Start at fullbalance.app',
      },
      dailyLoop: {
        eyebrow: 'Daily loop',
        title: 'Plan, train, eat, track, repeat.',
        text: 'A single dashboard keeps the routine visible so the next action is easier to find.',
        bullets: ['Plan', 'Check in', 'Stay consistent'],
        cta: 'Open the daily dashboard',
      },
      nutrition: {
        eyebrow: 'Nutrition + habits',
        title: 'Meals, macros, water and sleep in one flow.',
        text: 'See the training day, calorie target, macro split and habit check-ins without switching tools.',
        bullets: ['Macro split', 'Water tracker', 'Sleep check-in'],
        cta: 'Build the nutrition plan',
      },
      workout: {
        eyebrow: 'Workout structure',
        title: 'Weekly split with phase logic.',
        text: 'Exercises, rest timing and program guidance help the plan stay actionable as the week moves.',
        bullets: ['Weekly split', 'Rest timer', 'Phase advisor'],
        cta: 'Follow the workout plan',
      },
      progress: {
        eyebrow: 'Progress proof',
        title: 'Make consistency visible.',
        text: 'Track weight, body fat, measurements, badges and weekly summaries before motivation disappears.',
        bullets: ['Measurements', 'Badges', 'Weekly report'],
        cta: 'Track the next signal',
      },
      mobileData: {
        eyebrow: 'Mobile web + data',
        title: 'Your wellness record travels light.',
        text: 'A responsive PWA with profile stats, progress photos, share cards and data export.',
        bullets: ['PWA', 'Share card', 'Data export'],
        cta: 'Use it from the browser',
      },
      personalPlan: {
        eyebrow: 'Personal plan',
        title: 'Your routine shapes the plan.',
        text: 'Onboarding turns your metrics, goal, experience and weekly rhythm into a dashboard you can actually use.',
        bullets: ['Metrics', 'Goal', 'Routine'],
        cta: 'Build your plan',
      },
      beginnerStart: {
        eyebrow: 'Beginner friendly',
        title: 'Start without knowing where to start.',
        text: 'Full Balance gives the first structure: what to train, what to eat, what to track and what to repeat.',
        bullets: ['Clear first step', 'Daily plan', 'No pressure'],
        cta: 'Start from today',
      },
      noAppSwitching: {
        eyebrow: 'One place',
        title: 'Stop splitting the routine across apps.',
        text: 'Workout, nutrition, habits, progress and profile stay close enough for daily check-ins.',
        bullets: ['Workout', 'Nutrition', 'Progress'],
        cta: 'Keep the loop together',
      },
      recoverySignals: {
        eyebrow: 'Recovery signals',
        title: 'Water and sleep count too.',
        text: 'The dashboard keeps small recovery signals beside calories, workouts and progress.',
        bullets: ['Water', 'Sleep', 'Balance score'],
        cta: 'Track the basics',
      },
      weeklyReflection: {
        eyebrow: 'Weekly rhythm',
        title: 'Your week has a pattern.',
        text: 'Weekly summaries make effort, missed days and consistency easier to notice without harsh judgement.',
        bullets: ['Week view', 'Signals', 'Next step'],
        cta: 'Review the week',
      },
      shareProgress: {
        eyebrow: 'Shareable progress',
        title: 'Share the effort, not the pressure.',
        text: 'Share cards make progress visible without turning wellness into a before-after promise.',
        bullets: ['Share card', 'Badges', 'Milestones'],
        cta: 'Create a share card',
      },
      dataExport: {
        eyebrow: 'Your data',
        title: 'Keep your wellness record portable.',
        text: 'Profile stats, progress photos and data export keep the history useful beyond one session.',
        bullets: ['Profile', 'Photos', 'Export'],
        cta: 'Export when needed',
      },
      multilingualPwa: {
        eyebrow: 'Browser-first access',
        title: 'Open it from the browser, in your language.',
        text: 'Full Balance is a responsive PWA with Turkish, English and Spanish interface support.',
        bullets: ['TR', 'EN', 'ES'],
        cta: 'Open fullbalance.app',
      },
    },
  },
  tr: {
    label: 'Türkçe',
    freeBadge: 'SONSUZA KADAR ÜCRETSİZ',
    foreverBadge: 'TAMAMEN ÜCRETSİZ',
    noCard: 'Kart yok',
    noPaywall: 'Paywall yok',
    mobilePwa: 'Mobil-first PWA',
    heroTitle: 'Sonsuza kadar ücretsiz.<br/><span>Tek dengeli plan.</span>',
    heroText: 'Full Balance kişisel metriklerini antrenman, öğün, su, uyku, ilerleme ve tutarlılık için günlük wellness paneline dönüştürür. Paywall yok, kart yok, abonelik yok.',
    nutritionTitle: 'Antrenman gününe göre değişen beslenme.',
    nutritionText: 'Makro hedefleri, öğün planı, kalori arama, su ve uyku takibi aynı akışta yaşar.',
    workoutTitle: 'Faz mantığı olan antrenman planları.',
    workoutText: 'Haftalık split, egzersiz detayları, dinlenme zamanlayıcısı, destek rehberi ve program danışmanı planı uygulanabilir tutar.',
    progressTitle: 'İlerleme tek sayıdan fazlası.',
    progressText: 'Kilo, yağ oranı, haftalık özet ve vücut ölçümleri küçük tutarlılık sinyallerini görünür yapar.',
    achievementsTitle: 'Tutarlılığı geri dönmeye değer hissettir.',
    achievementsText: 'Rozetler, gelişim fotoğrafları, profil istatistikleri, veri export ve paylaşım kartları kişisel wellness kaydı oluşturur.',
    mobileTitle: 'Önce telefon için tasarlandı.',
    mobileText: 'Onboarding ile başla, gün değiştikçe panelden hızlıca kontrol et. Her zaman ücretsiz, her zaman açık.',
    gumroadTitle: 'Tamamen ücretsiz,<br/>sonsuza kadar.',
    gumroadText: 'Antrenman, beslenme, su, uyku, ölçüm ve başarımlar için mobil-first bir denge sistemi. Kredi kartı yok, premium duvar yok.',
    gumroadChip1: 'Her zaman ücretsiz',
    gumroadChip2: 'Kredi kartı gerekmez',
    gumroadThumb: 'Ücretsiz.<br/>Sonsuza kadar.<br/><span>Dengede kal.</span>',
    ogTitle: 'Tamamen ücretsiz.<br/>Sonsuza kadar.',
    ogText: 'Full Balance günlük antrenman ve beslenme kararlarını tek sakin akışta toplar. Kredi kartı yok, paywall yok.',
    squareTitle: 'Ücretsiz.<br/><span>Sonsuza kadar.</span>',
    squareText: 'Beslenme · Antrenman · İlerleme · Başarım · Profil',
    storyTitle: 'Günün planı<br/>cebinde.',
    storyText: 'Kalori, su, uyku, antrenman ve ilerleme tek akışta. Sonsuza kadar ücretsiz.',
    revenueTitle: 'Sonsuza kadar ücretsiz.<br/>Paywall yok.',
    revenueLead: 'Full Balance basit bir söz üzerine kurulu: tüm temel wellness akışı ücretsiz kalır.',
    revenueFeatures: [
      ['Abonelik yok', 'Aylık plan, yıllık plan veya deneme sayacı yok.'],
      ['Premium duvar yok', 'Beslenme, antrenman, ilerleme, başarımlar ve profil açık kalır.'],
      ['Kart gerekmez', 'Ödeme sürtünmesi olmadan web uygulamasından başla.'],
    ],
    revenueAccess: 'Full Balance Erişimi',
    revenuePrice: '0 TL / sonsuza kadar',
    revenueNote: 'Bu ücretli teklif değil, ücretsiz erişim beyanıdır.',
    revenueCta: 'fullbalance.app aç',
    revenueFooter: 'Satın alma yok · Restore akışı yok · Şartlar · Gizlilik',
    nutritionStats: [['0 TL', 'sonsuza kadar'], ['Makro', 'dağılım'], ['Su', 'alışkanlık'], ['Uyku', 'check-in']],
    progressStats: [['-1.8 kg', 'örnek trend'], ['%50', 'haftalık tamamlama'], ['6', 'kayıt'], ['0 TL', 'sonsuza kadar']],
    achievementChips: ['Başarımlar', 'Gelişim fotoğrafı', 'Veri export', 'Paylaşım kartı'],
    mobileChips: ['Sonsuza kadar ücretsiz', '5 adım onboarding', 'Alt navigasyon', 'PWA kurulum'],
    campaign: {
      freeForever: {
        eyebrow: 'Ücretsiz kalma sözü',
        title: 'Abonelik baskısı yok. Sadece plan.',
        text: 'Full Balance açık kalır: antrenman, beslenme, ilerleme, başarımlar ve profil için kart ya da premium duvar yok.',
        bullets: ['Kart yok', 'Paywall yok', 'Sonsuza kadar 0 TL'],
        cta: 'fullbalance.app ile başla',
      },
      dailyLoop: {
        eyebrow: 'Günlük akış',
        title: 'Planla, çalış, beslen, takip et.',
        text: 'Tek panel rutini görünür tutar; sıradaki aksiyonu bulmak daha kolay olur.',
        bullets: ['Plan', 'Check-in', 'Tutarlılık'],
        cta: 'Günlük paneli aç',
      },
      nutrition: {
        eyebrow: 'Beslenme + alışkanlık',
        title: 'Öğün, makro, su ve uyku tek akışta.',
        text: 'Antrenman günü, kalori hedefi, makro dağılımı ve alışkanlık check-in’leri araç değiştirmeden görünür.',
        bullets: ['Makro dağılımı', 'Su takibi', 'Uyku girişi'],
        cta: 'Beslenme planını kur',
      },
      workout: {
        eyebrow: 'Antrenman yapısı',
        title: 'Faz mantığı olan haftalık split.',
        text: 'Egzersizler, dinlenme süresi ve program rehberi hafta ilerledikçe planı uygulanabilir tutar.',
        bullets: ['Haftalık split', 'Dinlenme sayacı', 'Faz danışmanı'],
        cta: 'Antrenman planını takip et',
      },
      progress: {
        eyebrow: 'İlerleme kanıtı',
        title: 'Tutarlılığı görünür yap.',
        text: 'Motivasyon kaybolmadan önce kilo, yağ oranı, ölçüm, rozet ve haftalık özetleri takip et.',
        bullets: ['Ölçümler', 'Rozetler', 'Haftalık rapor'],
        cta: 'Sıradaki sinyali kaydet',
      },
      mobileData: {
        eyebrow: 'Mobil web + veri',
        title: 'Wellness kaydın hafifçe yanında.',
        text: 'Profil istatistikleri, gelişim fotoğrafları, paylaşım kartları ve veri export ile responsive PWA.',
        bullets: ['PWA', 'Paylaşım kartı', 'Veri export'],
        cta: 'Tarayıcıdan kullan',
      },
      personalPlan: {
        eyebrow: 'Kişisel plan',
        title: 'Rutinin planı şekillendirir.',
        text: 'Onboarding; metriklerini, hedefini, deneyimini ve haftalık ritmini kullanılabilir bir panele dönüştürür.',
        bullets: ['Metrik', 'Hedef', 'Rutin'],
        cta: 'Planını kur',
      },
      beginnerStart: {
        eyebrow: 'Başlangıç dostu',
        title: 'Nereden başlayacağını bilmeden başla.',
        text: 'Full Balance ilk yapıyı verir: ne çalışılacak, ne yenilecek, ne takip edilecek ve ne tekrar edilecek.',
        bullets: ['İlk adım', 'Günlük plan', 'Baskı yok'],
        cta: 'Bugünden başla',
      },
      noAppSwitching: {
        eyebrow: 'Tek yer',
        title: 'Rutini uygulamalar arasında bölme.',
        text: 'Antrenman, beslenme, alışkanlık, ilerleme ve profil günlük check-in için aynı yerde kalır.',
        bullets: ['Antrenman', 'Beslenme', 'İlerleme'],
        cta: 'Akışı birlikte tut',
      },
      recoverySignals: {
        eyebrow: 'Toparlanma sinyalleri',
        title: 'Su ve uyku da sayılır.',
        text: 'Panel küçük toparlanma sinyallerini kalori, antrenman ve ilerleme yanında tutar.',
        bullets: ['Su', 'Uyku', 'Denge puanı'],
        cta: 'Temeli takip et',
      },
      weeklyReflection: {
        eyebrow: 'Haftalık ritim',
        title: 'Haftanın bir deseni var.',
        text: 'Haftalık özetler emeği, kaçan günleri ve tutarlılığı sert bir yargı olmadan görünür yapar.',
        bullets: ['Hafta görünümü', 'Sinyaller', 'Sonraki adım'],
        cta: 'Haftayı gözden geçir',
      },
      shareProgress: {
        eyebrow: 'Paylaşılabilir ilerleme',
        title: 'Baskıyı değil emeği paylaş.',
        text: 'Paylaşım kartları wellness deneyimini önce-sonra vaadine çevirmeden ilerlemeyi görünür yapar.',
        bullets: ['Paylaşım kartı', 'Rozetler', 'Kilometre taşları'],
        cta: 'Paylaşım kartı oluştur',
      },
      dataExport: {
        eyebrow: 'Senin verin',
        title: 'Wellness kaydın taşınabilir kalsın.',
        text: 'Profil istatistikleri, gelişim fotoğrafları ve veri export geçmişi tek oturumun ötesinde kullanışlı tutar.',
        bullets: ['Profil', 'Fotoğraflar', 'Export'],
        cta: 'Gerektiğinde dışa aktar',
      },
      multilingualPwa: {
        eyebrow: 'Tarayıcıdan erişim',
        title: 'Tarayıcıdan aç, kendi dilinde kullan.',
        text: 'Full Balance Türkçe, İngilizce ve İspanyolca arayüz desteği olan responsive bir PWA deneyimidir.',
        bullets: ['TR', 'EN', 'ES'],
        cta: 'fullbalance.app aç',
      },
    },
  },
};

function brand(size = 'normal') {
  return `<div class="brand ${size}"><span class="mark">✣</span><span>FULL<span>BALANCE</span></span></div>`;
}

function chips(items) {
  return `<div class="chips">${items.map((item) => `<span>${item}</span>`).join('')}</div>`;
}

function freeBadge(label) {
  return `<div class="free-badge">${label}</div>`;
}

function frame(src, cls = '') {
  return `<div class="frame ${cls}"><img src="${src}" /></div>`;
}

function phone(src, cls = '') {
  return `<div class="phone ${cls}"><img src="${src}" /></div>`;
}

function stats(items) {
  return `<div class="statgrid">${items.map(([value, label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join('')}</div>`;
}

function baseRenderers(id, t) {
  const renderers = {
    'producthunt-01-hero': () => `
      <div class="asset ph hero">
        <div class="rail"></div>
        ${freeBadge(t.freeBadge)}
        <div class="copy">
          ${brand('large')}
          <h1>${t.heroTitle}</h1>
          <p>${t.heroText}</p>
          ${chips([t.freeBadge, t.noCard, t.noPaywall, t.mobilePwa])}
        </div>
        ${frame(shots.nutritionDesktop, 'hero-frame')}
      </div>`,

    'producthunt-02-nutrition': () => `
      <div class="asset ph feature nutrition">
        ${freeBadge(t.freeBadge)}
        <div class="copy">
          ${brand()}
          <h1>${t.nutritionTitle}</h1>
          <p>${t.nutritionText}</p>
          ${stats(t.nutritionStats)}
        </div>
        ${frame(shots.nutritionDesktop, 'wide right')}
        ${phone(shots.nutritionMobile, 'floating')}
      </div>`,

    'producthunt-03-workout': () => `
      <div class="asset ph feature workout">
        ${freeBadge(t.freeBadge)}
        ${frame(shots.workoutDesktop, 'wide left')}
        <div class="copy rightcopy">
          ${brand()}
          <h1>${t.workoutTitle}</h1>
          <p>${t.workoutText}</p>
          ${chips(t.campaign.workout.bullets)}
        </div>
      </div>`,

    'producthunt-04-progress': () => `
      <div class="asset ph feature progress">
        ${freeBadge(t.freeBadge)}
        <div class="copy">
          ${brand()}
          <h1>${t.progressTitle}</h1>
          <p>${t.progressText}</p>
          ${stats(t.progressStats)}
        </div>
        ${frame(shots.progressDesktop, 'wide right')}
        ${phone(shots.progressMobile, 'floating smallphone')}
      </div>`,

    'producthunt-05-achievements': () => `
      <div class="asset ph feature achievements">
        ${freeBadge(t.freeBadge)}
        <div class="duo">
          ${frame(shots.achievementsDesktop, 'mini')}
          ${frame(shots.profileDesktop, 'mini')}
        </div>
        <div class="copy rightcopy">
          ${brand()}
          <h1>${t.achievementsTitle}</h1>
          <p>${t.achievementsText}</p>
          ${chips(t.achievementChips)}
        </div>
      </div>`,

    'producthunt-06-mobile': () => `
      <div class="asset ph mobile-story">
        ${freeBadge(t.freeBadge)}
        <div class="copy">
          ${brand()}
          <h1>${t.mobileTitle}</h1>
          <p>${t.mobileText}</p>
          ${chips(t.mobileChips)}
        </div>
        <div class="phones">
          ${phone(shots.onboardingMobile)}
          ${phone(shots.workoutMobile)}
          ${phone(shots.progressMobile)}
        </div>
      </div>`,

    'producthunt-thumbnail-240': () => `
      <div class="asset thumb">
        <div class="spark">✣</div>
        <div class="fb">FULL<br/><span>BALANCE</span></div>
        <div class="thumb-free">${t.label === 'Türkçe' ? 'ÜCRETSİZ' : 'FREE'}</div>
      </div>`,

    'gumroad-cover-1280x720': () => `
      <div class="asset gumroad cover">
        ${freeBadge(t.foreverBadge)}
        <div class="copy">
          ${brand('large')}
          <h1>${t.gumroadTitle}</h1>
          <p>${t.gumroadText}</p>
          ${chips([t.gumroadChip1, t.gumroadChip2, 'Web + PWA'])}
        </div>
        ${phone(shots.nutritionMobile, 'coverphone')}
        ${frame(shots.achievementsDesktop, 'coverframe')}
      </div>`,

    'gumroad-thumbnail-600': () => `
      <div class="asset gumroad square">
        ${brand('large')}
        <h1>${t.gumroadThumb}</h1>
        <p>fullbalance.app</p>
      </div>`,

    'social-og-1200x630': () => `
      <div class="asset og">
        ${freeBadge(t.freeBadge)}
        <div class="copy">
          ${brand()}
          <h1>${t.ogTitle}</h1>
          <p>${t.ogText}</p>
        </div>
        ${frame(shots.nutritionDesktop, 'ogframe')}
      </div>`,

    'social-square-1080': () => `
      <div class="asset social squarepost">
        ${brand('large')}
        <h1>${t.squareTitle}</h1>
        <p>${t.squareText}</p>
        ${phone(shots.nutritionMobile, 'squarephone')}
      </div>`,

    'social-story-1080x1920': () => `
      <div class="asset story">
        ${brand('large')}
        <h1>${t.storyTitle}</h1>
        <p>${t.storyText}</p>
        ${phone(shots.workoutMobile, 'storyphone')}
        <div class="cta">fullbalance.app</div>
      </div>`,

    'revenuecat-free-forever-1170x2532': () => `
      <div class="asset paywall">
        ${brand('large')}
        <h1>${t.revenueTitle}</h1>
        <p class="lead">${t.revenueLead}</p>
        ${phone(shots.progressMobile, 'payphone')}
        <div class="features">
          ${t.revenueFeatures.map(([title, body]) => `<div><strong>${title}</strong><span>${body}</span></div>`).join('')}
        </div>
        <div class="price">
          <span>${t.revenueAccess}</span>
          <strong>${t.revenuePrice}</strong>
          <em>${t.revenueNote}</em>
        </div>
        <div class="buy">${t.revenueCta}</div>
        <div class="restore">${t.revenueFooter}</div>
      </div>`,
  };

  return renderers[id]();
}

const baseAssets = [
  { id: 'producthunt-01-hero', folder: 'producthunt', width: 1270, height: 760, title: 'Product Hunt 01 Hero', point: 'Free forever hero' },
  { id: 'producthunt-02-nutrition', folder: 'producthunt', width: 1270, height: 760, title: 'Product Hunt 02 Nutrition', point: 'Nutrition and habits' },
  { id: 'producthunt-03-workout', folder: 'producthunt', width: 1270, height: 760, title: 'Product Hunt 03 Workout', point: 'Workout phase logic' },
  { id: 'producthunt-04-progress', folder: 'producthunt', width: 1270, height: 760, title: 'Product Hunt 04 Progress', point: 'Progress tracking' },
  { id: 'producthunt-05-achievements', folder: 'producthunt', width: 1270, height: 760, title: 'Product Hunt 05 Achievements', point: 'Achievements and profile' },
  { id: 'producthunt-06-mobile', folder: 'producthunt', width: 1270, height: 760, title: 'Product Hunt 06 Mobile', point: 'Mobile-first flow' },
  { id: 'producthunt-thumbnail-240', folder: 'producthunt', width: 240, height: 240, title: 'Product Hunt Thumbnail', point: 'Brand thumbnail' },
  { id: 'gumroad-cover-1280x720', folder: 'gumroad', width: 1280, height: 720, title: 'Gumroad Cover', point: 'Free forever listing cover' },
  { id: 'gumroad-thumbnail-600', folder: 'gumroad', width: 600, height: 600, title: 'Gumroad Thumbnail', point: 'Free forever square cover' },
  { id: 'social-og-1200x630', folder: 'social', width: 1200, height: 630, title: 'Open Graph', point: 'Free forever social preview' },
  { id: 'social-square-1080', folder: 'social', width: 1080, height: 1080, title: 'Square Social', point: 'Free forever square post' },
  { id: 'social-story-1080x1920', folder: 'social', width: 1080, height: 1920, title: 'Story/Reel Cover', point: 'Daily plan story' },
  { id: 'revenuecat-free-forever-1170x2532', folder: 'revenuecat', width: 1170, height: 2532, title: 'RevenueCat / Free Forever Statement', point: 'No-paywall statement' },
];

const campaignConcepts = [
  { id: 'free-forever', key: 'freeForever', shotA: shots.nutritionMobile, shotB: shots.achievementsDesktop, visual: 'phone-frame' },
  { id: 'daily-loop', key: 'dailyLoop', shotA: shots.onboardingMobile, shotB: shots.nutritionMobile, shotC: shots.workoutMobile, visual: 'three-phones' },
  { id: 'nutrition-habits', key: 'nutrition', shotA: shots.nutritionDesktop, shotB: shots.nutritionMobile, visual: 'frame-phone' },
  { id: 'workout-phase', key: 'workout', shotA: shots.workoutDesktop, shotB: shots.workoutMobile, visual: 'frame-phone' },
  { id: 'progress-proof', key: 'progress', shotA: shots.progressDesktop, shotB: shots.progressMobile, visual: 'frame-phone' },
  { id: 'mobile-data', key: 'mobileData', shotA: shots.shareCard, shotB: shots.profileDesktop, shotC: shots.onboardingMobile, visual: 'share-frame-phone' },
  { id: 'personal-plan', key: 'personalPlan', shotA: shots.onboardingMobile, shotB: shots.landingDesktop, visual: 'phone-frame' },
  { id: 'beginner-start', key: 'beginnerStart', shotA: shots.onboardingMobile, shotB: shots.workoutDesktop, visual: 'phone-frame' },
  { id: 'no-app-switching', key: 'noAppSwitching', shotA: shots.nutritionMobile, shotB: shots.workoutMobile, shotC: shots.progressMobile, visual: 'three-phones' },
  { id: 'recovery-signals', key: 'recoverySignals', shotA: shots.nutritionDesktop, shotB: shots.nutritionMobile, visual: 'frame-phone' },
  { id: 'weekly-reflection', key: 'weeklyReflection', shotA: shots.progressDesktop, shotB: shots.progressMobile, visual: 'frame-phone' },
  { id: 'share-progress', key: 'shareProgress', shotA: shots.shareCard, shotB: shots.achievementsDesktop, shotC: shots.progressMobile, visual: 'share-frame-phone' },
  { id: 'data-export', key: 'dataExport', shotA: shots.shareCard, shotB: shots.profileDesktop, shotC: shots.onboardingMobile, visual: 'share-frame-phone' },
  { id: 'multilingual-pwa', key: 'multilingualPwa', shotA: shots.landingMobile, shotB: shots.landingDesktop, shotC: shots.onboardingMobile, visual: 'share-frame-phone' },
];

const campaignRatios = [
  { id: 'wide-16x9', width: 1920, height: 1080, title: '16:9 Wide' },
  { id: 'square-1x1', width: 1080, height: 1080, title: '1:1 Square' },
  { id: 'portrait-4x5', width: 1080, height: 1350, title: '4:5 Portrait' },
  { id: 'story-9x16', width: 1080, height: 1920, title: '9:16 Story' },
];

function campaignVisual(concept) {
  if (concept.visual === 'three-phones') {
    return `
      <div class="campaign-visual three">
        ${phone(concept.shotA, 'campaign-phone a')}
        ${phone(concept.shotB, 'campaign-phone b')}
        ${phone(concept.shotC, 'campaign-phone c')}
      </div>`;
  }

  if (concept.visual === 'share-frame-phone') {
    return `
      <div class="campaign-visual share">
        ${frame(concept.shotB, 'campaign-frame')}
        ${phone(concept.shotC, 'campaign-phone')}
        ${frame(concept.shotA, 'campaign-share')}
      </div>`;
  }

  if (concept.visual === 'phone-frame') {
    return `
      <div class="campaign-visual phoneframe">
        ${frame(concept.shotB, 'campaign-frame')}
        ${phone(concept.shotA, 'campaign-phone')}
      </div>`;
  }

  return `
    <div class="campaign-visual">
      ${frame(concept.shotA, 'campaign-frame')}
      ${phone(concept.shotB, 'campaign-phone')}
    </div>`;
}

function renderCampaign(concept, ratio, t) {
  const copy = t.campaign[concept.key];
  return `
    <div class="asset campaign ${ratio.id} ${concept.id}">
      ${freeBadge(t.freeBadge)}
      <div class="campaign-copy">
        ${brand('large')}
        <div class="eyebrow">${copy.eyebrow}</div>
        <h1>${copy.title}</h1>
        <p>${copy.text}</p>
        ${chips(copy.bullets)}
        <div class="campaign-cta">${copy.cta}</div>
      </div>
      ${campaignVisual(concept)}
    </div>`;
}

const exportAssets = [];

for (const [locale, t] of Object.entries(locales)) {
  for (const asset of baseAssets) {
    exportAssets.push({
      id: `${asset.id}-${locale}`,
      sourceId: asset.id,
      folder: asset.folder,
      width: asset.width,
      height: asset.height,
      title: `${asset.title} / ${t.label}`,
      language: locale,
      point: asset.point,
      html: baseRenderers(asset.id, t),
    });
  }

  for (const concept of campaignConcepts) {
    for (const ratio of campaignRatios) {
      exportAssets.push({
        id: `campaign-${concept.id}-${ratio.id}-${locale}`,
        sourceId: `campaign-${concept.id}-${ratio.id}`,
        folder: 'campaigns',
        width: ratio.width,
        height: ratio.height,
        title: `${concept.id.replaceAll('-', ' ')} / ${ratio.title} / ${t.label}`,
        language: locale,
        point: t.campaign[concept.key].eyebrow,
        html: renderCampaign(concept, ratio, t),
      });
    }
  }
}

const css = `
  * { box-sizing: border-box; }
  html, body { margin: 0; background: #020617; color: #fff; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; }
  body { padding: 40px; }
  .asset { position: relative; overflow: hidden; isolation: isolate; background: #020617; }
  .asset::before { content: ""; position: absolute; inset: 0; background-image: linear-gradient(rgba(59,130,246,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.08) 1px, transparent 1px); background-size: 72px 72px; opacity: .55; z-index: -3; }
  .asset::after { content: ""; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,109,0,.10), transparent 34%, rgba(0,176,255,.08) 72%, rgba(168,85,247,.10)); z-index: -2; }
  .brand { display: flex; align-items: center; gap: 10px; color: #ff8a00; font-weight: 900; letter-spacing: .02em; font-size: 22px; }
  .brand span span { color: #00b0ff; margin-left: 2px; }
  .brand.large { font-size: 32px; }
  .brand .mark { color: #ff6d00; font-size: 25px; }
  h1 { margin: 20px 0 16px; font-weight: 900; letter-spacing: 0; line-height: .98; }
  h1 span, .gradient { background: linear-gradient(90deg, #ff6d00, #ffd23f, #00b0ff); -webkit-background-clip: text; color: transparent; }
  p { color: #a9b6cd; line-height: 1.45; margin: 0; }
  .chips { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 28px; }
  .chips span { border: 1px solid rgba(255,109,0,.26); color: #ffd0a0; background: rgba(255,109,0,.10); border-radius: 999px; padding: 10px 13px; font-size: 14px; font-weight: 750; }
  .free-badge { position: absolute; right: 42px; top: 38px; z-index: 8; border: 1px solid rgba(16,185,129,.42); background: rgba(16,185,129,.14); color: #5eead4; border-radius: 999px; padding: 11px 16px; font-size: 14px; font-weight: 950; letter-spacing: .08em; box-shadow: 0 18px 55px rgba(16,185,129,.12); white-space: nowrap; }
  .frame { position: absolute; border-radius: 24px; border: 1px solid rgba(148,163,184,.20); background: #0f172a; box-shadow: 0 30px 90px rgba(0,0,0,.50); overflow: hidden; }
  .frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .phone { position: absolute; width: 230px; height: 500px; border: 10px solid #0f172a; border-radius: 34px; background: #020617; box-shadow: 0 28px 80px rgba(0,0,0,.55); overflow: hidden; }
  .phone img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .copy { position: absolute; z-index: 3; }
  .statgrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 30px; max-width: 430px; }
  .statgrid div { border: 1px solid rgba(148,163,184,.20); background: rgba(15,23,42,.82); border-radius: 18px; padding: 16px; }
  .statgrid strong { display: block; font-size: 28px; font-weight: 900; color: #fff; }
  .statgrid span { color: #7f8da6; font-size: 13px; font-weight: 700; }

  .ph .copy { left: 70px; top: 70px; width: 470px; }
  .ph h1 { font-size: 62px; }
  .ph p { font-size: 20px; }
  .hero .rail { position: absolute; left: 0; top: 0; bottom: 0; width: 14px; background: linear-gradient(#ff6d00, #00b0ff); }
  .hero-frame { right: -80px; top: 88px; width: 750px; height: 530px; transform: rotate(-3deg); }
  .hero-frame img { object-position: 12% 0; }
  .feature .wide { width: 720px; height: 480px; top: 128px; }
  .feature .wide.right { right: -34px; }
  .feature .wide.left { left: -36px; }
  .feature .floating { right: 505px; bottom: 54px; transform: rotate(-4deg); }
  .feature .smallphone { right: 536px; bottom: 42px; height: 520px; transform: rotate(-5deg); }
  .rightcopy { left: auto !important; right: 70px; top: 92px; }
  .workout .rightcopy, .achievements .rightcopy { width: 430px; }
  .duo { position: absolute; left: 54px; top: 100px; width: 720px; display: grid; gap: 22px; }
  .duo .mini { position: relative; left: auto; top: auto; width: 720px; height: 252px; border-radius: 22px; }
  .duo .mini img { object-position: 0 0; }
  .mobile-story .copy { width: 430px; }
  .phones { position: absolute; right: 78px; top: 80px; display: flex; gap: 32px; align-items: center; }
  .phones .phone { position: relative; left: auto; top: auto; }
  .phones .phone:nth-child(2) { transform: translateY(34px); }
  .phones .phone:nth-child(3) { transform: translateY(-18px); }

  .thumb { width: 240px; height: 240px; border-radius: 42px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: radial-gradient(circle at 25% 20%, rgba(255,109,0,.34), transparent 34%), linear-gradient(135deg, #070b19, #101b33 55%, #061421); }
  .thumb::before { background-size: 36px 36px; opacity: .28; }
  .thumb .spark { color: #ff6d00; font-size: 48px; line-height: 1; }
  .thumb .fb { margin-top: 12px; font-weight: 950; font-size: 26px; line-height: .9; color: #fff; }
  .thumb .fb span { color: #00b0ff; }
  .thumb-free { margin-top: 14px; border-radius: 999px; padding: 6px 10px; background: rgba(16,185,129,.16); border: 1px solid rgba(16,185,129,.32); color: #5eead4; font-size: 11px; font-weight: 950; letter-spacing: .06em; }

  .gumroad.cover .copy { left: 72px; top: 70px; width: 520px; }
  .gumroad.cover h1 { font-size: 58px; }
  .gumroad.cover p { font-size: 20px; }
  .coverphone { right: 102px; top: 72px; width: 250px; height: 545px; transform: rotate(4deg); z-index: 3; }
  .coverframe { right: 230px; bottom: 58px; width: 530px; height: 305px; opacity: .86; transform: rotate(-3deg); }
  .gumroad.square { display: flex; flex-direction: column; justify-content: center; padding: 54px; }
  .gumroad.square h1 { font-size: 58px; }
  .gumroad.square p { margin-top: 22px; font-size: 22px; color: #93a4bd; font-weight: 800; }

  .og .copy { left: 70px; top: 72px; width: 470px; }
  .og h1 { font-size: 56px; }
  .og p { font-size: 21px; }
  .ogframe { right: -74px; top: 96px; width: 700px; height: 420px; transform: rotate(-2deg); }

  .squarepost { display: flex; flex-direction: column; align-items: center; text-align: center; padding-top: 78px; }
  .squarepost h1 { font-size: 82px; margin-top: 34px; }
  .squarepost p { font-size: 24px; font-weight: 750; }
  .squarephone { left: 50%; bottom: -98px; width: 340px; height: 735px; transform: translateX(-50%); }

  .story { padding: 96px 74px; }
  .story h1 { font-size: 90px; margin-top: 46px; }
  .story p { font-size: 34px; max-width: 760px; color: #b8c5d8; }
  .storyphone { left: 50%; bottom: 180px; width: 430px; height: 930px; transform: translateX(-50%); }
  .story .cta { position: absolute; left: 74px; right: 74px; bottom: 70px; border-radius: 28px; padding: 28px; background: linear-gradient(90deg, #ff6d00, #ff3d00); font-size: 34px; font-weight: 900; text-align: center; box-shadow: 0 24px 70px rgba(255,109,0,.28); }

  .paywall { padding: 96px 70px; text-align: center; }
  .paywall::before { background-size: 80px 80px; opacity: .34; }
  .paywall .brand { justify-content: center; }
  .paywall h1 { font-size: 76px; margin: 58px 0 24px; }
  .paywall .lead { font-size: 30px; color: #aebbd0; max-width: 880px; margin: 0 auto; }
  .payphone { left: 50%; top: 468px; width: 406px; height: 880px; transform: translateX(-50%); }
  .features { position: absolute; left: 70px; right: 70px; bottom: 560px; display: grid; gap: 18px; text-align: left; }
  .features div { border: 1px solid rgba(148,163,184,.20); background: rgba(15,23,42,.86); border-radius: 28px; padding: 28px; }
  .features strong { display: block; font-size: 28px; }
  .features span { display: block; margin-top: 7px; color: #9ca9bd; font-size: 22px; line-height: 1.35; }
  .price { position: absolute; left: 70px; right: 70px; bottom: 300px; border: 1px solid rgba(255,109,0,.32); background: rgba(255,109,0,.11); border-radius: 30px; padding: 30px; }
  .price span { display: block; color: #ffb36b; font-size: 24px; font-weight: 800; }
  .price strong { display: block; font-size: 54px; margin: 8px 0; }
  .price em { color: #aebbd0; font-size: 22px; font-style: normal; }
  .buy { position: absolute; left: 70px; right: 70px; bottom: 174px; padding: 34px; border-radius: 30px; background: linear-gradient(90deg, #ff6d00, #ff3d00); font-size: 28px; font-weight: 950; }
  .restore { position: absolute; left: 70px; right: 70px; bottom: 112px; color: #74839b; font-size: 21px; }

  .campaign .campaign-copy { position: absolute; z-index: 5; padding-bottom: 18px; }
  .campaign .eyebrow { display: inline-flex; color: #5eead4; border: 1px solid rgba(16,185,129,.34); background: rgba(16,185,129,.12); border-radius: 999px; padding: 10px 14px; font-size: 16px; font-weight: 900; margin-top: 28px; }
  .campaign h1 { font-size: 74px; max-width: 820px; }
  .campaign p { font-size: 28px; max-width: 760px; color: #bfcbdd; }
  .campaign .chips span { font-size: 18px; padding: 13px 16px; }
  .campaign-cta { display: inline-flex; align-items: center; justify-content: center; margin-top: 26px; border-radius: 999px; padding: 18px 24px; background: linear-gradient(90deg, #ff6d00, #ff3d00); font-size: 22px; font-weight: 950; box-shadow: 0 24px 70px rgba(255,109,0,.24); }
  .campaign .campaign-frame { border-radius: 34px; }
  .campaign .campaign-phone { border-width: 12px; }
  .campaign .campaign-share { border-radius: 28px; }

  .wide-16x9 .campaign-copy { left: 86px; top: 84px; width: 780px; max-height: 820px; }
  .wide-16x9 .campaign-frame { right: -80px; top: 210px; width: 970px; height: 580px; transform: rotate(-2deg); }
  .wide-16x9 .campaign-phone { right: 690px; top: 250px; width: 300px; height: 650px; transform: rotate(3deg); z-index: 4; }
  .wide-16x9 .three { position: absolute; right: 90px; top: 185px; display: flex; gap: 48px; }
  .wide-16x9 .three .phone { position: relative; right: auto; top: auto; width: 290px; height: 630px; }
  .wide-16x9 .three .b { transform: translateY(80px); }
  .wide-16x9 .three .c { transform: translateY(-35px); }
  .wide-16x9 .campaign-share { right: 625px; bottom: 120px; width: 520px; height: 310px; z-index: 5; transform: rotate(-3deg); }

  .square-1x1 .free-badge, .portrait-4x5 .free-badge, .story-9x16 .free-badge { right: 52px; top: 52px; }
  .square-1x1 .campaign-copy { left: 74px; right: 74px; top: 74px; width: auto; max-height: 540px; }
  .square-1x1 .campaign h1, .square-1x1 h1 { font-size: 68px; max-width: 850px; }
  .square-1x1 p { font-size: 26px; max-width: 820px; }
  .square-1x1 .campaign-frame { left: 290px; bottom: -70px; width: 740px; height: 420px; transform: rotate(-3deg); opacity: .80; }
  .square-1x1 .campaign-phone { left: 80px; bottom: -110px; width: 274px; height: 595px; transform: rotate(3deg); z-index: 5; }
  .square-1x1 .three { position: absolute; left: 80px; right: 80px; bottom: -80px; display: flex; justify-content: center; gap: 34px; }
  .square-1x1 .three .phone { position: relative; left: auto; bottom: auto; width: 250px; height: 540px; }
  .square-1x1 .three .b { transform: translateY(55px); }
  .square-1x1 .three .c { transform: translateY(-20px); }
  .square-1x1 .campaign-share { left: 350px; bottom: -70px; width: 540px; height: 322px; z-index: 5; transform: rotate(-2deg); }

  .portrait-4x5 .campaign-copy { left: 74px; right: 74px; top: 80px; width: auto; max-height: 650px; }
  .portrait-4x5 h1 { font-size: 72px; max-width: 880px; }
  .portrait-4x5 p { font-size: 28px; max-width: 850px; }
  .portrait-4x5 .campaign-frame { right: -70px; bottom: -70px; width: 790px; height: 480px; transform: rotate(-3deg); opacity: .80; }
  .portrait-4x5 .campaign-phone { left: 92px; bottom: -92px; width: 310px; height: 672px; transform: rotate(3deg); z-index: 5; }
  .portrait-4x5 .three { position: absolute; left: 66px; right: 66px; bottom: -76px; display: flex; justify-content: center; gap: 30px; }
  .portrait-4x5 .three .phone { position: relative; left: auto; bottom: auto; width: 270px; height: 585px; }
  .portrait-4x5 .three .b { transform: translateY(70px); }
  .portrait-4x5 .three .c { transform: translateY(-26px); }
  .portrait-4x5 .campaign-share { left: 358px; bottom: -70px; width: 570px; height: 340px; z-index: 5; transform: rotate(-2deg); }

  .story-9x16 .campaign-copy { left: 68px; right: 68px; top: 88px; width: auto; max-height: 780px; }
  .story-9x16 h1 { font-size: 76px; max-width: 880px; }
  .story-9x16 p { font-size: 29px; max-width: 860px; }
  .story-9x16 .campaign-cta { border-radius: 28px; padding: 24px 28px; font-size: 28px; }
  .story-9x16 .campaign-frame { left: 235px; bottom: 122px; width: 800px; height: 488px; transform: rotate(-3deg); opacity: .76; }
  .story-9x16 .campaign-phone { left: 90px; bottom: 108px; width: 382px; height: 828px; transform: rotate(3deg); z-index: 5; }
  .story-9x16 .three { position: absolute; left: 60px; right: 60px; bottom: 115px; display: flex; justify-content: center; gap: 28px; }
  .story-9x16 .three .phone { position: relative; left: auto; bottom: auto; width: 300px; height: 650px; }
  .story-9x16 .three .b { transform: translateY(110px); }
  .story-9x16 .three .c { transform: translateY(-42px); }
  .story-9x16 .campaign-share { left: 380px; bottom: 145px; width: 590px; height: 352px; z-index: 5; transform: rotate(-2deg); }

  .review { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; max-width: 1680px; }
  .review a { color: inherit; text-decoration: none; border: 1px solid #1e293b; background: #0f172a; border-radius: 18px; overflow: hidden; }
  .review img { width: 100%; aspect-ratio: 1.35; object-fit: cover; display: block; background: #020617; }
  .review div { padding: 14px; font-weight: 800; color: #dbeafe; }
  .review small { display: block; margin-top: 5px; color: #93a4bd; font-weight: 650; }
`;

const assetHtml = exportAssets.map((asset) => {
  const html = asset.html.replace(
    /<div class="asset([^"]*)"/,
    `<div class="asset$1" style="width:${asset.width}px;height:${asset.height}px"`,
  );
  return `<section id="${asset.id}" data-w="${asset.width}" data-h="${asset.height}" style="width:${asset.width}px;height:${asset.height}px">${html}</section>`;
});

const reviewLinks = exportAssets.map((asset) => {
  const file = `../assets/${asset.folder}/${asset.id}.png`;
  return `<a href="${file}"><img src="${file}"/><div>${asset.title}<small>${asset.width}×${asset.height} · ${asset.language.toUpperCase()} · ${asset.point}</small></div></a>`;
}).join('');

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Full Balance Marketing Kit</title>
  <style>${css}</style>
</head>
<body>
  <div id="exports" style="display:flex;flex-direction:column;gap:40px">${assetHtml.join('\n')}</div>
  <hr style="margin:60px 0;border-color:#1e293b"/>
  <h1 style="font-size:42px">Full Balance Marketing Kit Review</h1>
  <div class="review">${reviewLinks}</div>
</body>
</html>`;

fs.writeFileSync(HTML_PATH, html);
fs.copyFileSync(HTML_PATH, REVIEW_BOARD_PATH);

const manifest = {
  title: 'Full Balance Marketing Kit',
  generatedAt: new Date().toISOString(),
  languages: Object.entries(locales).map(([code, t]) => ({ code, label: t.label })),
  sourceScreenshots: Object.values(shots).map((src) => src.replace('../', '')),
  assets: exportAssets.map((asset) => ({
    id: asset.id,
    sourceId: asset.sourceId,
    title: asset.title,
    platform: asset.folder,
    language: asset.language,
    point: asset.point,
    width: asset.width,
    height: asset.height,
    path: `assets/${asset.folder}/${asset.id}.png`,
  })),
  counts: {
    total: exportAssets.length,
    byLanguage: Object.fromEntries(Object.keys(locales).map((locale) => [locale, exportAssets.filter((asset) => asset.language === locale).length])),
    byFolder: ['producthunt', 'gumroad', 'social', 'revenuecat', 'campaigns'].reduce((acc, folder) => {
      acc[folder] = exportAssets.filter((asset) => asset.folder === folder).length;
      return acc;
    }, {}),
  },
  review: {
    html: 'review/asset-board.html',
    reviewBoard: 'review/review-board.html',
    contactSheet: 'review/contact-sheet.png',
  },
  notes: [
    'All copy, dimensions, product UI placement, and overlays are deterministic HTML/CSS exports.',
    'Each published concept has matching Turkish and English variants with -tr and -en filename suffixes.',
    'Product screenshots were captured from the local Full Balance app using seeded demo data.',
    'Full Balance is positioned as free forever. Do not publish paid-tier, subscription, trial, Pro, Plus, upgrade, premium, or paywall claims.',
  ],
};

fs.writeFileSync(path.join(ROOT, 'manifest.json'), JSON.stringify(manifest, null, 2));

if (skipScreenshots) {
  console.log(JSON.stringify(manifest, null, 2));
  process.exit(0);
}

async function launchBrowser() {
  try {
    return await chromium.launch({ channel: 'chrome', headless: true });
  } catch {
    return await chromium.launch({ headless: true });
  }
}

const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 2200, height: 2200 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(HTML_PATH).href, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

for (const asset of exportAssets) {
  const locator = page.locator(`#${asset.id} > .asset`);
  const outputPath = path.join(ASSET_DIR, asset.folder, `${asset.id}.png`);
  await locator.screenshot({ path: outputPath });
}

await page.setViewportSize({ width: 1800, height: 2600 });
await page.goto(pathToFileURL(HTML_PATH).href, { waitUntil: 'networkidle' });
await page.evaluate(() => {
  const exportsNode = document.getElementById('exports');
  if (exportsNode) exportsNode.style.display = 'none';
  window.scrollTo(0, 0);
});
await page.screenshot({ path: path.join(REVIEW_DIR, 'contact-sheet.png'), fullPage: true });
await browser.close();
console.log(JSON.stringify(manifest, null, 2));
