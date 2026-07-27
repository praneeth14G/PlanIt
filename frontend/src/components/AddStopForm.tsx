import { useState, type FormEvent } from "react";
import type { Stop } from "@flam/shared";
import { INTEREST_CATEGORIES } from "../lib/categories";

interface Props {
  onAdd: (stop: Stop, durationMinutes: number) => void;
  onCancel: () => void;
}

export function AddStopForm({ onAdd, onCancel }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onAdd(
      {
        name: trimmedName,
        category: category.trim() || undefined,
        description: description.trim() || "Added by you.",
        time: time.trim() || undefined,
      },
      Math.max(0, duration || 0),
    );
  }

  return (
    <li className="add-stop-form">
      <form onSubmit={handleSubmit}>
        <div className="add-stop-row">
          <input
            type="text"
            placeholder="Stop name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="New stop name"
            autoFocus
          />
          <input
            list="interest-categories"
            type="text"
            placeholder="Category (optional)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="New stop category"
          />
          <datalist id="interest-categories">
            {INTEREST_CATEGORIES.map((c) => (
              <option key={c.label} value={c.label} />
            ))}
          </datalist>
        </div>
        <textarea
          rows={2}
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-label="New stop description"
        />
        <div className="add-stop-row">
          <input
            type="text"
            placeholder="Time, e.g. 2:30 PM (optional)"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            aria-label="New stop time"
          />
          <label className="duration-field">
            Duration
            <input
              type="number"
              min={0}
              step={15}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              aria-label="Duration in minutes, used to push later stops back"
            />
            min
          </label>
        </div>
        <div className="add-stop-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" disabled={!name.trim()}>
            Add stop
          </button>
        </div>
      </form>
    </li>
  );
}
