import { useEffect, useState } from "react";
import type { ItineraryWithIds } from "@flam/shared";
import { DayCard } from "./DayCard";
import { DestinationHero } from "./DestinationHero";
import { DestinationAbout } from "./DestinationAbout";
import { CategoryFilter } from "./CategoryFilter";
import { fetchDestinationInfo, type DestinationInfo } from "../lib/destinationInfo";

const MAX_SPOTS_SHOWN = 10;

interface Props {
  itinerary: ItineraryWithIds;
  onChange: (itinerary: ItineraryWithIds) => void;
}

export function ItineraryView({ itinerary, onChange }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [info, setInfo] = useState<DestinationInfo>({ imageUrl: null, description: null });

  useEffect(() => {
    setInfo({ imageUrl: null, description: null });
    const controller = new AbortController();
    fetchDestinationInfo(itinerary.destination, controller.signal).then((result) => {
      if (!controller.signal.aborted) setInfo(result);
    });
    return () => controller.abort();
  }, [itinerary.destination]);

  function updateDay(dayIndex: number, stops: ItineraryWithIds["days"][number]["stops"]) {
    const days = itinerary.days.map((day, i) => (i === dayIndex ? { ...day, stops } : day));
    onChange({ ...itinerary, days });
  }

  const categories = Array.from(
    new Set(
      itinerary.days.flatMap((day) => day.stops.map((stop) => stop.category).filter((c): c is string => Boolean(c))),
    ),
  );

  const allSpotNames = Array.from(new Set(itinerary.days.flatMap((day) => day.stops.map((stop) => stop.name))));
  const spotsPreview = allSpotNames.slice(0, MAX_SPOTS_SHOWN);
  const extraSpotsCount = allSpotNames.length - spotsPreview.length;

  return (
    <div className="itinerary">
      <DestinationHero
        destination={itinerary.destination}
        subtitle={`${itinerary.durationDays} day${itinerary.durationDays === 1 ? "" : "s"}`}
        imageUrl={info.imageUrl}
      />
      <DestinationAbout description={info.description} spots={spotsPreview} extraSpotsCount={extraSpotsCount} />
      {categories.length > 0 && (
        <CategoryFilter categories={categories} active={activeCategory} onChange={setActiveCategory} />
      )}
      {itinerary.days.map((day, index) => (
        <DayCard
          key={day.day}
          day={day}
          defaultOpen={index === 0}
          activeCategory={activeCategory}
          onStopsChange={(stops) => updateDay(index, stops)}
        />
      ))}
    </div>
  );
}
