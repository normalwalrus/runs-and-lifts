# Runs & Lifts — the sweat ledger

Tracks runs (distance, pace, time) and weight-lifting workouts (per-set weight × reps), with progress charts and personal records. Fully client-side: **your data lives in your browser's localStorage** — nothing is sent to any server. Use the Backup section on the dashboard to export/import your data as JSON.

Live site: deployed to GitHub Pages by the workflow in `.github/workflows/deploy.yml` on every push to `main`.

## Stack

Next.js (App Router, static export) · TypeScript · Tailwind CSS · Recharts · localStorage

## Development

```bash
npm install
npm run dev     # http://localhost:3000/runs-and-lifts
npm run build   # static export to out/
```

## Pages

- `/` — dashboard: PRs, weekly/monthly totals, recent activity, backup export/import
- `/runs` — run log (pace and speed auto-calculated from distance + time)
- `/workouts` — lifting sessions with per-set weight × reps
- `/exercises` — exercise library (add/rename/delete), per-exercise progression
- `/progress` — pace, distance, and lifting progression charts

## Notes

- Weights are kg, distances km. Data model versioned under the `runs-and-lifts:v1` localStorage key.
- Each browser/device has its own data; move it with Export/Import on the dashboard.
- Deleting an exercise that's used in a workout is blocked; delete the workouts first.
