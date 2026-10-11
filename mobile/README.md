# WhatIf — mobile app

Expo SDK 57 · React Native 0.86 · expo-router · TanStack Query · Reanimated 4.

## Run it

```bash
npm install
cp ../config/mobile.env.example .env
npx expo start -c
```

| Mode | `.env` | Needs backend? |
|---|---|---|
| Fixture | `EXPO_PUBLIC_API_MODE=fixture` | No. Shows a permanent `DEVELOPMENT FIXTURES — NOT LIVE AI` banner. |
| Live | `EXPO_PUBLIC_API_MODE=live` + `EXPO_PUBLIC_API_BASE_URL=https://<tunnel>/api/v1` | Yes, plus `run_worker` for AI jobs. |

`EXPO_PUBLIC_*` values ship inside the app bundle — never put secrets there.

### Expo Go vs a dev build

Most of the app runs in **Expo Go**. The repo also contains a generated
`android/` project for a **development build** (`npx expo run:android`), which
is required for:

- the native **Map** on Android (needs `GOOGLE_MAPS_ANDROID_API_KEY` at build
  time — without it the Map tab shows a placeholder instead of crashing);
- custom native config (WhatIf icon, splash, permissions) on Android.

After changing `app.json`, `app.config.js` or adding a native package, regenerate:

```bash
npx expo prebuild --platform android --clean
npx expo run:android
```

## Screens

| Route | Screen |
|---|---|
| `/onboarding` | First-launch story (3 pages). Reopen from the 📖 header icon. |
| `/(tabs)` | Community feed — hero, search, filters (Nearby, Transit/Streets/Parks, Top, Supported). |
| `/(tabs)/map` | Proposals on a map + card carousel. |
| `/(tabs)/create` | Studio step 1 — photo, place (+ "Use my location"), problem, consent. |
| `/proposal/[id]/suggest` | Step 2 — AI scene scan, what it sees, options. |
| `/proposal/[id]/mask` | Step 3 — brush/erase with coverage meter (server limit 60%). |
| `/proposal/[id]/generate` | Step 4 — live render timeline; resumes a running job. |
| `/proposal/[id]/review` | Step 5 — slider, AI review verdict + acknowledgements, wording, publish. |
| `/proposal/[id]/celebrate` | Published! Share / view. |
| `/proposal/[id]` | Detail — slider, support, packet download, "How this was made". |
| `/(tabs)/mine`, `/(tabs)/profile` | Your drafts/published + stats; account, AI in use, dev tools. |

## Code map

```
app/                 expo-router screens (see table above)
src/api/             ApiClient interface + live and fixture clients (contract §5 — don't rename fields)
src/ui/              design-system primitives: Button, Chip, Card, Field, CheckRow, Toast, Dock, Display, StepProgress, Confetti
src/components/      app components: BeforeAfterSlider, MaskCanvas, ScanningPhoto, ProposalCard, TabBar, ProposalMap(.web)
src/lib/             places (geocoding/distance), tags, maskCoverage, maskDraft, kv, onboarding
src/hooks/           React Query hooks (feed, proposal, job polling, support)
src/theme.ts         tokens: colors, radius, spacing, fonts (Fraunces display + Poppins UI), shadows
assets/              icon, splash, demo before/after (from our own pipeline)
```

Use `Text` from `src/components/Text` (maps `fontWeight` to the right Poppins
face) and `Display` from `src/ui/Display` for headlines.

## Things that bit us (keep these)

- **Uploads:** SDK 57 installs `expo/fetch` as global `fetch`; it rejects
  React Native's `{ uri, name, type }` FormData parts. `liveClient.photoPart`
  reads the file with expo-file-system and sends `bytes()`.
- **Gestures:** handlers that touch refs/React state must use `.runOnJS(true)`.
  `babel-preset-expo` already includes the worklets plugin — don't add it to
  `babel.config.js` again.
- **Effects + navigation:** hooks passed into effect deps must be stable
  (`useCallback`), or `router.replace` loops ("Maximum update depth").
- **Map/Nearby:** the contract has no coordinates; locations come from the
  author's capture point (stored on device) or OS geocoding of `placeLabel`.

## Checks

```bash
npx tsc --noEmit
npx expo-doctor        # one expected warning while android/ is committed
```
