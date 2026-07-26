import { Router } from "express";
import { itinerarySchema, type ApiErrorBody } from "@flam/shared";
import { generateItinerary } from "../gemini.js";

export const planRouter = Router();

planRouter.post("/plan-trip", async (req, res) => {
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";

  if (!prompt) {
    res.status(400).json({
      error: { code: "INVALID_INPUT", message: "Describe your trip first." },
    } satisfies ApiErrorBody);
    return;
  }

  let raw: string;
  try {
    raw = await generateItinerary(prompt);
  } catch (err) {
    console.error("gemini call failed:", err);
    const timedOut = err instanceof Error && err.message === "TIMEOUT";
    res.status(timedOut ? 504 : 502).json({
      error: {
        code: timedOut ? "TIMEOUT" : "MODEL_ERROR",
        message: timedOut
          ? "The trip planner took too long to respond. Try again."
          : "Couldn't reach the AI model right now. Try again in a moment.",
      },
    } satisfies ApiErrorBody);
    return;
  }

  if (!raw) {
    res.status(502).json({
      error: { code: "MODEL_ERROR", message: "The model returned an empty response." },
    } satisfies ApiErrorBody);
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    res.status(502).json({
      error: { code: "BAD_SHAPE", message: "The model's response wasn't valid JSON." },
    } satisfies ApiErrorBody);
    return;
  }

  const result = itinerarySchema.safeParse(parsed);
  if (!result.success) {
    res.status(502).json({
      error: { code: "BAD_SHAPE", message: "The model's response didn't match the itinerary format we expect." },
    } satisfies ApiErrorBody);
    return;
  }

  res.json(result.data);
});
