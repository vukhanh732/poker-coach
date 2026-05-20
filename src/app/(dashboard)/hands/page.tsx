import Link from "next/link";
import { Plus } from "lucide-react";

import { getHandLogs } from "@/app/actions/hand-logs";
import { HandCard } from "@/components/features/hands/HandCard";
import { PnlChart } from "@/components/features/hands/PnlChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCents } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { GameType } from "@/lib/db/schema";

const GAME_TYPE_LABELS: Record<GameType, string> = {
  cash: "Cash",
  tournament: "Tournament",
};

export default async function HandsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawGameType = typeof params.gameType === "string" ? params.gameType : undefined;
  const gameType: GameType | undefined =
    rawGameType === "cash" || rawGameType === "tournament" ? rawGameType : undefined;

  const hands = await getHandLogs({ limit: 50, gameType });

  const totalPnl = hands.reduce((sum, h) => sum + (h.pnl ?? 0), 0);
  const wins = hands.filter((h) => h.result === "won").length;
  const withResult = hands.filter((h) => h.result != null).length;
  const winRate = withResult > 0 ? Math.round((wins / withResult) * 100) : null;
  const avgPot =
    hands.filter((h) => h.potSize != null).length > 0
      ? Math.round(
          hands.reduce((sum, h) => sum + (h.potSize ?? 0), 0) /
            hands.filter((h) => h.potSize != null).length
        )
      : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Hand Log</h1>
        <Button asChild size="sm">
          <Link href="/hands/new">
            <Plus className="h-4 w-4 mr-1.5" />
            New Hand
          </Link>
        </Button>
      </div>

      {/* Game type filter chips */}
      <div className="flex gap-2">
        <Link
          href="/hands"
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors",
            !gameType
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
          )}
        >
          All
        </Link>
        {(["cash", "tournament"] as GameType[]).map((gt) => (
          <Link
            key={gt}
            href={`/hands?gameType=${gt}`}
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors",
              gameType === gt
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            {GAME_TYPE_LABELS[gt]}
          </Link>
        ))}
      </div>

      {/* P&L Chart */}
      {hands.length > 0 && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Cumulative P&amp;L
            </p>
            <PnlChart hands={hands} />
          </CardContent>
        </Card>
      )}

      {/* Summary stats */}
      {hands.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">{hands.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Hands</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p
                className={`text-2xl font-bold ${
                  totalPnl >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {formatCents(totalPnl)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Total P&amp;L</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">
                {winRate != null ? `${winRate}%` : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Win Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">
                {avgPot != null ? formatCents(avgPot) : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Avg Pot</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hand list */}
      {hands.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center space-y-3">
          <p className="text-muted-foreground">No hands logged yet.</p>
          <Button asChild size="sm">
            <Link href="/hands/new">
              <Plus className="h-4 w-4 mr-1.5" />
              Log your first hand
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {hands.map((hand) => (
            <HandCard key={hand.id} hand={hand} />
          ))}
        </div>
      )}
    </div>
  );
}
