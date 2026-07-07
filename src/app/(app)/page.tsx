"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  getCurrentMonthTotals,
  getCurrentWeekTotals,
  getExercisePRs,
  getFastestRun,
  getLongestRun,
} from "@/lib/stats";
import { formatDate, formatDuration, formatPace, formatWeight } from "@/lib/format";
import StatCard from "@/components/StatCard";
import BackupPanel from "@/components/BackupPanel";

export default function DashboardPage() {
  const store = useStore();
  const fastest = getFastestRun(store.runs);
  const longest = getLongestRun(store.runs);
  const prs = getExercisePRs(store);
  const weekly = getCurrentWeekTotals(store);
  const monthly = getCurrentMonthTotals(store);

  const recent = [
    ...store.runs.map((r) => ({
      key: `run-${r.id}`,
      href: `/runs`,
      kind: "run" as const,
      date: r.date,
      id: r.id,
      title: `${r.distanceKm} km run`,
      subtitle: `${formatDuration(r.durationSec)} · ${formatPace(r.durationSec, r.distanceKm)}`,
    })),
    ...store.workouts.map((w) => ({
      key: `workout-${w.id}`,
      href: `/workouts/view?id=${w.id}`,
      kind: "lift" as const,
      date: w.date,
      id: w.id,
      title: w.name ?? "Workout",
      subtitle: w.exercises
        .map(
          (ex) => store.exercises.find((e) => e.id === ex.exerciseId)?.name ?? "Unknown"
        )
        .join(", "),
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <section>
        <h2 className="eyebrow mb-2">Personal records</h2>
        {!fastest && prs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-hairline p-6 text-center text-sm text-ink-muted">
            Log some runs and workouts to see your PRs here.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {fastest && (
              <StatCard
                label="Fastest pace"
                accent="gold"
                value={formatPace(fastest.durationSec, fastest.distanceKm)}
                detail={`${fastest.distanceKm} km on ${formatDate(fastest.date)}`}
              />
            )}
            {longest && (
              <StatCard
                label="Longest run"
                accent="gold"
                value={`${longest.distanceKm} km`}
                detail={formatDate(longest.date)}
              />
            )}
            {prs.slice(0, 4).map((pr) => (
              <StatCard
                key={pr.exerciseId}
                label={pr.exerciseName}
                accent="gold"
                value={formatWeight(pr.maxWeightKg)}
                detail="Heaviest set"
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="eyebrow mb-2">This week / month</h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "This week", totals: weekly },
            { label: "This month", totals: monthly },
          ].map(({ label, totals }) => (
            <StatCard
              key={label}
              label={label}
              value={`${totals.runDistanceKm.toFixed(1)} km · ${totals.workoutCount} lift${totals.workoutCount === 1 ? "" : "s"}`}
              detail={`${totals.runCount} run${totals.runCount === 1 ? "" : "s"} · ${formatWeight(totals.volumeKg)} volume`}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="eyebrow mb-2">Recent activity</h2>
        {recent.length === 0 ? (
          <div className="flex gap-2">
            <Link
              href="/runs/new"
              className="rounded-lg bg-run px-4 py-2 font-semibold text-background hover:opacity-90"
            >
              Log a run
            </Link>
            <Link
              href="/workouts/new"
              className="rounded-lg bg-lift px-4 py-2 font-semibold text-background hover:opacity-90"
            >
              Log a workout
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {recent.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="block rounded-xl border border-hairline bg-card p-3 hover:border-ink-muted"
                >
                  <div className="num text-xs text-ink-muted">{formatDate(item.date)}</div>
                  <div className="flex items-center gap-2 font-medium">
                    <span
                      className="plate"
                      style={{ background: `var(--${item.kind})` }}
                      aria-hidden
                    />
                    {item.title}
                  </div>
                  {item.subtitle && (
                    <div className="num text-sm text-ink-muted">{item.subtitle}</div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="eyebrow mb-2">Backup</h2>
        <BackupPanel />
      </section>
    </div>
  );
}
