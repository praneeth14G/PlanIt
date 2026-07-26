import { itinerarySchema, type ApiErrorBody, type Itinerary } from "@flam/shared";
import { generateItinerary } from "./gemini.js";

export interface PlanTripResult {
  status: number;
  body: Itinerary | ApiErrorBody;
}

// Framework-agnostic: no Express, no Vercel types. Both the local Express
// route and the deployed Vercel function are thin adapters that just hand
// this the parsed request body and send back whatever status/body it returns.
export async function handlePlanTrip(requestBody: unknown): Promise<PlanTripResult> {
  const body = requestBody as { prompt?: unknown; currentItinerary?: unknown } | null | undefined;
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";

  if (!prompt) {
    return {
      status: 400,
      body: { error: { code: "INVALID_INPUT", message: "Describe your trip first." } },
    };
  }

  // currentItinerary is only ever context for the prompt, never trusted as-is -
  // if it doesn't parse, we silently fall back to a fresh plan instead of erroring.
  const currentParsed = itinerarySchema.safeParse(body?.currentItinerary);
  const current = currentParsed.success ? currentParsed.data : undefined;

  let raw: string;
  try {
    raw = await generateItinerary(prompt, current);
  } catch (err) {
    console.error("gemini call failed:", err);
    const timedOut = err instanceof Error && err.message === "TIMEOUT";
    return {
      status: timedOut ? 504 : 502,
      body: {
        error: {
          code: timedOut ? "TIMEOUT" : "MODEL_ERROR",
          message: timedOut
            ? "The trip planner took too long to respond. Try again."
            : "Couldn't reach the AI model right now. Try again in a moment.",
        },
      },
    };
  }

  if (!raw) {
    return {
      status: 502,
      body: { error: { code: "MODEL_ERROR", message: "The model returned an empty response." } },
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      status: 502,
      body: { error: { code: "BAD_SHAPE", message: "The model's response wasn't valid JSON." } },
    };
  }

  const result = itinerarySchema.safeParse(parsed);
  if (!result.success) {
    return {
      status: 502,
      body: { error: { code: "BAD_SHAPE", message: "The model's response didn't match the itinerary format we expect." } },
    };
  }

  return { status: 200, body: result.data };
}
