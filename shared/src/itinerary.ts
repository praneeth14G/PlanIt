import { z } from "zod";

export const stopSchema = z.object({
  name: z.string().min(1),
  time: z.string().optional(),
  description: z.string().min(1),
  category: z.string().optional(),
});

export const daySchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(1),
  stops: z.array(stopSchema).min(1),
});

export const itinerarySchema = z.object({
  destination: z.string().min(1),
  durationDays: z.number().int().positive(),
  days: z.array(daySchema).min(1),
});

export type Stop = z.infer<typeof stopSchema>;
export type Day = z.infer<typeof daySchema>;
export type Itinerary = z.infer<typeof itinerarySchema>;

// The model never generates ids - those get stamped on client-side after
// validation, since uniqueness/stability across re-renders is a UI concern,
// not something worth asking the AI for.
export type StopWithId = Stop & { id: string };
export type DayWithId = Omit<Day, "stops"> & { stops: StopWithId[] };
export type ItineraryWithIds = Omit<Itinerary, "days"> & { days: DayWithId[] };

export interface ApiErrorBody {
  error: {
    code: "INVALID_INPUT" | "MODEL_ERROR" | "BAD_SHAPE" | "TIMEOUT" | "UNKNOWN";
    message: string;
  };
}
