# Runs & Lifts — the sweat ledger

Personal web app for tracking runs (distance, pace, time) and weight-lifting workouts (per-set weight × reps), with progress charts and personal records. Single user, password-protected, Postgres database.

## Stack

Next.js (App Router, TypeScript) · Tailwind CSS · Drizzle ORM + node-postgres · Recharts · jose (session cookie)

## Setup (local, no Postgres install needed)

```bash
cp .env.example .env   # fill in APP_PASSWORD and SESSION_SECRET;
                       # DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/postgres
npm install
npm run db:local       # embedded Postgres (PGlite) on port 5433 — keep it running
npm run dev            # in a second terminal → http://localhost:3000
```

`db:local` creates the schema and seeds the exercise library on first run; data persists in `data/pglite`.

## Setup (real Postgres, e.g. Neon)

```bash
cp .env.example .env   # set DATABASE_URL to your Postgres connection string
npm install
npm run db:push        # create tables
npm run db:seed        # seed common exercises (idempotent)
npm run dev
```

Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Pages

- `/` — dashboard: PRs, weekly/monthly totals, recent activity
- `/runs` — run log (pace and speed auto-calculated from distance + time)
- `/workouts` — lifting sessions with per-set weight × reps
- `/exercises` — exercise library (add/rename/delete), per-exercise progression
- `/progress` — pace, distance, and lifting progression charts

## Notes

- With `db:local`, all data lives in `data/pglite` (gitignored). Back it up by copying the folder while the DB is stopped.
- Weights are kg, distances km. Dates are stored as `YYYY-MM-DD` text.
- Deleting an exercise that's used in a workout is blocked; delete the workouts first.
