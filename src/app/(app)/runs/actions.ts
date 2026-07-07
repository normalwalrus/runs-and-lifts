"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { runs } from "@/db/schema";

export type RunFormState = { error: string } | null;

function parseRunForm(formData: FormData): {
  values?: { date: string; distanceKm: number; durationSec: number; notes: string | null };
  error?: string;
} {
  const date = String(formData.get("date") ?? "");
  const distanceKm = Number(formData.get("distanceKm"));
  const hours = Number(formData.get("hours") || 0);
  const minutes = Number(formData.get("minutes") || 0);
  const seconds = Number(formData.get("seconds") || 0);
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Please pick a valid date." };
  if (!Number.isFinite(distanceKm) || distanceKm <= 0)
    return { error: "Distance must be greater than 0." };
  const durationSec = Math.round(hours * 3600 + minutes * 60 + seconds);
  if (!Number.isFinite(durationSec) || durationSec <= 0)
    return { error: "Duration must be greater than 0." };

  return { values: { date, distanceKm, durationSec, notes } };
}

export async function createRun(_prev: RunFormState, formData: FormData): Promise<RunFormState> {
  const { values, error } = parseRunForm(formData);
  if (!values) return { error: error! };
  await db.insert(runs).values(values);
  revalidatePath("/runs");
  revalidatePath("/");
  redirect("/runs");
}

export async function updateRun(
  id: number,
  _prev: RunFormState,
  formData: FormData
): Promise<RunFormState> {
  const { values, error } = parseRunForm(formData);
  if (!values) return { error: error! };
  await db.update(runs).set(values).where(eq(runs.id, id));
  revalidatePath("/runs");
  revalidatePath("/");
  redirect("/runs");
}

export async function deleteRun(id: number) {
  await db.delete(runs).where(eq(runs.id, id));
  revalidatePath("/runs");
  revalidatePath("/");
}
