# Sarathi

Find scholarship and education support, prepare documents and keep local deadline reminders. Built for Karnataka students with React Native, TypeScript and Expo. Android first, with a web preview for UI testing.

## What v1 does

- Browse 20 catalogue records in 17 scheme families; filter caste, minority, economic status, course and annual income separately.
- See benefits, source labels, fresh/renewal dates and last-checked dates. Shared portals are labelled, never disguised as exact scheme links.
- Save a document checklist locally, isolated by scheme, academic year and application mode.
- Opt into 7/3/1-day reminders or a custom date at 9 AM IST. Only verified future student deadlines can generate reminders.
- Refresh a versioned catalogue, with HTTPS, checksum and runtime validation. Offline launch uses the bundled or last-good copy.

## Trust design

Sarathi is independent and is not a government service. Matching a filter does not mean a student is eligible. A checkmark means “I have this document”, not “application accepted”. All Karnataka 2026-27 deadlines in this starter dataset say **verify on portal**. National dates reflect the official listing checked on 11 October 2026 and may change. CSSS fresh has no verified cutoff; renewal is separate.

Benefit descriptions retain source caveats. Older guideline rates, institution notices and provisional preparation lists are not advertised as verified current awards or exhaustive upload lists. Source links and last-checked dates stay visible. A failed portal check must not advance the source's checkedAt date.

This is a review/development catalogue, not a production-certified scholarship database. Before releasing publicly, verify current state circulars, forms, rates and document rules. Do not promise automatic submission, eligibility or guaranteed notifications.

The selected gold-wheel icon is stored as text chunks and restored by the setup script because the publishing upload route did not preserve binary filenames. The lockfile is restored by the same script. No image is fetched from a third-party host.

## Run

Use Node 22+ and npm:

```sh
node scripts/materialize-assets.cjs
npm ci
npm run typecheck
npm test
npm run validate:data
npx expo start
npm run web
```

For actual Android notification testing, install Android Studio/SDK and an emulator, or connect a physical device with USB debugging:

```sh
npx expo run:android
```

Use a development build, not only Expo Go. The Android package is `com.chethankumargs.sarathi`. No push server, FCM account or Expo push token is used. iOS is not release-tested.

## Weekly data update

The app does not scrape government websites. A weekly editorial review checks official portals and changes the edited dataset only when evidence supports it. The weekly review schedule is maintained separately from this repository; no unattended GitHub writer runs in the app.

1. Check official student cutoffs separately from institute verification deadlines. Preserve fresh/renewal and academic year.
2. Update `assets/data/scholarships.2026-27.json`. Keep stable scheme/document IDs. Store unknown values as null and unknown deadlines as `verify_on_portal`.
3. Record official source URLs, covered cycle and the actual successful checkedAt date. Failed checks retain the previous verified timestamp. Historical rates remain labelled.
4. Increase dataVersion; run `npm run validate:data`, `npm test`, then `npm run publish:data`.
5. Commit the new immutable `catalogue/scholarships.vN.json` and manifest together after review. Never overwrite old version files.

The manifest points at raw GitHub JSON in this repository. The SHA-256 checksum detects corruption, not publisher impersonation. HTTPS and control of this GitHub account are the publishing trust boundary. The app checks on foreground launch at most daily and on explicit refresh. Network/schema/checksum failures keep the last-good copy and do not rewrite scheme source dates.

## Reminder changes

On launch/refresh, local reminders are reconciled even if the catalogue version did not change. Old notification IDs are cancelled before replacement. Postponed/shortened verified dates reschedule selected offsets. Unknown, removed, past or retired deadlines cancel existing notifications and appear unavailable. Custom reminder dates remain explicit user choices. Permissions or channel problems also appear unavailable. Device battery settings, reboot behaviour and Android scheduling restrictions can delay delivery; 9 AM is a target, not a minute-perfect promise. A phone that never reopens the app will not learn a changed deadline instantly.

## Checks and remaining release work

TypeScript, catalogue validation, Expo dependency compatibility and web export are checked. Unit tests cover date postponement/removal, unknown deadlines, year/mode separation, malformed links, filter separation and duplicate/past offsets. Web UI smoke tests cover navigation and checkmarks at a 390px mobile viewport.

Still required before release: physical Android permission/channel tests, denied permission, reboot, battery restrictions, timezone changes, notification taps, reinstall, iOS testing and final current-cycle editorial review. No APK or Play Store release is included.

Dependency audit currently reports upstream Expo/Metro tooling advisories. Do not apply `npm audit fix --force` blindly; review supported upstream upgrades before a production build.

No user accounts, uploads, sensitive document numbers, application tracking or government submissions are included.
