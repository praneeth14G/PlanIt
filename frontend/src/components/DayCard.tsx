import { useState, Fragment } from "react";
import type { DayWithId, Stop, StopWithId } from "@flam/shared";
import { StopRow } from "./StopRow";
import { AddStopForm } from "./AddStopForm";
import { parseTime, formatTime } from "../lib/time";

interface Props {
  day: DayWithId;
  defaultOpen?: boolean;
  activeCategory: string | null;
  onStopsChange: (stops: StopWithId[]) => void;
}

export function DayCard({ day, defaultOpen = false, activeCategory, onStopsChange }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [addingAt, setAddingAt] = useState<number | null>(null);

  const filtering = activeCategory !== null;
  const visibleStops = filtering ? day.stops.filter((s) => s.category === activeCategory) : day.stops;

  function removeStop(id: string) {
    onStopsChange(day.stops.filter((stop) => stop.id !== id));
  }

  function moveStop(id: string, direction: -1 | 1) {
    const index = day.stops.findIndex((s) => s.id === id);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= day.stops.length) return;
    const stops = [...day.stops];
    [stops[index], stops[target]] = [stops[target], stops[index]];
    onStopsChange(stops);
  }

  // Inserting a stop pushes every later stop in the day back by its
  // duration - times that don't parse (e.g. "Morning") are left untouched
  // rather than guessed at.
  function insertStop(index: number, stop: Stop, durationMinutes: number) {
    const stops = [...day.stops];
    stops.splice(index, 0, { ...stop, id: crypto.randomUUID() });
    for (let i = index + 1; i < stops.length; i++) {
      const minutes = parseTime(stops[i].time);
      if (minutes !== null) stops[i] = { ...stops[i], time: formatTime(minutes + durationMinutes) };
    }
    onStopsChange(stops);
    setAddingAt(null);
  }

  function renderInsertSlot(index: number) {
    if (addingAt === index) {
      return <AddStopForm key={`add-${index}`} onAdd={(stop, duration) => insertStop(index, stop, duration)} onCancel={() => setAddingAt(null)} />;
    }
    return (
      <li key={`slot-${index}`} className="insert-slot">
        <button type="button" className="insert-stop-button" onClick={() => setAddingAt(index)}>
          + Add stop here
        </button>
      </li>
    );
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
          {filtering ? (
            <>
              {visibleStops.length === 0 ? (
                <li className="empty-day">No stops match this filter.</li>
              ) : (
                visibleStops.map((stop) => (
                  <StopRow key={stop.id} stop={stop} isFirst isLast onRemove={() => removeStop(stop.id)} />
                ))
              )}
              <li className="filter-note">Clear the filter to reorder or add stops.</li>
            </>
          ) : (
            <>
              {renderInsertSlot(0)}
              {day.stops.length === 0 && <li className="empty-day">No stops left for this day.</li>}
              {day.stops.map((stop, index) => (
                <Fragment key={stop.id}>
                  <StopRow
                    stop={stop}
                    isFirst={index === 0}
                    isLast={index === day.stops.length - 1}
                    onRemove={() => removeStop(stop.id)}
                    onMoveUp={() => moveStop(stop.id, -1)}
                    onMoveDown={() => moveStop(stop.id, 1)}
                  />
                  {renderInsertSlot(index + 1)}
                </Fragment>
              ))}
            </>
          )}
        </ul>
      </div>
    </section>
  );
}
