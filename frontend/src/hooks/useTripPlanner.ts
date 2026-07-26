import { useCallback, useReducer, useRef } from "react";
import type { ItineraryWithIds } from "@flam/shared";
import { fetchItinerary, TripPlannerError } from "../lib/api";

type State =
  | { status: "idle" }
  | { status: "loading"; itinerary?: ItineraryWithIds }
  | { status: "error"; message: string; itinerary?: ItineraryWithIds }
  | { status: "success"; itinerary: ItineraryWithIds };

type Action =
  | { type: "submit" }
  | { type: "success"; itinerary: ItineraryWithIds }
  | { type: "failure"; message: string }
  | { type: "edit"; itinerary: ItineraryWithIds };

function carryOver(state: State): ItineraryWithIds | undefined {
  return "itinerary" in state ? state.itinerary : undefined;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "submit":
      return { status: "loading", itinerary: carryOver(state) };
    case "success":
      return { status: "success", itinerary: action.itinerary };
    case "failure":
      return { status: "error", message: action.message, itinerary: carryOver(state) };
    case "edit": {
      if (state.status === "idle" || !state.itinerary) return state;
      return { ...state, itinerary: action.itinerary };
    }
  }
}

function messageFor(err: unknown): string {
  if (err instanceof TripPlannerError) return err.message;
  return "Couldn't reach the server. Check your connection and try again.";
}

export function useTripPlanner() {
  const [state, dispatch] = useReducer(reducer, { status: "idle" });
  const latestRequestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const submit = useCallback(async (prompt: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++latestRequestId.current;

    dispatch({ type: "submit" });

    try {
      const itinerary = await fetchItinerary(prompt, controller.signal);
      if (latestRequestId.current !== requestId) return;
      dispatch({ type: "success", itinerary });
    } catch (err) {
      if (latestRequestId.current !== requestId) return;
      if (err instanceof DOMException && err.name === "AbortError") return;
      dispatch({ type: "failure", message: messageFor(err) });
    }
  }, []);

  const edit = useCallback((itinerary: ItineraryWithIds) => {
    dispatch({ type: "edit", itinerary });
  }, []);

  return { state, submit, edit };
}
