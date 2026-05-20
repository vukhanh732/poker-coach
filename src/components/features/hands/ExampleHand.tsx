"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

const STORAGE_KEY = "poker_coach_example_dismissed";

export function ExampleHandState() {
  const [dismissed, setDismissed] = useState(true); // start true to avoid flash

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
    setDismissed(true);
  }

  if (dismissed) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center space-y-3">
        <p className="text-muted-foreground">No hands logged yet.</p>
        <Button asChild size="sm">
          <Link href="/hands/new">
            <Plus className="h-4 w-4 mr-1.5" />
            Log your first hand
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground text-center">
        ← example, log a real hand to get started
      </p>

      {/* Example hand card */}
      <Card className="opacity-60 relative">
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-semibold text-lg">AKs</span>
              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">BTN</span>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs">Won</span>
              <span className="text-sm font-semibold text-emerald-600">+$42</span>
            </div>
            <button
              onClick={dismiss}
              className="text-xs text-muted-foreground hover:text-foreground underline shrink-0"
            >
              dismiss
            </button>
          </div>
          <p className="text-sm text-muted-foreground leading-snug">
            BTN raises to $8, BB calls. Flop A♠K♦7♥ — check, bet $12, call…
          </p>
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              Value Bet
            </span>
          </div>
        </CardContent>
      </Card>

      <Button asChild size="sm" className="w-full">
        <Link href="/hands/new">
          <Plus className="h-4 w-4 mr-1.5" />
          Log your first real hand
        </Link>
      </Button>
    </div>
  );
}
