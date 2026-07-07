"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import WorkoutForm from "@/components/WorkoutForm";

function EditWorkout() {
  const params = useSearchParams();
  const store = useStore();
  const id = Number(params.get("id"));
  const session = store.workouts.find((w) => w.id === id);
  const exerciseOptions = [...store.exercises].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  if (!session) {
    return (
      <p className="text-ink-muted">Workout not found — it may have been deleted.</p>
    );
  }
  return (
    <WorkoutForm
      workoutId={session.id}
      exerciseOptions={exerciseOptions}
      initial={{
        date: session.date,
        name: session.name,
        notes: session.notes,
        exercises: session.exercises,
      }}
      submitLabel="Save changes"
    />
  );
}

export default function EditWorkoutPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit workout</h1>
      <Suspense>
        <EditWorkout />
      </Suspense>
    </div>
  );
}
