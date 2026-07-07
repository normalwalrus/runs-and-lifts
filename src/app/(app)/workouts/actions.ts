"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { sessionExercises, sets, workoutSessions } from "@/db/schema";

export type WorkoutPayload = {
  date: string;
  name: string;
  notes: string;
  exercises: {
    exerciseId: number;
    sets: { weightKg: number; reps: number }[];
  }[];
};

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

function validate(payload: WorkoutPayload): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) return "Please pick a valid date.";
  if (payload.exercises.length === 0) return "Add at least one exercise.";
  for (const ex of payload.exercises) {
    if (!Number.isInteger(ex.exerciseId) || ex.exerciseId <= 0)
      return "Every exercise block needs an exercise selected.";
    if (ex.sets.length === 0) return "Every exercise needs at least one set.";
    for (const s of ex.sets) {
      if (!Number.isFinite(s.weightKg) || s.weightKg < 0)
        return "Set weights must be 0 or more.";
      if (!Number.isInteger(s.reps) || s.reps <= 0)
        return "Set reps must be at least 1.";
    }
  }
  return null;
}

async function insertExercisesAndSets(tx: Tx, sessionId: number, payload: WorkoutPayload) {
  for (const [exIdx, ex] of payload.exercises.entries()) {
    const [{ id: sessionExerciseId }] = await tx
      .insert(sessionExercises)
      .values({ sessionId, exerciseId: ex.exerciseId, position: exIdx })
      .returning({ id: sessionExercises.id });
    for (const [setIdx, s] of ex.sets.entries()) {
      await tx.insert(sets).values({
        sessionExerciseId,
        position: setIdx,
        weightKg: s.weightKg,
        reps: s.reps,
      });
    }
  }
}

export async function saveWorkout(
  id: number | null,
  payload: WorkoutPayload
): Promise<{ error: string } | void> {
  const error = validate(payload);
  if (error) return { error };

  const session = {
    date: payload.date,
    name: payload.name.trim() || null,
    notes: payload.notes.trim() || null,
  };

  if (id !== null) {
    const [exists] = await db
      .select({ id: workoutSessions.id })
      .from(workoutSessions)
      .where(eq(workoutSessions.id, id))
      .limit(1);
    if (!exists) {
      return { error: "This workout no longer exists — it may have been deleted." };
    }
  }

  await db.transaction(async (tx) => {
    if (id === null) {
      const [{ id: newId }] = await tx
        .insert(workoutSessions)
        .values(session)
        .returning({ id: workoutSessions.id });
      await insertExercisesAndSets(tx, newId, payload);
    } else {
      await tx.update(workoutSessions).set(session).where(eq(workoutSessions.id, id));
      // Simplest correct update: wipe and reinsert children (sets cascade).
      await tx.delete(sessionExercises).where(eq(sessionExercises.sessionId, id));
      await insertExercisesAndSets(tx, id, payload);
    }
  });

  revalidatePath("/workouts");
  revalidatePath("/");
  redirect("/workouts");
}

export async function deleteWorkout(id: number) {
  await db.delete(workoutSessions).where(eq(workoutSessions.id, id));
  revalidatePath("/workouts");
  revalidatePath("/");
  // The delete button lives on the detail page of the workout being deleted.
  redirect("/workouts");
}
