import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = process.env.FULLBALANCE_URL || 'http://127.0.0.1:5173';
const ROOT = path.resolve('output/marketing-kit');
const SHOT_DIR = path.join(ROOT, 'source-screenshots');

fs.mkdirSync(SHOT_DIR, { recursive: true });

const todayIso = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

function progressPhoto(label, accentA, accentB) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${accentA}"/>
          <stop offset="1" stop-color="${accentB}"/>
        </linearGradient>
        <radialGradient id="r" cx="50%" cy="20%" r="80%">
          <stop offset="0" stop-color="#ffffff" stop-opacity=".24"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="500" height="500" rx="46" fill="#020617"/>
      <rect x="26" y="26" width="448" height="448" rx="38" fill="url(#g)" opacity=".72"/>
      <rect x="26" y="26" width="448" height="448" rx="38" fill="url(#r)"/>
      <circle cx="250" cy="190" r="58" fill="#0f172a" opacity=".55"/>
      <path d="M158 385c18-84 56-126 92-126s74 42 92 126" fill="#0f172a" opacity=".55"/>
      <text x="250" y="442" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="800" fill="#fff">${label}</text>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function launchBrowser() {
  try {
    return await chromium.launch({ channel: 'chrome', headless: true });
  } catch {
    return await chromium.launch({ headless: true });
  }
}

async function seedApp(page, { withPlan = true } = {}) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.evaluate(async ({ withPlan, todayIsoSource, progressPhotoSource }) => {
    const todayIso = eval(`(${todayIsoSource})`);
    const progressPhoto = eval(`(${progressPhotoSource})`);
    localStorage.setItem('shredmatrix_lang', 'tr');
    const user = { id: 'demo-local', name: 'Ahmet', email: 'demo@fullbalance.app' };
    localStorage.setItem('shredmatrix_user', JSON.stringify(user));
    localStorage.setItem('shredmatrix_first_login', new Date(Date.now() - 38 * 86400000).toISOString());
    localStorage.setItem('shredmatrix_plan_created', new Date(Date.now() - 24 * 86400000).toISOString());
    localStorage.setItem('shredmatrix_current_phase', '1');
    sessionStorage.setItem('shredmatrix_welcomed_demo@fullbalance.app', '1');
    localStorage.setItem('shredmatrix_tour_seen_demo@fullbalance.app', '1');

    if (!withPlan) {
      localStorage.removeItem('shredmatrix_plan_demo@fullbalance.app');
      return;
    }

    const { generatePlan, localizePlan } = await import('/src/data/planGenerator.js');
    const metrics = {
      name: 'Ahmet',
      age: 32,
      gender: 'male',
      height: 178,
      weight: 83,
      bodyFatPercentage: 18,
      experience: 'intermediate',
      activityLevel: 'moderate',
      primaryGoal: 'muscle',
      workSchedule: 'flexible',
      budget: 'moderate',
    };
    const plan = localizePlan(generatePlan(metrics, 1, 'tr'), 'tr');
    plan.createdAt = new Date(Date.now() - 24 * 86400000).toISOString();
    plan.workoutSplit = plan.workoutSplit.map((day) => {
      const { image, ...rest } = day;
      return rest;
    });
    plan.dailyNutrition = plan.dailyNutrition.map((day) => ({
      ...day,
      meals: day.meals.map((meal) => {
        const { image, ...rest } = meal;
        return rest;
      }),
    }));

    localStorage.setItem('shredmatrix_plan_demo@fullbalance.app', JSON.stringify(plan));
    localStorage.setItem('shredmatrix_water', JSON.stringify({ date: todayIso(0), glasses: 6 }));
    localStorage.setItem('shredmatrix_water_history', JSON.stringify([todayIso(-6), todayIso(-5), todayIso(-4), todayIso(-3), todayIso(-2), todayIso(-1), todayIso(0)]));
    localStorage.setItem('shredmatrix_sleep', JSON.stringify([
      { date: todayIso(-5), hours: 6.8 },
      { date: todayIso(-4), hours: 7.2 },
      { date: todayIso(-3), hours: 7.5 },
      { date: todayIso(-2), hours: 6.5 },
      { date: todayIso(-1), hours: 7.8 },
      { date: todayIso(0), hours: 7.0 },
    ]));
    localStorage.setItem('shredmatrix_progress', JSON.stringify([
      { date: todayIso(-34), weight: 84.2, bodyFat: 19.3 },
      { date: todayIso(-27), weight: 83.8, bodyFat: 18.9 },
      { date: todayIso(-20), weight: 83.3, bodyFat: 18.4 },
      { date: todayIso(-13), weight: 82.9, bodyFat: 17.9 },
      { date: todayIso(-6), weight: 82.6, bodyFat: 17.5 },
      { date: todayIso(0), weight: 82.4, bodyFat: 17.2 },
    ]));
    localStorage.setItem('shredmatrix_measurements', JSON.stringify([
      { date: todayIso(-28), chest: 102, waist: 88, hip: 99, arm: 36, leg: 58 },
      { date: todayIso(-14), chest: 103, waist: 86, hip: 99, arm: 37, leg: 59 },
      { date: todayIso(0), chest: 104, waist: 84, hip: 98, arm: 37.5, leg: 60 },
    ]));
    localStorage.setItem('shredmatrix_workout_log', JSON.stringify([
      { date: todayIso(-4), dayFocus: 'Göğüs & Ön Omuz', exercises: [{ name: 'Bench Press', sets: [{ weight: 70, reps: 8, completed: true }, { weight: 70, reps: 8, completed: true }] }] },
      { date: todayIso(-3), dayFocus: 'Sırt & Arka Omuz', exercises: [{ name: 'Barbell Row', sets: [{ weight: 62, reps: 10, completed: true }, { weight: 62, reps: 10, completed: true }] }] },
      { date: todayIso(-1), dayFocus: 'Bacak & Kalça', exercises: [{ name: 'Squat', sets: [{ weight: 92, reps: 6, completed: true }, { weight: 92, reps: 6, completed: true }] }] },
      { date: todayIso(0), dayFocus: 'Omuz & Kol', exercises: [{ name: 'Arnold Press', sets: [{ weight: 24, reps: 10, completed: true }, { weight: 24, reps: 10, completed: true }] }] },
    ]));
    localStorage.setItem('shredmatrix_profile_photo', '');
    localStorage.setItem('shredmatrix_progress_photos', JSON.stringify([
      { id: 'p1', date: todayIso(-30), src: progressPhoto('DAY 01', '#ff6d00', '#0ea5e9') },
      { id: 'p2', date: todayIso(-15), src: progressPhoto('DAY 15', '#7c3aed', '#00b0ff') },
      { id: 'p3', date: todayIso(0), src: progressPhoto('TODAY', '#22c55e', '#ff6d00') },
    ]));
  }, { withPlan, todayIsoSource: todayIso.toString(), progressPhotoSource: progressPhoto.toString() });
}

async function screenshot(page, name, viewport, urlPath = '/dashboard') {
  await page.setViewportSize(viewport);
  await page.goto(`${BASE_URL}${urlPath}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(SHOT_DIR, name), fullPage: false });
}

async function clickTabAndShot(page, label, name, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: new RegExp(label, 'i') }).first().click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(SHOT_DIR, name), fullPage: false });
}

const browser = await launchBrowser();
const context = await browser.newContext();
const page = await context.newPage();
const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (error) => consoleErrors.push(error.message));

await seedApp(page, { withPlan: false });
await screenshot(page, 'landing-desktop.png', { width: 1440, height: 980 }, '/');
await screenshot(page, 'landing-mobile.png', { width: 430, height: 932 }, '/');
await screenshot(page, 'onboarding-mobile.png', { width: 430, height: 932 }, '/onboarding');

await seedApp(page, { withPlan: true });
await screenshot(page, 'dashboard-nutrition-desktop.png', { width: 1440, height: 980 }, '/dashboard');
await screenshot(page, 'dashboard-nutrition-mobile.png', { width: 430, height: 932 }, '/dashboard');
await clickTabAndShot(page, 'Antrenman', 'dashboard-workout-desktop.png', { width: 1440, height: 980 });
await clickTabAndShot(page, 'İlerleme|Ilerleme', 'dashboard-progress-desktop.png', { width: 1440, height: 980 });
await clickTabAndShot(page, 'Başarım|Basarim', 'dashboard-achievements-desktop.png', { width: 1440, height: 980 });
await clickTabAndShot(page, 'Profil', 'dashboard-profile-desktop.png', { width: 1440, height: 980 });

await page.setViewportSize({ width: 430, height: 932 });
await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Antrenman/i }).first().click();
await page.waitForTimeout(700);
await page.screenshot({ path: path.join(SHOT_DIR, 'dashboard-workout-mobile.png'), fullPage: false });
await page.getByRole('button', { name: /İlerleme|Ilerleme/i }).first().click();
await page.waitForTimeout(700);
await page.screenshot({ path: path.join(SHOT_DIR, 'dashboard-progress-mobile.png'), fullPage: false });

await page.setViewportSize({ width: 1440, height: 980 });
await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
await page.getByTitle(/Paylaş/i).click();
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(SHOT_DIR, 'share-card-modal.png'), fullPage: false });

const bodyTextLength = await page.evaluate(() => document.body.innerText.trim().length);
const overlayState = await page.evaluate(() => document.querySelector('.vite-error-overlay, #webpack-dev-server-client-overlay') ? 'ERROR_OVERLAY' : 'OK');
await browser.close();

const report = {
  baseUrl: BASE_URL,
  generatedAt: new Date().toISOString(),
  screenshots: fs.readdirSync(SHOT_DIR).filter((f) => f.endsWith('.png')).sort(),
  verification: {
    bodyTextLength,
    overlayState,
    consoleErrors,
  },
};
fs.writeFileSync(path.join(ROOT, 'capture-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
