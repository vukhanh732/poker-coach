import { cn } from "@/lib/utils";
import { SUIT_FILL, SIZE_STYLES, SUIT_PATHS } from "./playing-card-data";

export type Suit = "s" | "c" | "h" | "d";
export type CardSize = "sm" | "lg";

interface PlayingCardProps {
  rank: string;
  suit: Suit;
  size?: CardSize;
  className?: string;
}

export function PlayingCard({ rank, suit, size = "sm", className }: PlayingCardProps) {
  const fill = SUIT_FILL[suit];
  const { width, rankSize, suitSize, padding } = SIZE_STYLES[size];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded",
        "font-mono leading-none select-none",
        width,
        padding,
        className
      )}
      style={{
        aspectRatio: "2/3",
        background: "var(--color-surface-elevated)",
        border: "0.5px solid var(--color-border-strong)",
        color: fill,
      }}
    >
      <span className={cn("font-mono font-medium", rankSize)} style={{ color: fill }}>
        {rank}
      </span>
      <span className={suitSize}>
        <svg viewBox="0 0 24 24" fill={fill} aria-hidden style={{ width: "100%", height: "100%" }}>
          <path d={SUIT_PATHS[suit]} />
        </svg>
      </span>
    </div>
  );
}
