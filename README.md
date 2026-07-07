# Fitness Tracker

Personal web app for tracking runs (distance, pace, time) and weight-lifting workouts (per-set weight × reps), with progress charts and personal records. Single user, password-protected, local SQLite database.

## Stack

Next.js (App Router, TypeScript) · Tailwind CSS · Drizzle ORM + better-sqlite3 · Recharts · jose (session cookie)

## Setup

```bash
cp .env.example .env   # then fill in APP_PASSWORD and SESSION_SECRET
npm install
npm run db:push        # create tables in data/fitness.db
npm run db:seed        # seed common exercises (idempotent)
npm run dev            # http://localhost:3000
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

- All data lives in `data/fitness.db` (gitignored). Back it up by copying the file.
- Weights are kg, distances km. Dates are stored as `YYYY-MM-DD` text.
- Deleting an exercise that's used in a workout is blocked; delete the workouts first.
