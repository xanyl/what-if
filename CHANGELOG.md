# Changelog

## 1.1.0 — 2026-10-11 · WhatIf

### Mobile
- Rebranded to **WhatIf**: icon, splash, onboarding, editorial design system
  (Fraunces + Poppins, forest green / sun orange).
- 5-step create studio: Photo (+ "Use my location") → AI ideas (live scene
  scan) → Brush (coverage meter, true eraser, peek) → Imagine (live render
  timeline) → Review (AI verdict, hold-to-compare slider) → celebration.
- Community: hero, search, filters (Nearby, Transit, Streets, Parks, Top,
  Supported); new **Map** tab; richer detail, Mine and Profile screens.
- Fixed: photo upload on SDK 57, brush freezes, render loop after generation,
  packet download, React version mismatch, misleading "AI service is down".
- Android project regenerated; Maps key via `GOOGLE_MAPS_ANDROID_API_KEY`.

### Backend
- Gemini models updated (`gemini-3.8-flash`, `gemini-3.1-flash-image`).
- Real image renders: fixed the `edit_goal` mismatch that silently fell back
  to a fake render; real failures now fail the job honestly.
- Gemini API key sent in a header, not the URL. `numpy` added to requirements.

### Docs
- New: `mobile/README.md`, `docs/AI_SETUP.md`, `docs/TROUBLESHOOTING.md`,
  `docs/HANDOFF.md`. README and `docs/DECISIONS.md` updated.

### Known issues
- Upstream posts tests and migration `0002` need models not yet committed
  (`docs/HANDOFF.md`).

## 1.0.0 — 2026-10-10 · PlacePatch (Hacklanta 2026)
- First end-to-end build: capture → scene → brush → render → review →
  publish → support → PDF packet. Contract in `shared/contract/openapi.yaml`.
