"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { workoutVolume } from "@/lib/stats";
import { formatDate, formatWeight } from "@/lib/format";

export default function WorkoutsPage() {
  const store = useStore();
  const sessions = [...store.workouts].sort(
    (a, b) => b.date.localeCompare(a.date) || b.id - a.id
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workouts</h1>
        <Link
          href="/workouts/new"
          className="rounded-lg bg-lift px-4 py-2 font-semibold text-background hover:opacity-90"
        >
          Log workout
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-hairline p-8 text-center text-ink-muted">
          No workouts yet. Log your first one!
        </p>
      ) : (
        <ul className="space-y-2">
          {sessions.map((session) => {
            const setCount = session.exercises.reduce((n, ex) => n + ex.sets.length, 0);
            return (
              <li key={session.id}>
                <Link
                  href={`/workouts/view?id=${session.id}`}
                  className="block rounded-xl border border-hairline bg-card p-4 hover:border-ink-muted"
                >
                  <div className="num flex items-center gap-2 text-sm text-ink-muted">
                    <span className="plate bg-lift" aria-hidden />
                    {formatDate(session.date)}
                  </div>
                  <div className="mt-1 font-semibold">{session.name ?? "Workout"}</div>
                  <div className="num text-sm text-ink-muted">
                    {session.exercises.length} exercise
                    {session.exercises.length === 1 ? "" : "s"} · {setCount} sets ·{" "}
                    {formatWeight(workoutVolume(session))} total volume
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
