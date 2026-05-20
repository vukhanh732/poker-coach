"use client";

import { useEffect, useRef, useState } from "react";

interface DecisionClockProps {
  /** Countdown duration in seconds. Default 15. */
  seconds?: number;
  /** Called when the countdown reaches zero. */
  onExpire: () => void;
  /** Reset key — changing this value restarts the clock. */
  resetKey?: string | number;
  /** Disable the clock entirely. */
  disabled?: boolean;
}

const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = 56; // SVG viewport size

export function DecisionClock({
  seconds = 15,
  onExpire,
  resetKey,
  disabled = false,
}: DecisionClockProps) {
  const [remaining, setRemaining] = useState(seconds);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setRemaining(seconds);
    expiredRef.current = false;
  }, [resetKey, seconds]);

  useEffect(() => {
    if (disabled) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!expiredRef.current) {
            expiredRef.current = true;
            // Defer to avoid setState-during-render
            setTimeout(() => onExpireRef.current(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [disabled, resetKey]);

  if (disabled) return null;

  const progress = remaining / seconds; // 1→0
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  // Color: normal → gold-400 at ≤5s → danger at ≤2s
  const ringColor =
    remaining <= 2
      ? "var(--color-danger)"
      : remaining <= 5
      ? "var(--color-gold-spec-400)"
      : "var(--color-felt-spec-600)";

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden
      >
        {/* Track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--color-border-subtle)"
          strokeWidth={3}
        />
        {/* Progress ring */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={ringColor}
          strokeWidth={3}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.2s ease" }}
        />
      </svg>
      {/* Countdown number */}
      <span
        className="absolute font-mono text-sm font-medium"
        style={{ color: ringColor }}
      >
        {remaining}
      </span>
    </div>
  );
}
