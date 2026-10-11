# Troubleshooting

Real problems we hit, with the fix. Start at the symptom.

## "Couldn't reach the server" (was: "The AI service is down")

The request never got an HTTP response — the backend log shows **no** request.

- Is the tunnel URL in `mobile/.env` (`EXPO_PUBLIC_API_BASE_URL`) still alive?
  `curl $URL/config` should return JSON. Quick tunnels change URL on restart.
- Restarted `npx expo start` after editing `.env`? `EXPO_PUBLIC_*` is baked in at bundle time.
- Photo upload failing on SDK 57: fixed in `liveClient.photoPart` (expo/fetch
  rejects `{ uri }` FormData parts). In dev, Metro prints
  `[api] POST /proposals failed before a response:` with the real error.

## Job fails with PROVIDER_UNAVAILABLE / "AI service" error

The request reached the backend, the AI call failed.

- Check the worker log. `404 ... no longer available` → retired model ID; see
  `docs/AI_SETUP.md#model-names-go-stale`.
- `429` → rate limit; wait and Retry.
- Changed `backend/.env`? **Restart `run_worker`** — it keeps old settings.
- `python manage.py check_providers` pings the configured providers.

## Concept image is just my original photo

You're on the `fake` render provider (or an old build that silently fell back
to it). Set `RENDER_PROVIDER=gemini_image` and restart the worker. Current
code fails the job honestly instead of faking.

## App freezes / stops while brushing

Fixed in `MaskCanvas` (JS-thread gestures, per-frame drawing, one state update
per stroke) and `babel.config.js` (worklets plugin was applied twice). After
pulling, **clear the Metro cache**: `npx expo start -c`.

## "Maximum update depth exceeded" after generation

Fixed: `useInvalidateProposal` is now stable and Imagine navigates to Review
once per job. If you add hooks to effect deps, keep them `useCallback`-stable.

## Map tab crashes / blank on Android

Android dev builds need `GOOGLE_MAPS_ANDROID_API_KEY` at build time
(`mobile/app.config.js`). Without it you get a placeholder, not a crash. After
setting it: `npx expo prebuild --platform android --clean && npx expo run:android`.
In Expo Go and on iOS no key is needed.

## Nearby shows nothing

Nearby needs location permission, and each proposal needs a resolvable place
name (or was created on this device with "Use my location"). Web has no
geocoder, so Nearby/Map are native-only.

## Web preview: "Incompatible React versions"

`react`, `react-dom` and `react-native` must match the SDK
(`npx expo install react react-dom react-native`).

## Packet download fails

Needs live mode. On SDK 57 the old `FileSystem.downloadAsync` throws; the app
uses `File.downloadFileAsync`.

## expo-doctor: "app config fields that may not be synced"

Expected while `mobile/android/` is committed. Re-run prebuild after changing
native config (see `mobile/README.md`).
