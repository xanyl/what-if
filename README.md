# WhatIf

**WhatIf** (codebase name: PlacePatch) turns a photo of a local place into a clearly labeled AI improvement concept, a community proposal people can support, and a downloadable request packet.

> *What if this bus stop had shade?* Snap it, brush where the change goes, and let AI imagine it — then rally your neighbors.

**Full loop:** sign in → take/upload photo → enter place + problem + consent → AI reads the scene and suggests changes → user picks one → user brushes the area to edit → AI generates the concept → AI review flags issues → user edits wording and approves → publish → others support (one each) → export a PDF packet.

Built at **Hacklanta 2026** — **Cox Social Good** track, side challenges: Gemini, Auth0, Tiger Data.

- Single source of truth: `docs/MASTER_PLAN.md` (§5 is the API contract — law).
- Rules for AI agents: `AGENTS.md`.
- Machine-readable contract: `shared/contract/openapi.yaml`.

## Repository layout

```
README.md                    run instructions
AGENTS.md                    rules for AI agents
docs/MASTER_PLAN.md          the master build plan (source of truth)
docs/DECISIONS.md            decision log (fill at G0)
docs/prompts/                agent prompt templates (P2)
shared/contract/openapi.yaml THE contract (§5) — P4 owns
shared/fixtures/*.json       sample responses matching the contract (§5.9)
shared/demo/                 consented demo photo(s) + sample strokes (no private photos)
scripts/sync_fixtures.py     copies shared/fixtures -> mobile/src/fixtures, web/src/fixtures
scripts/validate_fixtures.py validates fixtures against openapi.yaml
config/backend.env.example   all backend env vars, empty secrets
config/mobile.env.example
config/web.env.example
backend/
  manage.py, requirements.txt
  config/        settings.py, urls.py, wsgi.py           (P4)
  common/        errors.py, types.py                     (P4; shared exceptions)
  core/          models, auth, views, services, worker   (P4)
  agents/        analyze/prompt/review/draft             (P2)
  imaging/       render adapters, mask utils, cli        (P3)
workflows/       ComfyUI API-format workflow JSON        (P3)
mobile/          Expo SDK 57 app — see mobile/README.md  (P1)
web/             (later) Vite app                        (P1)
deploy/          docker-compose.yml, Caddyfile, Dockerfile (P4)
```

## Run the backend (dev)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../config/backend.env.example .env   # then fill in secrets locally — never commit .env
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
# in a second terminal (same venv):
python manage.py run_worker
```

For phone testing, expose the API with a tunnel and point `PUBLIC_BASE_URL`,
`DJANGO_ALLOWED_HOSTS` and the mobile `EXPO_PUBLIC_API_BASE_URL` at the tunnel URL
(see `docs/MASTER_PLAN.md` §9.5 step 8).

Real AI (Gemini) needs `GEMINI_API_KEY`, `GEMINI_MODEL` and `GEMINI_IMAGE_MODEL`
in `backend/.env` — see `docs/AI_SETUP.md`. **Restart `run_worker` after any
`.env` change**; the worker reads settings only at startup.

## Run the mobile app

```bash
cd mobile
npm install
cp ../config/mobile.env.example .env    # EXPO_PUBLIC_API_MODE=fixture works with no backend
npx expo start -c                       # -c clears the Metro cache (needed after babel/config changes)
```

Full guide (fixture vs live mode, Android dev build, maps key): `mobile/README.md`.
Something broken? `docs/TROUBLESHOOTING.md`.

## Validate the contract

```bash
python3 scripts/validate_fixtures.py   # fixtures vs openapi.yaml — must pass
python3 scripts/sync_fixtures.py       # copy fixtures into mobile/ and web/
```

## Tests

```bash
# from the repo root, with the backend venv
backend/.venv/bin/python -m pytest backend/agents backend/imaging -q
backend/.venv/bin/python -m pytest backend/core/tests -q
cd mobile && npx tsc --noEmit && npx expo-doctor
```

Backend core tests cover contract-shape validation against `openapi.yaml`,
auth (JWT + dev bypass), support idempotency (incl. concurrent threads),
revision conflicts, STALE_RESULT, publish gate, mask rasterization, worker
lease reclaim and the packet PDF. Some newer upstream tests (posts) need
models that are not committed yet — see `docs/HANDOFF.md`.

Provider choices are env vars (`SCENE_PROVIDER`, `DRAFT_PROVIDER`,
`REVIEW_PROVIDER`, `RENDER_PROVIDER` — `ollama` | `gemini` | `comfyui` |
`gemini_image` | `fake`); dev default is `fake` everywhere, so the full loop
works with no API keys. `python manage.py check_providers` pings the
configured providers.

## Honesty rules (all modules)

- Every concept image and packet is labeled "AI illustration — not an engineering design".
- Fixture mode shows a permanent banner: `DEVELOPMENT FIXTURES — NOT LIVE AI`.
- A failed AI call shows an honest error with a retry button. Never substitute a prepared image silently.
- Exporting a packet does not mean it was sent anywhere.
