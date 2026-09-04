# Full Balance Audit Evidence Log

Date: 2026-08-24

This file is the canonical evidence record for the accompanying product-status report.

## Scope

- Product simplicity, activation, retention and trust
- Six goal modules, nutrition, equipment/location constraints and post-workout adaptation
- International acquisition readiness in Turkish, English and Spanish
- Privacy, notification consent, Supabase security and delivery reliability
- Build, test, mobile rendering and live-service checks

## Live Product Evidence

- Registered users: 71
- New registrations: 1 in 24 hours, 10 in 7 days, 50 in 30 days
- Plans created: 61 (85.9% of registered users)
- Known profile languages: Turkish 45, English 15, Spanish 1; unknown 10
- Recorded acquisition sources: unknown 55, ChatGPT 13, direct 3
- Active users in the last 7 days: 9
- Measured returners: D1 0, D7 1; activity instrumentation is recent, so these cohorts are not mature
- Users recording workouts: 8; water: 57; sleep: 8
- Workout feedback records: 2
- Approved public testimonials: 1
- Approved expert reviews: 0; pending expert-review areas: 7
- Push subscriptions before this release: 0

## Verification Evidence

- 29 automated test files and 118 tests pass
- Code-quality check passes
- Production build passes
- 58 static SEO pages and 62 sitemap URLs generated
- Mobile landing page checked at 390 x 844 in Spanish; no console errors, overflow or mixed-language labels after correction
- Supabase migration applied successfully
- Push Edge Function deployed as active version 9
- Secure scheduled-function invocation returned HTTP 200 with no subscribers
- Row-level security is enabled on application tables
- Supabase security review has no critical finding; remaining warnings are documented below

## Remaining Security Warnings

1. Supabase reports `pg_net` extension metadata in the public schema. The scheduled Edge Function uses the documented `pg_cron` + `pg_net` pattern, so moving or removing it without a controlled migration would create delivery risk.
2. Leaked-password protection is disabled. Supabase documents this feature as a Pro-plan capability. The application enforces a strong password policy as the free-plan control, but this is not equivalent to breach-database checking.

## Changes Included in This Release

- Notification permission is requested only after demonstrated value, never on first arrival.
- Dismissed notification prompts remain hidden for 14 days.
- Notification copy and welcome messages are localized for TR/EN/ES.
- Delivery respects the user's IANA timezone and is limited to one notification per local day.
- Notification payloads avoid health and account details.
- A testimonial prompt appears only after three completed workouts and stays hidden for 30 days after dismissal.
- Testimonials cannot be approved without explicit publication consent and meaningful text.
- Spanish landing-page statistics, guide labels and guide titles are localized.
- Retention prompt behavior has dedicated automated tests.

## Primary Sources

- Apple Human Interface Guidelines, Notifications: https://developer.apple.com/design/human-interface-guidelines/notifications
- Android notification permission guidance: https://developer.android.com/develop/ui/compose/notifications/notification-permission
- Lewkowicz et al., JMIR systematic review (2021): https://pubmed.ncbi.nlm.nih.gov/34807837/
- Torous et al., app dropout meta-analysis (2020): https://pubmed.ncbi.nlm.nih.gov/31969272/
- Clement et al., systematic feedback study (2018): https://mhealth.jmir.org/2018/6/e10422
- mHealth engagement scoping review (2021): https://pubmed.ncbi.nlm.nih.gov/34637651/
- Google Search helpful-content guidance: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Supabase password security: https://supabase.com/docs/guides/auth/password-security
- Supabase scheduled Edge Functions: https://supabase.com/docs/guides/functions/schedule-functions
- Supabase pg_net extension: https://supabase.com/docs/guides/database/extensions/pg_net
- WHO physical activity fact sheet: https://www.who.int/news-room/fact-sheets/detail/physical-activity

## Interpretation Limits

- No organic channel can guarantee 3-5 registrations per day.
- D1 and D7 figures need at least two to four weeks of stable event collection before product decisions rely on them.
- Personalization logic and safety constraints can be tested technically, but professional content quality cannot be truthfully certified without real qualified reviewers.
- Search ranking depends on crawl/indexing, competition, user satisfaction and external authority; technical SEO alone does not guarantee rank.
