import type { ItineraryWithIds } from "@flam/shared";
import { DayCard } from "./DayCard";

interface Props {
  itinerary: ItineraryWithIds;
  onChange: (itinerary: ItineraryWithIds) => void;
}

export function ItineraryView({ itinerary, onChange }: Props) {
  function updateDay(dayIndex: number, stops: ItineraryWithIds["days"][number]["stops"]) {
    const days = itinerary.days.map((day, i) => (i === dayIndex ? { ...day, stops } : day));
    onChange({ ...itinerary, days });
  }

  return (
    <div className="itinerary">
      <header className="itinerary-header">
        <h2>{itinerary.destination}</h2>
        <span>
          {itinerary.durationDays} day{itinerary.durationDays === 1 ? "" : "s"}
        </span>
      </header>
      {itinerary.days.map((day, index) => (
        <DayCard key={day.day} day={day} defaultOpen={index === 0} onStopsChange={(stops) => updateDay(index, stops)} />
      ))}
    </div>
  );
}
