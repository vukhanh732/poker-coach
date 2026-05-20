"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EquityBarProps {
  equity: number;       // your equity %
  required: number;     // pot-odds threshold %
  label?: string;
}

export function EquityBar({ equity, required, label }: EquityBarProps) {
  const capped = Math.min(equity, 100);
  const reqCapped = Math.min(required, 100);
  const profitable = equity >= required;

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-medium text-muted-foreground">{label}</p>}

      <div className="relative h-8 w-full overflow-hidden rounded-lg bg-muted">
        {/* Equity fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${capped}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn(
            "absolute inset-y-0 left-0 rounded-lg",
            profitable ? "bg-green-600" : "bg-red-700"
          )}
        />

        {/* Threshold line */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white/80"
          style={{ left: `${reqCapped}%` }}
        />

        {/* Labels */}
        <div className="absolute inset-0 flex items-center justify-between px-2.5">
          <span className="text-xs font-bold text-white drop-shadow">
            Equity {equity.toFixed(0)}%
          </span>
          <span className="text-xs font-medium text-white/70 drop-shadow">
            Need {required.toFixed(0)}%
          </span>
        </div>
      </div>

      <p className={cn(
        "text-center text-sm font-semibold",
        profitable ? "text-green-400" : "text-red-400"
      )}>
        {profitable
          ? `+${(equity - required).toFixed(1)}% edge — profitable call`
          : `${(required - equity).toFixed(1)}% short — fold (no implied odds)`}
      </p>
    </div>
  );
}
