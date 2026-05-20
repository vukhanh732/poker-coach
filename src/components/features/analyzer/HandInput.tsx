"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { analyzeHandAction } from "@/app/actions/analyzer";
import type { AnalysisJson } from "@/lib/claude";
import { AlertCircle, Sparkles } from "lucide-react";

interface HandInputProps {
  onAnalysis: (id: string, analysis: AnalysisJson) => void;
}

export function HandInput({ onAnalysis }: HandInputProps) {
  const [rawHand, setRawHand] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    try {
      const result = await analyzeHandAction(rawHand);
      if ("error" in result) {
        setError(result.error);
      } else {
        onAnalysis(result.id, result.analysis);
        setRawHand("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-lg" />
        <div className="space-y-2 mt-6">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">
          Analyzing your hand with AI coaching...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={rawHand}
        onChange={(e) => setRawHand(e.target.value)}
        placeholder="Paste your hand history here... Include position, stack sizes, all streets and actions"
        className="min-h-48 resize-y font-mono text-sm"
        disabled={loading}
      />

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={loading || rawHand.trim().length === 0}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Analyze Hand
        </Button>
        {rawHand.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {rawHand.length}/5000 characters
          </span>
        )}
      </div>
    </div>
  );
}
