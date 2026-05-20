"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HandInput } from "@/components/features/analyzer/HandInput";
import { AnalysisResult } from "@/components/features/analyzer/AnalysisResult";
import { getAnalyzedHands } from "@/app/actions/analyzer";
import type { AnalysisJson } from "@/lib/claude";
import type { InferSelectModel } from "drizzle-orm";
import type { analyzedHands } from "@/lib/db/schema";
import { formatRelativeDate } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, ClipboardList } from "lucide-react";

type AnalyzedHand = InferSelectModel<typeof analyzedHands>;

interface CurrentAnalysis {
  id: string;
  analysis: AnalysisJson;
}

function VerdictIcon({ verdict }: { verdict: string }) {
  if (verdict === "good") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (verdict === "questionable") return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  return <XCircle className="h-4 w-4 text-red-600" />;
}

function VerdictBadge({ verdict }: { verdict: string }) {
  if (verdict === "good") {
    return (
      <Badge className="bg-green-500/15 text-green-700 border border-green-500/30 text-xs">
        Good
      </Badge>
    );
  }
  if (verdict === "questionable") {
    return (
      <Badge className="bg-yellow-500/15 text-yellow-700 border border-yellow-500/30 text-xs">
        Questionable
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-500/15 text-red-700 border border-red-500/30 text-xs">
      Mistake
    </Badge>
  );
}

function HistoryTab() {
  const [hands, setHands] = useState<AnalyzedHand[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getAnalyzedHands().then((data) => {
      setHands(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (hands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ClipboardList className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-medium">No hands analyzed yet</p>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Analyze your first hand to see it here.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-2">
      <div className="space-y-3">
        {hands.map((hand) => {
          const analysis = hand.analysisJson as AnalysisJson;
          const isExpanded = expanded === hand.id;
          return (
            <Card
              key={hand.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => setExpanded(isExpanded ? null : hand.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <VerdictIcon verdict={analysis.verdict} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate leading-tight">
                        {analysis.summary.slice(0, 100)}
                        {analysis.summary.length > 100 ? "…" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatRelativeDate(hand.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <VerdictBadge verdict={analysis.verdict} />
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t">
                    <AnalysisResult analysis={analysis} rawHand={hand.rawHand} />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}

export default function AnalyzerPage() {
  const [current, setCurrent] = useState<CurrentAnalysis | null>(null);

  function handleAnalysis(id: string, analysis: AnalysisJson) {
    setCurrent({ id, analysis });
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hand Analyzer</h1>
        <p className="text-muted-foreground mt-1">
          AI-powered GTO + exploitative coaching
        </p>
      </div>

      <Tabs defaultValue="analyze" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analyze">Analyze</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="analyze" className="space-y-6">
          <HandInput onAnalysis={handleAnalysis} />
          {current && (
            <div className="pt-2">
              <AnalysisResult analysis={current.analysis} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <HistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
