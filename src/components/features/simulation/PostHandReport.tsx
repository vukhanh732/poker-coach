"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SimulationAnalysis } from "@/app/actions/simulation";
import { cn } from "@/lib/utils";

const verdictColor: Record<string, string> = {
  good: "bg-green-500/10 text-green-600 border-green-500/30",
  marginal: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  mistake: "bg-red-500/10 text-red-600 border-red-500/30",
};

type Props = { analysis: SimulationAnalysis };

export function PostHandReport({ analysis }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Hand Score</CardTitle>
            <span className="text-2xl font-bold">{analysis.score}/100</span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={analysis.score} className="h-2" />
          <p className="mt-3 text-sm text-muted-foreground">{analysis.overall}</p>
        </CardContent>
      </Card>

      {analysis.streets.map((s, i) => (
        <Card key={i} className={cn("border", verdictColor[s.verdict])}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.street}</p>
                <p className="text-sm font-medium mt-0.5">{s.heroAction}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{Math.round(s.equity * 100)}% equity</p>
              </div>
              <Badge variant="outline" className={cn("shrink-0", verdictColor[s.verdict])}>
                {s.verdict}
              </Badge>
            </div>
            <p className="mt-2 text-sm">{s.tip}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
