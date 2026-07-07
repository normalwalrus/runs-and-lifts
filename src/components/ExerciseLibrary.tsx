"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  createExercise,
  renameExercise,
  deleteExercise,
  type ExerciseActionState,
} from "@/app/(app)/exercises/actions";

export type ExerciseWithUsage = { id: number; name: string; usageCount: number };

const inputCls =
  "h-12 w-full rounded-lg border border-hairline px-3 focus:border-foreground focus:outline-none";

function ExerciseRow({ exercise }: { exercise: ExerciseWithUsage }) {
  const [editing, setEditing] = useState(false);
  const [renameState, renameAction, renaming] = useActionState(
    async (prev: ExerciseActionState, formData: FormData) => {
      const result = await renameExercise(exercise.id, prev, formData);
      if (!result) setEditing(false);
      return result;
    },
    null
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    () => deleteExercise(exercise.id),
    null
  );

  return (
    <li className="rounded-xl border border-hairline bg-card p-3">
      {editing ? (
        <form action={renameAction} className="flex items-center gap-2">
          <input
            name="name"
            defaultValue={exercise.name}
            required
            autoFocus
            className={inputCls}
          />
          <button
            type="submit"
            disabled={renaming}
            className="rounded-lg bg-foreground text-background px-3 py-2 text-sm font-semibold  disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg px-3 py-2 text-sm text-ink-muted"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div>
            <Link
              href={`/exercises/${exercise.id}`}
              className="font-medium hover:underline"
            >
              {exercise.name}
            </Link>
            <div className="text-xs text-ink-muted">
              {exercise.usageCount === 0
                ? "Not used yet"
                : `Used in ${exercise.usageCount} workout${exercise.usageCount === 1 ? "" : "s"}`}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-hairline"
            >
              Rename
            </button>
            <form
              action={deleteAction}
              onSubmit={(e) => {
                if (!window.confirm(`Delete "${exercise.name}"?`)) e.preventDefault();
              }}
            >
              <button
                type="submit"
                disabled={deleting}
                className="rounded-lg px-3 py-2 text-sm font-medium text-lift hover:bg-lift/10 disabled:opacity-50"
              >
                Delete
              </button>
            </form>
          </div>
        </div>
      )}
      {(renameState?.error || deleteState?.error) && (
        <p className="mt-2 text-sm text-lift">
          {renameState?.error ?? deleteState?.error}
        </p>
      )}
    </li>
  );
}

export default function ExerciseLibrary({ items }: { items: ExerciseWithUsage[] }) {
  const [addState, addAction, adding] = useActionState(createExercise, null);

  return (
    <div className="space-y-4">
      <form action={addAction} className="flex gap-2">
        <input
          name="name"
          required
          placeholder="New exercise name"
          className={inputCls}
        />
        <button
          type="submit"
          disabled={adding}
          className="shrink-0 rounded-lg bg-foreground text-background px-4 py-2 font-semibold  hover:opacity-90 disabled:opacity-50"
        >
          Add
        </button>
      </form>
      {addState?.error && <p className="text-sm text-lift">{addState.error}</p>}

      <ul className="space-y-2">
        {items.map((e) => (
          <ExerciseRow key={e.id} exercise={e} />
        ))}
      </ul>
    </div>
  );
}
