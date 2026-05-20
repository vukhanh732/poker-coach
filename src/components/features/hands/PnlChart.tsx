"use client";

import { type HandLog } from "@/lib/db/schema";
import { Sparkline } from "@/components/charts/Sparkline";

interface PnlChartProps {
  hands: HandLog[];
}

export function PnlChart({ hands }: PnlChartProps) {
  if (hands.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
        No hands yet — log your first hand to see your P&amp;L chart.
      </div>
    );
  }

  const sorted = [...hands].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  let running = 0;
  const data = sorted.map((h) => {
    running += h.pnl ?? 0;
    return running / 100; // cents → dollars
  });

  const totalPnl = data[data.length - 1] ?? 0;

  return (
    <div className="space-y-1">
      <Sparkline data={data} height={60} />
      <p className="text-right text-xs font-mono text-muted-foreground">
        {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
      </p>
    </div>
  );
}
