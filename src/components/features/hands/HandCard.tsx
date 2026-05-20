"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { type HandLog } from "@/lib/db/schema";
import { formatCents, formatRelativeDate, cn } from "@/lib/utils";
import { deleteHandLog } from "@/app/actions/hand-logs";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TAG_LABELS: Record<string, string> = {
  mistake: "Mistake",
  tough_spot: "Tough Spot",
  bluff_caught: "Bluff Caught",
  hero_call: "Hero Call",
  value_bet: "Value Bet",
  bad_beat: "Bad Beat",
  cooler: "Cooler",
};

interface HandCardProps {
  hand: HandLog;
}

export function HandCard({ hand }: HandCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this hand log? This cannot be undone.")) return;
    setDeleting(true);
    const result = await deleteHandLog(hand.id);
    if ("error" in result) {
      toast.error(result.error);
      setDeleting(false);
    } else {
      toast.success("Hand deleted.");
      router.refresh();
    }
  }

  const preflopPreview = hand.streets.preflop
    ? hand.streets.preflop.slice(0, 60) +
      (hand.streets.preflop.length > 60 ? "…" : "")
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-4 pb-4 space-y-3">
          {/* Top row: hand + position + result + P&L + delete */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-semibold text-lg">{hand.hand}</span>
              <Badge variant="outline" className="text-xs">
                {hand.position}
              </Badge>
              {hand.result && (
                <Badge
                  className={cn(
                    "text-xs",
                    hand.result === "won" &&
                      "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
                    hand.result === "lost" &&
                      "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
                    hand.result === "split" &&
                      "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100"
                  )}
                  variant="outline"
                >
                  {hand.result.charAt(0).toUpperCase() + hand.result.slice(1)}
                </Badge>
              )}
              {hand.pnl != null && (
                <span
                  className={cn(
                    "text-sm font-semibold",
                    hand.pnl >= 0 ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  {formatCents(hand.pnl)}
                </span>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Delete hand"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Preflop preview */}
          {preflopPreview && (
            <p className="text-sm text-muted-foreground leading-snug">
              {preflopPreview}
            </p>
          )}

          {/* Tags */}
          {hand.tags && hand.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {hand.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                >
                  {TAG_LABELS[tag] ?? tag}
                </span>
              ))}
            </div>
          )}

          {/* Date */}
          <p className="text-xs text-muted-foreground">
            {formatRelativeDate(hand.createdAt)}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
