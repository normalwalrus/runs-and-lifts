import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { formatDate, formatWeight, volumeQuip } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function WorkoutsPage() {
  const sessions = await db.query.workoutSessions.findMany({
    orderBy: (ws) => [desc(ws.date), desc(ws.createdAt)],
    with: { sessionExercises: { with: { sets: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="eyebrow text-gold">Station work</div>
          <h1 className="display mt-1 text-5xl uppercase italic leading-none">
            Workouts
          </h1>
          <div className="chevrons mt-3 w-24" aria-hidden />
        </div>
        <Link href="/workouts/new" className="cta rounded-md px-4 py-2">
          Log workout
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-hairline p-8 text-center text-ink-muted">
          No workouts yet. Station 1 is free. It has always been free.
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
                    {volumeQuip(volume) && (
                      <span className="italic"> ({volumeQuip(volume)})</span>
                    )}
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
