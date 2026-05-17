/**
 * Cadence — AI Goal Coach
 * Powered by Gemini 2.5 Flash Lite. Suggests SMARTer rewrites of goal titles.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const SYSTEM_PROMPT = `You are an expert performance coach helping employees write SMART goals.
SMART = Specific, Measurable, Achievable, Relevant, Time-bound.

When given a draft goal, you respond with EXACTLY this JSON shape (no markdown, no commentary):
{
  "suggestion": "<rewritten goal title, max 120 chars>",
  "rationale": "<one-sentence reason this is better>",
  "smartScore": <integer 1-10>,
  "tips": ["<short tip 1>", "<short tip 2>"]
}

Rules:
- Keep the rewritten title under 120 characters
- Make it action-oriented (start with a verb)
- Embed a measurable target if one is implied
- If the original is already SMART, give a 9-10 score and only minor polish
- If the original is vague, score it 3-5 and provide a concrete rewrite
- Never return markdown. Never wrap in code fences. Pure JSON only.`;

export type CoachResponse = {
  suggestion: string;
  rationale: string;
  smartScore: number;
  tips: string[];
};

export async function coachGoal(args: {
  title: string;
  thrustArea?: string;
  uomType?: string;
  targetValue?: string | number;
}): Promise<CoachResponse> {
  if (!genAI) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not configured");
  }

  const userPrompt = `Draft goal: "${args.title}"
${args.thrustArea ? `Thrust area: ${args.thrustArea}` : ""}
${args.uomType ? `Unit of measure type: ${args.uomType}` : ""}
${args.targetValue ? `Target value: ${args.targetValue}` : ""}

Rewrite this as a SMART goal and return the JSON shape.`;

  const fallbackModels = [
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
  ];

  let lastErr: Error | null = null;
  for (const modelName of fallbackModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          temperature: 0.6,
          responseMimeType: "application/json",
        },
      });
      const result = await model.generateContent(userPrompt);
      const text = result.response.text();
      const parsed = JSON.parse(text) as CoachResponse;
      return {
        suggestion: String(parsed.suggestion ?? "").slice(0, 240),
        rationale: String(parsed.rationale ?? ""),
        smartScore: Math.min(10, Math.max(1, Number(parsed.smartScore) || 5)),
        tips: Array.isArray(parsed.tips) ? parsed.tips.slice(0, 4) : [],
      };
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error("Unknown error");
      continue;
    }
  }

  throw lastErr ?? new Error("All Gemini models failed");
}
