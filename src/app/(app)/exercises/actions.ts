"use server";

import { count, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { exercises, sessionExercises } from "@/db/schema";

export type ExerciseActionState = { error: string } | null;

/** Case-insensitive lookup so "squat" can't be added alongside "Squat". */
async function findByName(name: string) {
  const rows = await db
    .select({ id: exercises.id })
    .from(exercises)
    .where(sql`lower(${exercises.name}) = lower(${name})`)
    .limit(1);
  return rows[0];
}

export async function createExercise(
  _prev: ExerciseActionState,
  formData: FormData
): Promise<ExerciseActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };
  if (await findByName(name)) return { error: `"${name}" already exists.` };
  await db.insert(exercises).values({ name });
  revalidatePath("/exercises");
  return null;
}

export async function renameExercise(
  id: number,
  _prev: ExerciseActionState,
  formData: FormData
): Promise<ExerciseActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };
  const dup = await findByName(name);
  if (dup && dup.id !== id) return { error: `"${name}" already exists.` };
  await db.update(exercises).set({ name }).where(eq(exercises.id, id));
  revalidatePath("/exercises");
  return null;
}

export async function deleteExercise(id: number): Promise<ExerciseActionState> {
  const [usage] = await db
    .select({ n: count() })
    .from(sessionExercises)
    .where(eq(sessionExercises.exerciseId, id));
  if (usage.n > 0) {
    return {
      error: `This exercise is used in ${usage.n} workout${usage.n === 1 ? "" : "s"} and can't be deleted.`,
    };
  }
  await db.delete(exercises).where(eq(exercises.id, id));
  revalidatePath("/exercises");
  return null;
}
