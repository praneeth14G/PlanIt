import { GoogleGenAI, Type } from "@google/genai";
import type { Itinerary } from "@flam/shared";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

// Hand-written alongside the Zod schema in shared/ rather than derived from
// it - Gemini's schema format isn't quite JSON Schema, so a generic
// converter would be more code than just keeping two small schemas in sync.
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    destination: { type: Type.STRING },
    durationDays: { type: Type.INTEGER },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          title: { type: Type.STRING },
          stops: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                time: { type: Type.STRING },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
              },
              required: ["name", "description"],
            },
          },
        },
        required: ["day", "title", "stops"],
      },
    },
  },
  required: ["destination", "durationDays", "days"],
};

const TIMEOUT_MS = 20_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("TIMEOUT")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

const FRESH_INSTRUCTIONS = `Given a traveler's description of a trip, produce a realistic day-by-day itinerary.

Trip description:
"""
{{PROMPT}}
"""

Rules:
- 2 to 5 stops per day, ordered by time of day.
- Keep each stop's description to one or two sentences.
- Include a "time" like "9:00 AM" when the activity is time-bound; omit it otherwise.
- durationDays must match the number of entries in "days".`;

// The refinement loop doesn't diff/patch JSON - it just hands Gemini the
// existing itinerary plus the follow-up instruction and asks for the whole
// thing back, edited. Same schema, same validation path as a fresh plan;
// a real patch format would add real complexity for not much practical gain
// at this scale.
const REFINE_INSTRUCTIONS = `A traveler already has this itinerary:
"""
{{CURRENT}}
"""

They asked for this change: "{{PROMPT}}"

Return the full itinerary again in the same JSON shape, with that change
applied and everything else left as-is unless the change implies otherwise.`;

export async function generateItinerary(prompt: string, current?: Itinerary): Promise<string> {
  const instructions = current
    ? REFINE_INSTRUCTIONS.replace("{{CURRENT}}", JSON.stringify(current)).replace("{{PROMPT}}", prompt)
    : FRESH_INSTRUCTIONS.replace("{{PROMPT}}", prompt);

  const call = ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: `You are a trip-planning assistant. ${instructions}`,
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const result = await withTimeout(call, TIMEOUT_MS);
  return result.text ?? "";
}
