// Raw SVG sparkline — no Recharts, no axes.
// Used for P&L on hand-log rows and /progress.

interface SparklineProps {
  data: number[];
  height?: number;
  className?: string;
}

export function Sparkline({ data, height = 40, className }: SparklineProps) {
  if (data.length < 2) return null;

  const width = 300; // internal SVG coordinate width; scales to 100% via viewBox
  const padV = 4;    // vertical padding

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Map data points to SVG coordinates
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = padV + ((max - v) / range) * (height - padV * 2);
    return [x, y] as [number, number];
  });

  // Build smooth SVG path with cubic bezier
  const d = points.reduce((acc, point, i) => {
    const [x, y] = point;
    if (i === 0) return `M ${x},${y}`;
    const prev = points[i - 1]!;
    const [px, py] = prev;
    const cx1 = px + (x - px) / 3;
    const cx2 = x - (x - px) / 3;
    return `${acc} C ${cx1},${py} ${cx2},${y} ${x},${y}`;
  }, "");

  const lastValue = data[data.length - 1] ?? 0;
  const stroke = lastValue >= 0 ? "#10b981" : "#ef4444";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      style={{ width: "100%", height }}
      aria-hidden
    >
      {/* Zero line */}
      {min < 0 && max > 0 && (
        <line
          x1={0}
          y1={padV + ((max - 0) / range) * (height - padV * 2)}
          x2={width}
          y2={padV + ((max - 0) / range) * (height - padV * 2)}
          stroke="#6b7280"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      )}
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
