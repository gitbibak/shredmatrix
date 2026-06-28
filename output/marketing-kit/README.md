# Full Balance Marketing Kit

Generated for the current `shredmatrix` / `fullbalance.app` product state.

## Core Launch Promise

Full Balance is completely free and will stay free.

Use this promise everywhere:
`Tamamen ücretsiz. Her zaman ücretsiz. Asla ücretli olmayacak.`

Do not publish paid-tier, subscription, trial, Plus, Pro, premium, upgrade or paywall messaging.

## What is included

- `138` exported PNG assets total.
- `69` Turkish variants with `-tr` filename suffix.
- `69` English variants with `-en` filename suffix.
- `assets/producthunt/` — 6 gallery images at `1270x760` plus a `240x240` thumbnail, in TR and EN.
- `assets/gumroad/` — cover at `1280x720` and square thumbnail at `600x600`, in TR and EN.
- `gumroad/` — Gumroad CLI product-description, free access file and draft creation script.
- `assets/social/` — Open Graph, square post, and story/reel cover, in TR and EN.
- `assets/revenuecat/` — no-paywall / free-forever statement image, in TR and EN.
- `assets/campaigns/` — 14 marketing angles across 4 ratios, in TR and EN.
- `source-screenshots/` — clean screenshots captured from the local app with seeded demo data.
- `copy/` — Product Hunt, Gumroad, RevenueCat/no-paywall and social launch copy.
- `copy/campaign-copy-playbook.md` — campaign titles, descriptions, captions, CTAs, platform placements and asset mapping.
- `review/asset-board.html` and `review/review-board.html` — browser review pages for all visuals.
- `review/contact-sheet.png` — contact sheet of the exported visuals.
- `manifest.json` — machine-readable asset inventory.

## Campaign Angles

Each campaign angle has `16:9`, `1:1`, `4:5`, and `9:16` outputs in both languages:

- `free-forever` — no subscription, no card, no premium wall.
- `daily-loop` — plan, train, eat, track, repeat.
- `nutrition-habits` — meals, macros, water and sleep.
- `workout-phase` — weekly split, rest timer and phase logic.
- `progress-proof` — measurements, badges and weekly reports.
- `mobile-data` — mobile PWA, share cards and data export.
- `personal-plan` — onboarding, metrics, goal and routine.
- `beginner-start` — clear first step for people who do not know where to start.
- `no-app-switching` — workout, nutrition, habits and progress in one place.
- `recovery-signals` — water, sleep and balance basics.
- `weekly-reflection` — weekly rhythm and consistency signals.
- `share-progress` — share cards without transformation-pressure claims.
- `data-export` — profile history, photos and export.
- `multilingual-pwa` — browser-first TR / EN / ES access.

## Product truth used

Full Balance is currently positioned as a free-forever, mobile-first wellness web app that combines:

- personalized onboarding;
- workout plans and weekly split;
- nutrition plan, macro targets and calorie lookup;
- water and sleep tracking;
- progress, body measurements and weekly reports;
- achievements, profile, progress photos, share card and data export;
- Supabase-backed data service with localStorage fallback;
- PWA metadata and multilingual UI;
- no subscription, no card requirement and no premium feature wall.

I avoided risky claims from older docs such as `10K+ exercises` or `500+ recipes` and did not make medical, guaranteed body transformation, or paid-tier claims.

## Platform notes

- Product Hunt: official help recommends `1270x760` gallery images and `240x240` square thumbnail. It also states description is limited to `260` characters. Source: [Product Hunt help](https://help.producthunt.com/en/articles/479557-how-to-post-a-product).
- Gumroad: official cover help exists, but exact public cover dimensions are not consistently published. I used a practical `1280x720` cover target and `600x600` thumbnail. Sources: [Gumroad cover help](https://gumroad.com/help/article/60-adding-a-cover-image), [PixelMeasures Gumroad size note](https://www.pixelmeasures.com/platform-sizes/gumroad/product-cover/).
- RevenueCat: RevenueCat Paywalls are designed for configurable purchase screens tied to Offerings. Since Full Balance is explicitly free forever, this kit includes a no-paywall statement instead of a monetization asset. Sources: [RevenueCat Paywalls](https://www.revenuecat.com/docs/tools/paywalls), [Creating Paywalls](https://www.revenuecat.com/docs/tools/paywalls/creating-paywalls).

## Recommended Asset Order

Use `-en` for English channels and `-tr` for Turkish channels.

Product Hunt gallery:

1. `producthunt-01-hero-en.png` / `producthunt-01-hero-tr.png`
2. `producthunt-02-nutrition-en.png` / `producthunt-02-nutrition-tr.png`
3. `producthunt-03-workout-en.png` / `producthunt-03-workout-tr.png`
4. `producthunt-04-progress-en.png` / `producthunt-04-progress-tr.png`
5. `producthunt-05-achievements-en.png` / `producthunt-05-achievements-tr.png`
6. `producthunt-06-mobile-en.png` / `producthunt-06-mobile-tr.png`

Gumroad:

1. `gumroad-cover-1280x720-en.png` / `gumroad-cover-1280x720-tr.png`
2. `gumroad-thumbnail-600-en.png` / `gumroad-thumbnail-600-tr.png`

Social:

1. `social-og-1200x630-en.png` / `social-og-1200x630-tr.png`
2. `social-square-1080-en.png` / `social-square-1080-tr.png`
3. `social-story-1080x1920-en.png` / `social-story-1080x1920-tr.png`

RevenueCat / no-paywall documentation:

1. `revenuecat-free-forever-1170x2532-en.png` / `revenuecat-free-forever-1170x2532-tr.png`

## Verification

`capture-report.json` confirms the local dev server rendered meaningful content with no Vite overlay and no console errors during the screenshot pass. The latest export contains `138` PNG files and every listed asset has a matching TR/EN variant.
