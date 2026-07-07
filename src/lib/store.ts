"use client";

import { useSyncExternalStore } from "react";

export type Run = {
  id: number;
  date: string; // 'YYYY-MM-DD'
  distanceKm: number;
  durationSec: number;
  notes: string | null;
};

export type Exercise = { id: number; name: string };

export type SetEntry = { weightKg: number; reps: number };

export type WorkoutExercise = { exerciseId: number; sets: SetEntry[] };

export type Workout = {
  id: number;
  date: string; // 'YYYY-MM-DD'
  name: string | null;
  notes: string | null;
  exercises: WorkoutExercise[];
};

export type Store = {
  runs: Run[];
  exercises: Exercise[];
  workouts: Workout[];
  nextId: number;
};

const STORAGE_KEY = "runs-and-lifts:v1";

const DEFAULT_EXERCISES = [
  "Squat",
  "Bench Press",
  "Deadlift",
  "Overhead Press",
  "Barbell Row",
  "Pull-up",
  "Dumbbell Curl",
  "Romanian Deadlift",
  "Incline Bench Press",
  "Lat Pulldown",
  "Leg Press",
  "Dips",
];

const EMPTY: Store = { runs: [], exercises: [], workouts: [], nextId: 1 };

function seeded(): Store {
  return {
    runs: [],
    exercises: DEFAULT_EXERCISES.map((name, i) => ({ id: i + 1, name })),
    workouts: [],
    nextId: DEFAULT_EXERCISES.length + 1,
  };
}

let cache: Store | null = null;
const listeners = new Set<() => void>();

function load(): Store {
  if (cache) return cache;
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as Store) : seeded();
  } catch {
    cache = seeded();
  }
  if (!cache.runs || !cache.exercises || !cache.workouts) cache = seeded();
  return cache;
}

function commit(next: Store) {
  cache = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

export function useStore(): Store {
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    load,
    () => EMPTY
  );
}

function takeId(s: Store): [number, Store] {
  return [s.nextId, { ...s, nextId: s.nextId + 1 }];
}

// ---- runs ----

export function addRun(run: Omit<Run, "id">) {
  const [id, s] = takeId(load());
  commit({ ...s, runs: [...s.runs, { ...run, id }] });
}

export function updateRun(id: number, run: Omit<Run, "id">) {
  const s = load();
  commit({ ...s, runs: s.runs.map((r) => (r.id === id ? { ...run, id } : r)) });
}

export function deleteRun(id: number) {
  const s = load();
  commit({ ...s, runs: s.runs.filter((r) => r.id !== id) });
}

// ---- exercises ----

export function addExercise(name: string): { error: string } | null {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Name is required." };
  const s = load();
  if (s.exercises.some((e) => e.name.toLowerCase() === trimmed.toLowerCase()))
    return { error: `"${trimmed}" already exists.` };
  const [id, next] = takeId(s);
  commit({ ...next, exercises: [...next.exercises, { id, name: trimmed }] });
  return null;
}

export function renameExercise(id: number, name: string): { error: string } | null {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Name is required." };
  const s = load();
  if (
    s.exercises.some(
      (e) => e.id !== id && e.name.toLowerCase() === trimmed.toLowerCase()
    )
  )
    return { error: `"${trimmed}" already exists.` };
  commit({
    ...s,
    exercises: s.exercises.map((e) => (e.id === id ? { ...e, name: trimmed } : e)),
  });
  return null;
}

export function exerciseUsageCount(s: Store, id: number): number {
  return s.workouts.filter((w) => w.exercises.some((ex) => ex.exerciseId === id)).length;
}

export function deleteExercise(id: number): { error: string } | null {
  const s = load();
  const usage = exerciseUsageCount(s, id);
  if (usage > 0) {
    return {
      error: `This exercise is used in ${usage} workout${usage === 1 ? "" : "s"} and can't be deleted.`,
    };
  }
  commit({ ...s, exercises: s.exercises.filter((e) => e.id !== id) });
  return null;
}

// ---- workouts ----

export type WorkoutPayload = {
  date: string;
  name: string;
  notes: string;
  exercises: WorkoutExercise[];
};

function validateWorkout(payload: WorkoutPayload): string | null {
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

export function saveWorkout(
  id: number | null,
  payload: WorkoutPayload
): { error: string } | null {
  const error = validateWorkout(payload);
  if (error) return { error };
  const workout = {
    date: payload.date,
    name: payload.name.trim() || null,
    notes: payload.notes.trim() || null,
    exercises: payload.exercises,
  };
  const s = load();
  if (id === null) {
    const [newId, next] = takeId(s);
    commit({ ...next, workouts: [...next.workouts, { ...workout, id: newId }] });
  } else {
    if (!s.workouts.some((w) => w.id === id))
      return { error: "This workout no longer exists — it may have been deleted." };
    commit({
      ...s,
      workouts: s.workouts.map((w) => (w.id === id ? { ...workout, id } : w)),
    });
  }
  return null;
}

export function deleteWorkout(id: number) {
  const s = load();
  commit({ ...s, workouts: s.workouts.filter((w) => w.id !== id) });
}

// ---- backup ----

export function exportJSON(): string {
  return JSON.stringify(load(), null, 2);
}

export function importJSON(raw: string): { error: string } | null {
  try {
    const parsed = JSON.parse(raw) as Store;
    if (
      !Array.isArray(parsed.runs) ||
      !Array.isArray(parsed.exercises) ||
      !Array.isArray(parsed.workouts) ||
      typeof parsed.nextId !== "number"
    ) {
      return { error: "That file doesn't look like a Runs & Lifts backup." };
    }
    commit(parsed);
    return null;
  } catch {
    return { error: "Couldn't read that file as JSON." };
  }
}
