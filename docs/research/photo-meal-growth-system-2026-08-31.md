# Full Balance: Photo-Assisted Meal Tool and Organic Growth Decision

Date: 2026-08-31

## Decision

Full Balance will not claim that one meal photo can produce an exact calorie count. The free product uses the photo as a private, on-device reference and requires the user to confirm visible foods, portions, oils, sauces, sugar, and drinks. It then shows calories, macros, and a realistic estimate range.

This flow is published on the existing Turkish, English, and Spanish calorie pages. It adds a genuinely useful no-signup tool to pages that already match calorie-calculation intent instead of creating many thin SEO pages.

## Why this is the safer product

- A single two-dimensional image does not reliably reveal three-dimensional portion volume, recipe composition, absorbed cooking oil, or hidden ingredients. Nutrition5k identifies portion and nutritional understanding as a difficult vision problem and provides multiple views and ingredient-level data for stronger supervision, which ordinary user photos do not provide.
- USDA FoodData Central is suitable for nutrition reference data, but the selected food and amount still need to be known.
- Open Food Facts is useful for packaged-food barcode lookup, but its community-contributed data may be incomplete or inaccurate. It should be presented as label data to verify, not as guaranteed truth.
- Google recommends helpful, people-first pages and clear titles and snippets. The product tool therefore answers the query directly and explains its limits instead of publishing unsupported “AI accuracy” claims.

## Product flow

1. Select or capture a meal photo.
2. Keep the image in the browser only; do not upload or store it.
3. Add every visible food from the existing multilingual database.
4. Confirm grams with quick portion controls.
5. Explicitly add oil, sauce, sugar, and drinks.
6. Show calculated macros plus a wider calorie range for photo-assisted entries.
7. Record privacy-safe aggregate events for photo start, item addition, and completed estimate.

## Growth hypothesis

Search visitors looking for a calorie calculator are more likely to engage with a usable free tool than with another descriptive landing page. The primary measurement is not ranking alone:

- `meal_photo_started`
- `meal_item_added`
- `meal_estimate_completed`
- landing CTA to registration
- registration and plan activation by landing language

Evaluate after at least three completed days or meaningful impression/click volume. Do not repeatedly rewrite the same page before enough data exists.

## Automatic recognition boundary

Fully automatic multi-food recognition and portion estimation would require a vision model and server-side image processing. That would add cost, consent, retention, and failure-mode obligations while still not resolving hidden ingredients. It is intentionally not enabled until a validated model, explicit privacy flow, cost ceiling, and measured accuracy protocol exist.

## Sources

- Google Search Central, [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- Google Search Central, [Influencing title links in Google Search](https://developers.google.com/search/docs/appearance/title-link)
- Google Search Central, [Control your snippets in search results](https://developers.google.com/search/docs/appearance/snippet)
- Thames et al., CVPR 2021, [Nutrition5k: Towards Automatic Nutritional Understanding of Generic Food](https://openaccess.thecvf.com/content/CVPR2021/papers/Thames_Nutrition5k_Towards_Automatic_Nutritional_Understanding_of_Generic_Food_CVPR_2021_paper.pdf)
- USDA, [FoodData Central API Guide](https://fdc.nal.usda.gov/api-guide/)
- Open Food Facts, [API documentation](https://openfoodfacts.github.io/openfoodfacts-server/api/)

## Update: 2026-09-01

Automatic recognition is now enabled through Cloudflare Workers AI, so the
"Automatic recognition boundary" section above describes the previous state.
The accuracy protocol that section asked for is implemented as follows:

- The model receives the English food vocabulary of the nutrition database and
  must answer with a canonical name; nutrition values for matched foods come
  from the database, not from the model.
- Model calories are capped at 9 kcal per gram in the worker and at 600 kcal
  per 100 g for unmatched foods on the client.
- Suspected hidden ingredients (oil, butter, sugar, dressing) are shown as
  one-tap suggestions instead of being silently dropped.
- Every portion is editable with plus/minus controls; the calorie range widens
  with lower model confidence and with unconfirmed hidden ingredients.
- The endpoint is rate limited per IP (12 requests per minute) and the model is
  configurable through the `MEAL_MODEL` variable in `wrangler.toml`.
- Analytics record matched-food ratio, hidden-ingredient count and confidence
  per analysis so accuracy can be tracked without storing photos.
