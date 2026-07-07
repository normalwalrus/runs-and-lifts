"use client";

import { usePathname, useRouter } from "next/navigation";

export default function ExercisePicker({
  options,
  selectedId,
}: {
  options: { id: number; name: string }[];
  selectedId: number | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={selectedId ?? ""}
      onChange={(e) => router.push(`${pathname}?exercise=${e.target.value}`)}
      aria-label="Choose exercise"
      className="h-12 w-full rounded-lg border border-hairline px-3 focus:border-foreground focus:outline-none"
    >
      <option value="" disabled>
        Choose exercise…
      </option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name}
        </option>
      ))}
    </select>
  );
}
