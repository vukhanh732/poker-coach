"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OddsCalculator } from "@/components/features/calculator/OddsCalculator";
import { ScenarioQuiz } from "@/components/features/calculator/ScenarioQuiz";

export default function CalculatorPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Pot Odds</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Live calculator + scenario quiz
        </p>
      </div>

      <Tabs defaultValue="calculator">
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="calculator" className="flex-1">Calculator</TabsTrigger>
          <TabsTrigger value="quiz" className="flex-1">Scenario Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <OddsCalculator />
        </TabsContent>

        <TabsContent value="quiz">
          <ScenarioQuiz />
        </TabsContent>
      </Tabs>
    </div>
  );
}
