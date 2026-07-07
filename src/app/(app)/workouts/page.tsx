import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { formatDate, formatWeight } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function WorkoutsPage() {
  const sessions = await db.query.workoutSessions.findMany({
    orderBy: (ws) => [desc(ws.date), desc(ws.createdAt)],
    with: { sessionExercises: { with: { sets: true } } },
  });

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
            const allSets = session.sessionExercises.flatMap((se) => se.sets);
            const volume = allSets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
            return (
              <li key={session.id}>
                <Link
                  href={`/workouts/${session.id}`}
                  className="block rounded-xl border border-hairline bg-card p-4 hover:border-ink-muted"
                >
                  <div className="num flex items-center gap-2 text-sm text-ink-muted">
                    <span className="plate bg-lift" aria-hidden />
                    {formatDate(session.date)}
                  </div>
                  <div className="mt-1 font-semibold">
                    {session.name ?? "Workout"}
                  </div>
                  <div className="num text-sm text-ink-muted">
                    {session.sessionExercises.length} exercise
                    {session.sessionExercises.length === 1 ? "" : "s"} · {allSets.length}{" "}
                    sets · {formatWeight(volume)} total volume
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
