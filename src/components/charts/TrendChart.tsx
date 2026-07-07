"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TrendPoint = { date: string; value: number };

type Metric = "pace" | "distance" | "weight";

/* color follows the entity: runs are blue, lifting is red */
const METRIC_COLOR: Record<Metric, string> = {
  pace: "var(--run)",
  distance: "var(--run)",
  weight: "var(--lift)",
};

function formatValue(metric: Metric, value: number): string {
  switch (metric) {
    case "pace": {
      const m = Math.floor(value / 60);
      const s = Math.round(value % 60);
      return `${m}:${String(s === 60 ? 0 : s).padStart(2, "0")} /km`;
    }
    case "distance":
      return `${Number(value.toFixed(2))} km`;
    case "weight":
      return `${Number(value.toFixed(2))} kg`;
  }
}

/** 'YYYY-MM-DD' → "7 Jul" */
function shortDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default function TrendChart({
  data,
  metric,
}: {
  data: TrendPoint[];
  metric: Metric;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-hairline text-sm text-ink-muted">
        No data yet — the gun hasn&apos;t gone off
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={shortDate}
            tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
            axisLine={{ stroke: "var(--chart-axis)" }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            width={52}
            domain={["auto", "auto"]}
            tickFormatter={(v: number) =>
              metric === "pace"
                ? `${Math.floor(v / 60)}:${String(Math.round(v % 60)).padStart(2, "0")}`
                : String(Number(v.toFixed(1)))
            }
            tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ stroke: "var(--chart-axis)" }}
            labelFormatter={(label) => shortDate(String(label))}
            formatter={(value) => [formatValue(metric, Number(value)), null]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--chart-grid)",
              background: "var(--background)",
              color: "var(--foreground)",
              fontSize: 13,
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={METRIC_COLOR[metric]}
            strokeWidth={2}
            dot={
              data.length <= 30
                ? { r: 3, fill: METRIC_COLOR[metric], strokeWidth: 0 }
                : false
            }
            activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--background)" }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
