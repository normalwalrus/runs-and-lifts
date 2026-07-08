const ACCENTS = {
  run: "var(--run)",
  lift: "var(--lift)",
  gold: "var(--gold)",
} as const;

export default function StatCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: string;
  detail?: string;
  accent?: keyof typeof ACCENTS;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-card p-4">
      <div className="eyebrow flex items-center gap-1.5">
        {accent && (
          <span
            className="plate plate-lg"
            style={{ background: ACCENTS[accent] }}
            aria-hidden
          />
        )}
        {label}
      </div>
      <div className="num mt-1.5 text-2xl font-bold md:text-3xl">{value}</div>
      {detail && <div className="num mt-0.5 text-xs text-ink-muted">{detail}</div>}
    </div>
  );
}
