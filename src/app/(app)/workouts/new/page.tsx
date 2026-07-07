import { asc } from "drizzle-orm";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import WorkoutForm from "@/components/WorkoutForm";

export const dynamic = "force-dynamic";

export default async function NewWorkoutPage() {
  const exerciseOptions = await db
    .select({ id: exercises.id, name: exercises.name })
    .from(exercises)
    .orderBy(asc(exercises.name));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Log workout</h1>
      <WorkoutForm
        sessionId={null}
        exerciseOptions={exerciseOptions}
        submitLabel="Save workout"
      />
    </div>
  );
}
