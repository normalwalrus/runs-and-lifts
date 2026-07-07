import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { runs } from "@/db/schema";
import RunForm from "@/components/RunForm";
import { updateRun } from "../../actions";

export default async function EditRunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [run] = await db
    .select()
    .from(runs)
    .where(eq(runs.id, Number(id)))
    .limit(1);
  if (!run) notFound();

  return (
    <div className="space-y-4">
      <div>
        <div className="eyebrow text-gold">Stewards&apos; inquiry</div>
        <h1 className="display mt-1 text-4xl uppercase italic leading-none">Edit run</h1>
      </div>
      <RunForm
        action={updateRun.bind(null, run.id)}
        initial={{
          date: run.date,
          distanceKm: run.distanceKm,
          durationSec: run.durationSec,
          notes: run.notes,
        }}
        submitLabel="Save changes"
      />
    </div>
  );
}
