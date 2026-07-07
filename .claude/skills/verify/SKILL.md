---
name: verify
description: Build, launch, and drive this fitness-tracker app end-to-end with headless Chrome to verify changes at the real UI surface.
---

# Verifying this app

## Build & launch

```bash
npm run build                       # catches server/client boundary + type errors
cp data/fitness.db /tmp/fitness.db.bak   # back up before generating test data
PORT=3199 npm run start              # run in background
```

Wait for `curl -s http://localhost:3199/login` → 200. Login password comes from `APP_PASSWORD` in `.env` (default dev value: `changeme`).

## Drive it

`scripts/e2e.mjs` is a full puppeteer-core suite (login, runs CRUD + live pace preview, workout CRUD with per-set weights, exercise library, PRs, charts, mobile viewport, deletes, logout):

```bash
SHOTS_DIR=/tmp node scripts/e2e.mjs   # run from repo root so node_modules resolves
```

Uses system Chrome at `/usr/bin/google-chrome` with `--no-sandbox`. Exits non-zero on any FAIL; screenshots land in `SHOTS_DIR`.

## Gotchas learned the hard way

- **Never restore/replace `data/fitness.db` while the server is running** — better-sqlite3 holds a WAL connection and the old data survives. Kill the server (`pkill -f next-server` — the process is named `next-server`, not `next start`), delete `-wal`/`-shm` files, copy the backup, restart.
- **React controlled inputs**: `el.value = ""` via evaluate does NOT update React state; typed text appends to the old state. Use the native value setter + `dispatchEvent(new Event("input", {bubbles: true}))` (see `clearAndType` in the script). Triple-click select-all does not work on `<input type=number>` in headless Chrome.
- `innerText` reflects CSS `text-transform: uppercase` (StatCard labels) — match case-insensitively.
- A single-data-point line chart renders a dot but zero `path.recharts-curve` elements — create ≥2 runs before asserting on lines.
- Server actions navigate via the client router, not a full page load — wait on `location.pathname`, not `waitForNavigation`.
- Restore the DB backup after the run so test data doesn't linger.
