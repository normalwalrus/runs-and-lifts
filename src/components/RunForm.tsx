"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPace, formatSpeed, todayISO } from "@/lib/format";
import { addRun, updateRun, type Run } from "@/lib/store";

const inputCls =
  "h-12 w-full rounded-lg border border-hairline px-3 focus:border-foreground focus:outline-none";

export default function RunForm({
  runId,
  initial,
  submitLabel,
}: {
  runId: number | null;
  initial?: Omit<Run, "id">;
  submitLabel: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [distance, setDistance] = useState(initial ? String(initial.distanceKm) : "");
  const [hours, setHours] = useState(
    initial ? String(Math.floor(initial.durationSec / 3600)) : "0"
  );
  const [minutes, setMinutes] = useState(
    initial ? String(Math.floor((initial.durationSec % 3600) / 60)) : ""
  );
  const [seconds, setSeconds] = useState(initial ? String(initial.durationSec % 60) : "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const preview = useMemo(() => {
    const km = Number(distance);
    const sec = Number(hours || 0) * 3600 + Number(minutes || 0) * 60 + Number(seconds || 0);
    if (!km || km <= 0 || !sec || sec <= 0) return null;
    return { pace: formatPace(sec, km), speed: formatSpeed(sec, km) };
  }, [distance, hours, minutes, seconds]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const distanceKm = Number(distance);
    const durationSec = Math.round(
      Number(hours || 0) * 3600 + Number(minutes || 0) * 60 + Number(seconds || 0)
    );
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setError("Please pick a valid date.");
    if (!Number.isFinite(distanceKm) || distanceKm <= 0)
      return setError("Distance must be greater than 0.");
    if (!Number.isFinite(durationSec) || durationSec <= 0)
      return setError("Duration must be greater than 0.");

    const values = { date, distanceKm, durationSec, notes: notes.trim() || null };
    if (runId === null) addRun(values);
    else updateRun(runId, values);
    router.push("/runs");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Date</label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Distance (km)</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          required
          placeholder="5.0"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Duration</label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="h"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className={inputCls}
            aria-label="Hours"
          />
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="59"
            placeholder="min"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className={inputCls}
            aria-label="Minutes"
          />
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="59"
            placeholder="sec"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            className={inputCls}
            aria-label="Seconds"
          />
        </div>
      </div>

      <div
        className={`rounded-lg border border-dashed p-3 text-sm ${
          preview ? "border-run/40 text-run" : "border-hairline text-ink-muted"
        }`}
      >
        {preview ? (
          <span>
            Pace <strong className="num">{preview.pace}</strong> · Speed{" "}
            <strong className="num">{preview.speed}</strong>
          </span>
        ) : (
          "Pace and speed will be calculated automatically"
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Notes (optional)</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-hairline p-3 focus:border-foreground focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-lift">{error}</p>}

      <button
        type="submit"
        className="h-12 w-full rounded-lg bg-run font-semibold text-background hover:opacity-90"
      >
        {submitLabel}
      </button>
    </form>
  );
}
