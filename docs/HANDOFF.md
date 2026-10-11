# Handoff — 2026-10-11 (P1 → P2 / P3 / P4)

Format per `AGENTS.md`. One block per receiving owner.

## To P4 (Backend / integration)

```
I changed:      backend/core/services/pipeline.py — inline fake render only on ImportError of
                backend.imaging; real render errors fail the job (retryable).
                backend/requirements.txt — numpy (imaging/composite.py imports it).
You call:       nothing new; contract §5 unchanged.
You send:       —
You receive:    —
It needs:       restart run_worker after any backend/.env change.
I verified:     live pipeline: scene ~12s → mask → gemini_image render ~29s → review
                (needs_review, 3 honest flags); agents+imaging tests 39 passed.
Still blocked:  upstream merge added core/tests/test_post*.py, test_models.py, etc. and
                migration 0002_asset_post_job_event_asset_post_and_more, which import
                Post / AssetKind — NOT defined in core/models.py. Collection errors until
                the models are committed. Do not run `migrate` before that. Owner: P4.
```

## To P2 (Agents)

```
I changed:      agents/providers gemini default model → gemini-3.8-flash (2.x IDs 404).
You call:       —
You send:       EditPrompt is your pydantic model with field edit_goal (alias editGoal);
                imaging now reads either.
You receive:    —
It needs:       GEMINI_MODEL in backend/.env.
I verified:     GeminiProvider.generate_json live call OK.
Still blocked:  agents/tests/test_agents.py imports ModerationResult (not in
                agents/schemas.py). Also agents/providers.py is shadowed by the
                agents/providers/ package and never imported. Owner: P2.
```

## To P3 (Imaging)

```
I changed:      imaging/providers/gemini_image.py — reads editGoal OR edit_goal (the
                AttributeError made every render fall back to fake); default model
                gemini-3.1-flash-image; API key in x-goog-api-key header, not the URL.
                openai_image.py — same edit_goal fallback.
You call:       render_edit(source, mask, prompt, timeout_s) — unchanged.
You send:       —
You receive:    —
It needs:       GEMINI_API_KEY, GEMINI_IMAGE_MODEL.
I verified:     render_at_work_size live → 896×1195 edit, composited.
Still blocked:  none.
```

## Mobile surfaces others may touch

- New screens: `/onboarding`, `/(tabs)/map`, `/proposal/[id]/celebrate`.
- Design system in `mobile/src/ui/`; tokens in `mobile/src/theme.ts`.
- On-device only (never sent to the API): capture coordinates, onboarding flag.
- See `mobile/README.md` and `docs/TROUBLESHOOTING.md`.
