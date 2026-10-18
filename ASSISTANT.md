# Scholarship assistant

The Assistant tab combines offline guided matching with optional server-side AI profile extraction.

## Run the guided version locally

```sh
node scripts/materialize-assets.cjs
npm ci
npm run typecheck
npm test
npm run validate:data
npm run web
```

Open the Expo web URL printed in the terminal. Choose Assistant. Select category, course, year within the course, application mode and optional income/marks. BE/BTech has 4 years, PUC has 2; three-year and four-year degree courses are separate choices. Other/different duration allows a study level and year 1-8. For second-year UG/diploma, confirm whether entry was lateral.

Test OBC, BE/BTech, year 2, lateral entry yes, income 150000, marks 80, fresh. With the bundled v2 list there are 3 possible matches. The UI flags incomplete conditions, source dates, unknown deadlines and provisional document lists. Open Details and sources to inspect the underlying evidence. The Kannada switch translates assistant controls and cautions, not catalogue scheme names, official rules or document labels. Human Kannada copy review is still recommended.

Choose Above ₹8 lakh in Browse filters or Assistant. The saved catalogue currently yields no results: it has no explicitly verified no-income-limit entries. No merit scholarship is invented to fill an empty list. Above ₹8 lakh is only a lower bound; enter an exact amount when comparing against any higher cap added later.

## Trust boundary

This is a discovery assistant, not an eligibility certificate. Category and study level narrow the list. Exact annual income hides schemes above a current listed annual-income cap and hides unknown/prior-cycle/monthly-salary rules rather than treating them as unlimited. No income filter leaves unknown schemes discoverable. Browse income bands require only possible overlap and still need exact-income checks. Current catalogue evidence can be incomplete; a recorded cap does not validate every other condition. Profile income is never compared to a monthly parent-salary rule.

Known AICTE entry-year conflicts are excluded from fresh results with a count; unknown lateral-entry status is flagged. Known entry-year conditions are checked for first-year or second-year lateral-entry fresh applicants. Other course/year conditions remain visible as official-text rules rather than being guessed. Marks percentage is not board percentile; the app never converts it. Gender, disability, parent-worker status, institution, residence, concurrent scholarships and other conditions require review. Deadlines marked unverified are never shown as firm assistant deadlines. Fresh and renewal records remain separate.

Profile answers and the free-text message live in component memory only, never AsyncStorage. Clear my details removes them; a reload resets them. Changing tabs can retain in-memory state until reset. Browse preferences follow the app's existing local persistence.

## Optional real AI

The guided form works without any API key, including offline. The optional AI button sends ONLY the student's typed message, after an explicit consent checkbox, to the app server and OpenAI. AI extracts structured profile suggestions in English or Kannada. The student reviews every field before finding matches. The model has no tools, catalogue access, outgoing action capability or authority to decide eligibility. It cannot generate scholarship dates or documents in the response schema.

`api/assistant.ts` implements a Vercel-style Node function using the OpenAI Responses API and strict structured outputs. `store: false` is set; this does not promise zero retention by every service. No personal profile logging is added. The endpoint rejects common long-number/email identifiers, but this is not complete personal-data detection. Students must still avoid IDs, names and bank details.

Copy `.env.example` to `.env.local` locally. Keep it private. Real secrets belong only in the hosting provider's server environment, never in source, commits, chat or `EXPO_PUBLIC_*` variables.

Server variables:

- `OPENAI_API_KEY`: server-side key.
- `SARATHI_AI_MODEL`: a model available in your account supporting Responses API strict structured output. No provider model choice or spending is assumed.
- `SARATHI_AI_ENABLED=true`: explicit paid-call opt-in. Default is false.
- `SARATHI_ALLOWED_ORIGINS`: comma-separated exact browser origins, such as the deployed app URL.

On web, requests use same-origin `/api/assistant`. To test real AI locally, run a Vercel-compatible local server for the function and point the web app at that same server. `expo start --web` and a static Expo export alone do NOT run API functions. Vercel rewrites exclude API paths to avoid serving HTML instead of JSON. For native builds, set `EXPO_PUBLIC_ASSISTANT_API_URL` to the deployed HTTPS function URL. It is a public endpoint, not a secret. Cross-origin browser hosting would need an explicit CORS/preflight design; it is not supported by this same-origin starter.

Before enabling real AI publicly: obtain the owner's cost approval, set a provider spending cap, add a distributed/edge rate limit, review the privacy notice/data declarations and validate the actual chosen model in staging. The included 5-request/minute in-process limit is best-effort per instance, not a production cost control. Origin checks are not authentication and can be forged by non-browser callers. Native clients have no browser Origin. Public abuse protection is required before launch.

No real provider calls have been made. API tests mock fetch and cover disabled state, input/origin/identifier validation, malformed model output and rate limiting. Real Kannada/English extraction quality, model compatibility, deploy routing and Android are not yet verified.

## Checks

```sh
npm run typecheck
npm test
npm run validate:data
npx expo export --platform web
npx playwright install chromium
node tests/preview.cjs
```

The smoke test covers mobile web at 390px, above-8L empty state, course/year/lateral entry, matches, Kannada, dark mode and navigation. Physical Android and real API testing are still required.
