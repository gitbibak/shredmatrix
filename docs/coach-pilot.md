# Coach pilot

## Scope

- `/coach` is accessible without creating a personal fitness plan. Authentication is required for every data operation.
- A coach enables their own workspace, creates a reusable invite, and shares its link, QR or printable PNG. Invitations expire after one year and can be rotated. A rotation does not disconnect existing students.
- Coaching periods are 3 months, 6 months or open-ended. They begin when the coach approves the student's request, not when the QR is scanned.
- Students explicitly consent to connection-specific programs, workout records and feedback. Weight/body-fat and body measurements are separately optional. No photos, email, nutrition, sleep, historical private notes or gym billing data are shared.
- The coach assigns versioned programs. Students enter actual repetitions and weights; no completion is assumed. An outdated assignment is rejected on submission rather than silently rewritten.
- Existing personal plans remain unchanged. Saved coaching sessions also create normal workout history entries. Ending a connection preserves personal workout history.
- This is not a gym management integration or verification of professional qualifications. The gym remains responsible for its own membership and coaching offer.

## Authorization

Five private tables have RLS enabled with no direct client grants (intentional default-deny). `public.coach_api` is SECURITY INVOKER and delegates to an authorization broker in the private schema. The broker checks the authenticated non-anonymous user, connection participants, status and expiry on each request. Existing personal-data policies are unchanged.

Migration: `20260922202347_coach_workspace.sql`, applied with the Supabase migration API. Live verification confirmed that anon cannot execute the API and neither anon nor authenticated has direct SELECT on these tables.

The security advisor's informational `rls_enabled_no_policy` entries on these private tables are expected. Existing unrelated warnings for pg_net, referral_summary and leaked-password protection were not changed.

## Verification

- 10 PostgreSQL authorization tests using isolated PGlite: guest/anonymous access, cross-user access, consent, coach acceptance, invitation rotation/expiry, optional metrics, disconnect/expiry, program validation/versioning and idempotent workout writes.
- 10 component/service tests: sign-in return, explicit opt-in, pending access, actual set entry, errors and bounded program data.
- Isolated two-user browser flow: invite, consent, approval, assignment, workout entry, trainer feedback, flyer download.
- TR/EN/ES screenshots at 320, 390 and 1280 pixels: no horizontal overflow or page errors.
- Production build, lint and analytics typecheck passed.
- Full suite: 381 passed; one pre-existing `src/llms.test.js` expectation fails against the unchanged `public/llms.txt` (also present in HEAD). This is not a coach regression and was not changed in this work.

Before a wider gym rollout, validate the coaching offer and privacy obligations with the pilot gym. Do not describe free app access as a normally paid benefit, promise unlimited PT service, or imply turnstile attendance from workout records.
