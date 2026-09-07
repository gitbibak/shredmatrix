# Growth check: 7 September 2026

## Verified aggregate registrations

Europe/Istanbul, approximately 21:25 local. Today is incomplete.

| Period | Registrations | Profiles with a plan |
| --- | ---: | ---: |
| 6 September | 15 | 14 |
| 7 September so far | 3 | 3 |
| 31 August - 6 September | 33 | 28 |

Yesterday had 14 registrations by the same local time. First-touch sources
for the completed week: ChatGPT 24, Google 4, direct 4, Instagram 1.
Attribution is a source signal, not proof of the exact search or prompt used.
EN/ES UI language must not be interpreted as nationality.

## Measurement defect

The growth_events table was empty. The authenticated role could not execute
private.analytics_properties_are_safe(jsonb), which its INSERT CHECK invokes.
Confirmed permission-denied by running the validator as authenticated.
Fix only its EXECUTE grant; keep ownership RLS and anonymous write restrictions.
Do not fabricate missing historical events. Browser queues may submit older
events later: use occurred_at, not ingestion time, when reporting activity.
This repair does not by itself increase visits or recover anonymous traffic.

Live validation after the grant used the authenticated role inside a rolled-back
transaction: a safe event inserted successfully, a weight property failed its
CHECK constraint, and another user's ID failed ownership RLS. No diagnostic
events were retained. Real browser ingestion still needs observation.

Security advisor also reported separate warnings, not changed by this repair:
- [pg_net in public](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public)
- [Authenticated referral SECURITY DEFINER function](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)
- [Leaked password protection disabled](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
These require separate review; this report is not a clean security audit.

## Next acquisition experiment

Preserve /en while recent results accumulate; do not rewrite it daily.
Use one message: free personalized home workout plus nutrition plan,
with or without equipment, no credit card. Photo calories remain estimates,
not a promise of exact grams or unlimited provider capacity.

Prepared organic pin titles:
- EN: Free Home Workout and Nutrition Plan - With or Without Equipment
- ES: Plan gratis de entrenamiento en casa y nutricion - Con o sin material

EN copy: Build a routine around your goal and available equipment.
Explore a free personal workout and nutrition plan with Full Balance.
No credit card required.

ES copy: Organiza tu rutina segun tu objetivo y el material disponible.
Descubre tu plan gratuito de entrenamiento y nutricion con Full Balance.
Sin tarjeta de credito.

Use real app screenshots and only genuine, consented user quotes.
Destination links:
- https://fullbalance.app/en?utm_source=pinterest&utm_medium=organic_social&utm_campaign=home_plan_sep07&utm_content=en_plan
- https://fullbalance.app/es?utm_source=pinterest&utm_medium=organic_social&utm_campaign=home_plan_sep07&utm_content=es_plan

These are prepared, NOT posted. No paid campaign or external account created.
Evaluate after at least three completed days from actual publication.
Compare visits, CTA actions, signup and plan creation by campaign and language.
Do not claim a conversion rate until a reliable visitor denominator is available.

Search Console was not accessible in this session. Obtain the latest completed
query/page export before changing Google titles. No ranking loss is established.
