"use client";

import { cn } from "@/lib/utils";
import type { RangeAction } from "@/data/ranges";
import type { GTOFrequencies } from "./GTOFrequencyBar";
import { GTOFrequencyBar } from "./GTOFrequencyBar";

interface HandCellProps {
  hand: string;
  action: RangeAction;
  gtoFreq?: GTOFrequencies;
  selected: boolean;
  dimmed: boolean;
  onClick: () => void;
}

const ACTION_BG: Record<RangeAction, string> = {
  raise: "var(--color-felt-spec-700)",   // #2d8659
  call:  "var(--color-gold-spec-500)",   // #d4a627
  fold:  "var(--color-action-fold)",     // #3a1f1f
  mixed: "",                             // handled inline
};

export function HandCell({ hand, action, gtoFreq, selected, dimmed, onClick }: HandCellProps) {
  const isMixed = action === "mixed";

  return (
    <button
      onClick={onClick}
      title={hand}
      className={cn(
        "range-cell relative aspect-square rounded-[2px] overflow-hidden",
        "flex flex-col items-center justify-start",
        "font-mono text-white transition-all",
        dimmed && "opacity-20",
        selected && "z-10 scale-110"
      )}
      style={{
        background: isMixed
          ? `linear-gradient(135deg, var(--color-action-mixed-a) 50%, var(--color-action-mixed-b) 50%)`
          : ACTION_BG[action],
        // 2.5px gold-400 ring when selected
        outline: selected ? "2.5px solid var(--color-gold-spec-400)" : undefined,
        outlineOffset: selected ? "1px" : undefined,
      }}
    >
      {/* Hand label */}
      <span
        className="leading-none px-px pt-[1px] w-full text-center truncate"
        style={{ fontSize: "clamp(5px, 1.5vw, 10px)" }}
      >
        {hand}
      </span>

      {/* GTO frequency strip — 4px tall, pinned to bottom */}
      {gtoFreq && (
        <div className="absolute bottom-0 left-0 right-0">
          <GTOFrequencyBar
            raise={gtoFreq.raise}
            call={gtoFreq.call}
            fold={gtoFreq.fold}
            height={4}
          />
        </div>
      )}
    </button>
  );
}
