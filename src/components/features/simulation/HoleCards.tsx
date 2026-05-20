"use client";

import { motion } from "framer-motion";
import { rankToString, suitToSymbol } from "@/lib/poker/deck";
import type { Card } from "@/lib/poker/deck";
import { cn } from "@/lib/utils";

type Props = {
  cards: Card[];
  faceDown?: boolean;
  label?: string;
  small?: boolean;
};

const suitColor: Record<string, string> = {
  h: "text-red-500",
  d: "text-red-500",
  s: "text-foreground",
  c: "text-foreground",
};

export function HoleCards({ cards, faceDown = false, label, small = false }: Props) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {label && <p className="text-xs text-muted-foreground font-medium">{label}</p>}
      <div className="flex gap-1.5">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ rotateY: 180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border-2 border-border bg-card font-bold select-none",
              small ? "h-10 w-7 text-xs" : "h-14 w-10 text-sm",
              faceDown && "bg-primary/20 border-primary/40"
            )}
          >
            {faceDown ? (
              <span className="text-primary/60">?</span>
            ) : (
              <>
                <span className={cn(suitColor[card.suit])}>{rankToString(card.rank)}</span>
                <span className={cn("text-xs", suitColor[card.suit])}>{suitToSymbol(card.suit)}</span>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
