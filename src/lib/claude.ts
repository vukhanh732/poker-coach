import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export type AnalysisJson = {
  summary: string;
  streets: Array<{
    street: string;
    action: string;
    analysis: string;
    alternativeLines: string[];
  }>;
  keyDecisionPoints: string[];
  exploitativeAdjustments: string[];
  solverPerspective: string;
  verdict: "good" | "questionable" | "mistake";
};

const SYSTEM_PROMPT =
  "You are a live cash poker coach specializing in $1/$2 and $2/$3 No-Limit Hold'em. Analyze hands with GTO fundamentals adapted for exploitative live play. Be specific about stack sizes, bet sizing, board texture, and villain tendencies. Focus on practical improvements for live poker. Always respond with ONLY a JSON object — no markdown, no explanation outside the JSON.";

const JSON_SCHEMA = `{
  "summary": "brief overall summary",
  "streets": [
    {
      "street": "preflop|flop|turn|river",
      "action": "what happened on this street",
      "analysis": "analysis of the action",
      "alternativeLines": ["alternative line 1", "alternative line 2"]
    }
  ],
  "keyDecisionPoints": ["decision point 1"],
  "exploitativeAdjustments": ["adjustment 1"],
  "solverPerspective": "what a GTO solver would say",
  "verdict": "good|questionable|mistake"
}`;

export async function analyzeHand(rawHand: string): Promise<AnalysisJson> {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 2000,
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Analyze this poker hand. Respond with ONLY a JSON object matching this exact structure:\n\n${JSON_SCHEMA}\n\nHand to analyze:\n${rawHand}`,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";
  const text = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error(`Failed to parse response as JSON: ${text.slice(0, 200)}. Error: ${String(e)}`);
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("summary" in parsed) ||
    !("streets" in parsed) ||
    !("keyDecisionPoints" in parsed) ||
    !("exploitativeAdjustments" in parsed) ||
    !("solverPerspective" in parsed) ||
    !("verdict" in parsed)
  ) {
    throw new Error("Response missing required fields");
  }

  const analysis = parsed as AnalysisJson;
  if (!["good", "questionable", "mistake"].includes(analysis.verdict)) {
    analysis.verdict = "questionable";
  }

  return analysis;
}
