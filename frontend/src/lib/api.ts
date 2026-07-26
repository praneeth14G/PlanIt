import type { ApiErrorBody, Itinerary, ItineraryWithIds } from "@flam/shared";

export class TripPlannerError extends Error {}

// In dev this is empty and Vite's proxy (vite.config.ts) forwards /api to the
// local Express server. In production there's no dev proxy, so this points
// at the deployed backend's URL instead (set at build time).
const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function fetchItinerary(
  prompt: string,
  signal: AbortSignal,
  current?: ItineraryWithIds,
): Promise<ItineraryWithIds> {
  const res = await fetch(`${API_BASE}/api/plan-trip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(current ? { prompt, currentItinerary: withoutIds(current) } : { prompt }),
    signal,
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new TripPlannerError(
      res.ok
        ? "The server sent back something that wasn't valid JSON."
        : "Couldn't reach the server. Try again in a moment.",
    );
  }

  if (!res.ok) {
    const message = (body as ApiErrorBody)?.error?.message;
    throw new TripPlannerError(message || "Something went wrong. Try again.");
  }

  return withIds(body as Itinerary);
}

function withIds(itinerary: Itinerary): ItineraryWithIds {
  return {
    ...itinerary,
    days: itinerary.days.map((day) => ({
      ...day,
      stops: day.stops.map((stop) => ({ ...stop, id: crypto.randomUUID() })),
    })),
  };
}

function withoutIds(itinerary: ItineraryWithIds): Itinerary {
  return {
    ...itinerary,
    days: itinerary.days.map(({ stops, ...day }) => ({
      ...day,
      stops: stops.map(({ id: _id, ...stop }) => stop),
    })),
  };
}
