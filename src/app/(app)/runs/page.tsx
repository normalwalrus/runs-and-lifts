import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { runs } from "@/db/schema";
import { formatDate, formatDuration, formatPace, formatSpeed } from "@/lib/format";
import DeleteButton from "@/components/DeleteButton";
import { deleteRun } from "./actions";

export const dynamic = "force-dynamic";

export default async function RunsPage() {
  const allRuns = await db
    .select()
    .from(runs)
    .orderBy(desc(runs.date), desc(runs.createdAt));

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="eyebrow text-gold">The engine room</div>
          <h1 className="display mt-1 text-5xl uppercase italic leading-none">Runs</h1>
          <div className="chevrons mt-3 w-24" aria-hidden />
        </div>
        <Link href="/runs/new" className="cta rounded-md px-4 py-2">
          Log run
        </Link>
      </div>

      {allRuns.length === 0 ? (
        <p className="rounded-lg border border-dashed border-hairline p-8 text-center text-ink-muted">
          No runs yet. The start line is patient. You shouldn&apos;t be.
        </p>
      ) : (
        <ul className="space-y-2">
          {allRuns.map((run) => (
            <li
              key={run.id}
              className="rounded-xl border border-hairline bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="num flex items-center gap-2 text-sm text-ink-muted">
                    <span className="plate bg-run" aria-hidden />
                    {formatDate(run.date)}
                  </div>
                  <div className="num mt-1 font-semibold">
                    {run.distanceKm} km · {formatDuration(run.durationSec)}
                  </div>
                  <div className="num text-sm text-ink-muted">
                    {formatPace(run.durationSec, run.distanceKm)} ·{" "}
                    {formatSpeed(run.durationSec, run.distanceKm)}
                  </div>
                  {run.notes && (
                    <div className="mt-1 text-sm text-ink-muted">{run.notes}</div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/runs/${run.id}/edit`}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-hairline"
                  >
                    Edit
                  </Link>
                  <DeleteButton
                    action={deleteRun.bind(null, run.id)}
                    confirmMessage="Delete this run? The official result will read DNS: Did Not Sweat."
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
