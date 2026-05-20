"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { type HandLog } from "@/lib/db/schema";
import { formatRelativeDate } from "@/lib/utils";

interface PnlChartProps {
  hands: HandLog[];
}

interface ChartPoint {
  index: number;
  date: string;
  cumulativePnl: number;
}

export function PnlChart({ hands }: PnlChartProps) {
  if (hands.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
        No hands yet — log your first hand to see your P&amp;L chart.
      </div>
    );
  }

  // Sort by createdAt ascending for running total
  const sorted = [...hands].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  let running = 0;
  const data: ChartPoint[] = sorted.map((h, i) => {
    running += h.pnl ?? 0;
    return {
      index: i + 1,
      date: formatRelativeDate(h.createdAt),
      cumulativePnl: parseFloat((running / 100).toFixed(2)),
    };
  });

  const lastValue = data[data.length - 1]?.cumulativePnl ?? 0;
  const lineColor = lastValue >= 0 ? "#10b981" : "#ef4444";

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="index"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          label={{ value: "Hand #", position: "insideBottomRight", offset: -4, fontSize: 11 }}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `$${v}`}
          width={52}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(2)}`, "Cumulative P&L"]}
          labelFormatter={(label: number) => {
            const point = data[label - 1];
            return point ? `Hand #${label} · ${point.date}` : `Hand #${label}`;
          }}
        />
        <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="cumulativePnl"
          stroke={lineColor}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
