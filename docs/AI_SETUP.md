# AI setup — Gemini (and fallbacks)

WhatIf uses AI in four places. Each is chosen by an env var in `backend/.env`
(template: `config/backend.env.example`):

| Step | Env var | What it does |
|---|---|---|
| Scene | `SCENE_PROVIDER` | Reads the photo: summary, observations, things to keep, 2+ change options |
| Draft | `DRAFT_PROVIDER` | Writes the title + polite change request |
| Render | `RENDER_PROVIDER` | Paints the chosen change **inside the brushed mask only** |
| Review | `REVIEW_PROVIDER` | Checks the result; flags issues (warning / blocking) |

Values: `gemini` · `openai` · `ollama` · `fake` (text) and `gemini_image` ·
`openai_image` · `comfyui` · `fake` (render), or `fallback` to try
`SCENE_CHAIN` / `RENDER_CHAIN` etc. in order (only transient errors move to the
next leg — see `docs/DECISIONS.md`).

## Gemini in 3 steps

1. Create a key at Google AI Studio and put it in `backend/.env`:
   ```
   GEMINI_API_KEY=...            # never commit
   GEMINI_MODEL=gemini-3.8-flash
   GEMINI_IMAGE_MODEL=gemini-3.1-flash-image
   SCENE_PROVIDER=gemini
   DRAFT_PROVIDER=gemini
   REVIEW_PROVIDER=gemini
   RENDER_PROVIDER=gemini_image
   ```
2. **Restart both** `runserver` and `run_worker` (settings are read at startup).
3. Verify: `python manage.py check_providers`, then create a proposal in the app.

## Model names go stale

Google retires model IDs; a retired ID returns **404 "no longer available"**
and every job fails. On 2026-10-11 `gemini-2.0-*` and `gemini-2.5-*` were
already gone. To see what your key can use:

```python
from google import genai
for m in genai.Client(api_key=KEY).models.list():
    print(m.name)
```

Pick a current `*-flash` model for text and a `*-flash-image` model for render.

## How a render works

1. The mask strokes are rasterized server-side (same size as the photo).
2. `gemini_image` gets the photo plus a guide image with the brush area tinted
   red, and an instruction built from the option's `editGoal` and `preserve`
   list.
3. The result is composited back so pixels outside the mask stay identical;
   the reviewer reports `outsideMaskChange`.
4. Provenance (`provider`, `model`, `durationMs`) is stored on the proposal and
   shown in the app ("How this was made").

Notes:
- The API key is sent in the `x-goog-api-key` header, never in the URL, so it
  doesn't end up in logs.
- If the real provider fails, the job fails with a retryable error and the app
  shows **Try again** — it never substitutes the original photo as a "concept".
- Rate limits (429) are normal on free tiers; wait or switch `RENDER_PROVIDER`.

## Other providers

- **OpenAI:** `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_IMAGE_MODEL`.
- **Ollama (local text/vision):** `OLLAMA_BASE_URL`, `OLLAMA_VISION_MODEL`, `OLLAMA_TEXT_MODEL`.
- **ComfyUI (local inpaint):** `COMFYUI_BASE_URL`, `COMFYUI_WORKFLOW` (see `workflows/`).
- **xAI image** (added upstream, `backend/imaging/providers/xai_image.py`):
  `XAI_API_KEY`, `XAI_IMAGE_MODEL`, optional `XAI_BASE_URL`.
- **fake:** no keys; returns honest placeholder output for UI work.
