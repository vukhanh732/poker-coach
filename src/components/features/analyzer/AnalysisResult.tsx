"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { AnalysisJson } from "@/lib/claude";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  GitBranch,
  Target,
  Crosshair,
  Brain,
} from "lucide-react";

interface AnalysisResultProps {
  analysis: AnalysisJson;
  rawHand?: string;
}

const STREET_COLORS: Record<string, string> = {
  preflop: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  flop: "bg-green-500/10 text-green-600 border-green-500/20",
  turn: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  river: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

function VerdictBadge({ verdict }: { verdict: AnalysisJson["verdict"] }) {
  if (verdict === "good") {
    return (
      <Badge className="gap-1.5 bg-green-500/15 text-green-700 hover:bg-green-500/20 border border-green-500/30">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Good Play
      </Badge>
    );
  }
  if (verdict === "questionable") {
    return (
      <Badge className="gap-1.5 bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/20 border border-yellow-500/30">
        <AlertTriangle className="h-3.5 w-3.5" />
        Questionable
      </Badge>
    );
  }
  return (
    <Badge className="gap-1.5 bg-red-500/15 text-red-700 hover:bg-red-500/20 border border-red-500/30">
      <XCircle className="h-3.5 w-3.5" />
      Mistake
    </Badge>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  return (
    <motion.div
      className="space-y-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Analysis</h3>
        <VerdictBadge verdict={analysis.verdict} />
      </motion.div>

      {/* Summary */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm leading-relaxed text-muted-foreground">{analysis.summary}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Streets */}
      {analysis.streets.length > 0 && (
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Street-by-Street
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.streets.map((s, i) => (
                <div key={i}>
                  {i > 0 && <Separator className="my-4" />}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold capitalize ${
                          STREET_COLORS[s.street.toLowerCase()] ??
                          "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {s.street}
                      </span>
                      <span className="text-sm font-medium">{s.action}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.analysis}</p>
                    {s.alternativeLines.length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                          <GitBranch className="h-3 w-3" />
                          Alternative Lines
                        </div>
                        <ul className="space-y-1">
                          {s.alternativeLines.map((line, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-2 text-xs text-muted-foreground"
                            >
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                              {line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Key Decision Points */}
      {analysis.keyDecisionPoints.length > 0 && (
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                <Target className="h-4 w-4" />
                Key Decision Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {analysis.keyDecisionPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Exploitative Adjustments */}
      {analysis.exploitativeAdjustments.length > 0 && (
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                <Crosshair className="h-4 w-4" />
                Exploitative Adjustments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.exploitativeAdjustments.map((adj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="leading-relaxed">{adj}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Solver Perspective */}
      {analysis.solverPerspective && (
        <motion.div variants={item}>
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                <Brain className="h-4 w-4" />
                Solver Perspective
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {analysis.solverPerspective}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
