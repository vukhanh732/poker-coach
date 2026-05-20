"use client";

import { motion, AnimatePresence } from "framer-motion";
import { rankToString, suitToSymbol } from "@/lib/poker/deck";
import type { Card } from "@/lib/poker/deck";
import { cn } from "@/lib/utils";

const suitColor: Record<string, string> = {
  h: "text-red-500",
  d: "text-red-500",
  s: "text-foreground",
  c: "text-foreground",
};

type Props = { cards: Card[] };

export function CommunityCards({ cards }: Props) {
  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3, 4].map((i) => {
        const card = cards[i];
        return (
          <div
            key={i}
            className="h-16 w-11 rounded-lg border-2 border-border bg-card flex flex-col items-center justify-center"
          >
            <AnimatePresence>
              {card ? (
                <motion.div
                  key={`${card.rank}${card.suit}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <span className={cn("text-sm font-bold", suitColor[card.suit])}>
                    {rankToString(card.rank)}
                  </span>
                  <span className={cn("text-xs", suitColor[card.suit])}>
                    {suitToSymbol(card.suit)}
                  </span>
                </motion.div>
              ) : (
                <span className="text-muted-foreground/30 text-lg">·</span>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
