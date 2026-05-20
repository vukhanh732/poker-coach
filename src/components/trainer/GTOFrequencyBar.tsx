import { cn } from "@/lib/utils";

export interface GTOFrequencies {
  raise: number; // 0–1
  call: number;
  fold: number;
}

interface GTOFrequencyBarProps {
  raise: number;
  call: number;
  fold: number;
  height?: number;
  className?: string;
}

// Labels appear if the segment is ≥15% of the bar.
const MIN_LABEL_FRACTION = 0.15;

export function GTOFrequencyBar({
  raise,
  call,
  fold,
  height = 24,
  className,
}: GTOFrequencyBarProps) {
  const total = raise + call + fold;
  if (total === 0) return null;

  const rPct = raise / total;
  const cPct = call / total;
  const fPct = fold / total;

  const segments = [
    { key: "raise", pct: rPct, label: `${Math.round(rPct * 100)}%`, color: "var(--color-felt-spec-700)" },
    { key: "call",  pct: cPct, label: `${Math.round(cPct * 100)}%`, color: "var(--color-gold-spec-500)" },
    { key: "fold",  pct: fPct, label: `${Math.round(fPct * 100)}%`, color: "var(--color-action-fold)" },
  ];

  return (
    <div
      className={cn("flex w-full overflow-hidden rounded-sm", className)}
      style={{ height }}
      role="img"
      aria-label={`GTO: raise ${Math.round(rPct * 100)}%, call ${Math.round(cPct * 100)}%, fold ${Math.round(fPct * 100)}%`}
    >
      {segments.map(({ key, pct, label, color }) =>
        pct > 0 ? (
          <div
            key={key}
            className="flex items-center justify-center overflow-hidden text-xs font-medium"
            style={{
              width: `${pct * 100}%`,
              background: color,
              color: "var(--color-ink-50)",
              fontSize: 10,
            }}
          >
            {pct >= MIN_LABEL_FRACTION && label}
          </div>
        ) : null
      )}
    </div>
  );
}
