"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = { equity: number };

export function EquityBadge({ equity }: Props) {
  const pct = Math.round(equity * 100);
  const color = pct >= 60 ? "text-green-500" : pct >= 40 ? "text-yellow-500" : "text-red-500";

  return (
    <motion.div
      key={pct}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn("text-center", color)}
    >
      <p className="text-2xl font-bold">{pct}%</p>
      <p className="text-xs text-muted-foreground">equity</p>
    </motion.div>
  );
}
