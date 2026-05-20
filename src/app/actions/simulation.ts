"use server";

// RLS-enforced via SSR client
import { createClient } from "@/lib/supabase/server";
import { simulationLimiter, checkRateLimit } from "@/lib/ratelimit";
import Groq from "groq-sdk";

export type StreetDecision = {
  street: "preflop" | "flop" | "turn" | "river";
  heroAction: string;
  equity: number;
  board: string;
  pot: number; // cents
};

export type StreetAnalysis = {
  street: string;
  heroAction: string;
  equity: number;
  verdict: "good" | "marginal" | "mistake";
  tip: string;
};

export type SimulationAnalysis = {
  overall: string;
  streets: StreetAnalysis[];
  score: number; // 0-100
};

export async function analyzeSimulation(
  decisions: StreetDecision[],
  heroCards: string,
  villainCards: string,
  villainType: string
): Promise<{ success: true; analysis: SimulationAnalysis } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to analyze hands." };

  const { limited, resetAt } = await checkRateLimit(simulationLimiter, user.id);
  if (limited) {
    const resetMsg = resetAt ? ` Try again after ${resetAt.toLocaleTimeString()}.` : "";
    return { error: `Analysis limit reached (30/hour).${resetMsg}` };
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `You are an expert poker coach analyzing a hand played at $1/$2 live cash.

Hero's hole cards: ${heroCards}
Villain type: ${villainType}
Villain's hole cards (revealed at showdown): ${villainCards}

Decisions made:
${decisions.map((d, i) => `${i + 1}. ${d.street.toUpperCase()}: Hero ${d.heroAction}. Board: ${d.board || "preflop"}. Hero equity: ${Math.round(d.equity * 100)}%. Pot: $${(d.pot / 100).toFixed(0)}`).join("\n")}

Analyze each decision. For each street, give:
- verdict: "good", "marginal", or "mistake"
- tip: one concrete sentence of coaching advice

Also give an overall summary (2 sentences) and a score from 0-100.

Respond in JSON only:
{
  "overall": "...",
  "score": 75,
  "streets": [
    { "street": "preflop", "heroAction": "...", "equity": 0.65, "verdict": "good", "tip": "..." }
  ]
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return { error: "No response from AI" };

    const parsed = JSON.parse(content) as SimulationAnalysis;
    return { success: true, analysis: parsed };
  } catch (e) {
    return { error: `Analysis failed: ${e instanceof Error ? e.message : String(e)}` };
  }
}
