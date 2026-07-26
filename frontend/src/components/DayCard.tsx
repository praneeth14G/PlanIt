import { useState } from "react";
import type { DayWithId, StopWithId } from "@flam/shared";
import { StopRow } from "./StopRow";

interface Props {
  day: DayWithId;
  defaultOpen?: boolean;
  onStopsChange: (stops: StopWithId[]) => void;
}

export function DayCard({ day, defaultOpen = false, onStopsChange }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  function removeStop(id: string) {
    onStopsChange(day.stops.filter((stop) => stop.id !== id));
  }

  function moveStop(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= day.stops.length) return;
    const stops = [...day.stops];
    [stops[index], stops[target]] = [stops[target], stops[index]];
    onStopsChange(stops);
  }

  return (
    <section className="day-card">
      <button type="button" className="day-header" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="day-number">Day {day.day}</span>
        <span className="day-title">{day.title}</span>
        <span className="day-toggle">{open ? "−" : "+"}</span>
      </button>
      <div className={`stop-list-wrapper${open ? " open" : ""}`} aria-hidden={!open}>
        <ul className="stop-list">
          {day.stops.map((stop, index) => (
            <StopRow
              key={stop.id}
              stop={stop}
              isFirst={index === 0}
              isLast={index === day.stops.length - 1}
              onRemove={() => removeStop(stop.id)}
              onMoveUp={() => moveStop(index, -1)}
              onMoveDown={() => moveStop(index, 1)}
            />
          ))}
          {day.stops.length === 0 && <li className="empty-day">No stops left for this day.</li>}
        </ul>
      </div>
    </section>
  );
}
