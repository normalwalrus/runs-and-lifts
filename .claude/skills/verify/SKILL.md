---
name: verify
description: Build and drive this static fitness-tracker app end-to-end with headless Chrome to verify changes at the real UI surface.
---

# Verifying this app

Fully client-side Next.js static export (localStorage data, no server, no auth). Deployed to GitHub Pages at https://normalwalrus.github.io/runs-and-lifts/ by `.github/workflows/deploy.yml` on push to main (repo: normalwalrus/runs-and-lifts).

## Build & serve like Pages does

```bash
npm run build                        # static export to out/
mkdir -p /tmp/serve-root && ln -sfn "$PWD/out" /tmp/serve-root/runs-and-lifts
npx serve /tmp/serve-root -l 3199    # background; mirrors the /runs-and-lifts basePath
```

The basePath is `/runs-and-lifts` — always test under that prefix; asset URLs break if you serve `out/` at the root.

## Drive it

Use puppeteer-core with system Chrome (`/usr/bin/google-chrome`, `--no-sandbox`). Key flows: run creation with the live pace preview, workout with different weights per set, exercise add/duplicate/blocked-delete, dashboard PRs, charts on /progress, reload persistence, mobile 390px overflow. Start each session with `localStorage.clear()` for a clean fixture; data key is `runs-and-lifts:v1`.

To verify production, point the same script at `BASE_URL=https://normalwalrus.github.io/runs-and-lifts`.

## Gotchas

- **React controlled inputs**: setting `.value` directly doesn't update React state; use the native value setter + `dispatchEvent(new Event("input", {bubbles: true}))`. Triple-click select-all doesn't work on number inputs in headless Chrome.
- `innerText` reflects CSS `text-transform: uppercase` (stat-card labels) — match case-insensitively.
- A single-data-point line chart renders a dot but no `path.recharts-curve` — create ≥2 entries before asserting on lines.
- Detail/edit pages use query params (`/workouts/view?id=N`), not path params — static export can't do dynamic routes over user data.
- `gh run watch <id> --repo normalwalrus/runs-and-lifts` to follow a Pages deploy after pushing.
