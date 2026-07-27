import { useState, type FormEvent } from "react";
import { INTEREST_CATEGORIES } from "../lib/categories";

const EXAMPLES = [
  "5 days in Lisbon, relaxed pace, into food and architecture",
  "3-day weekend in Tokyo for first-timers, budget-conscious",
  "A week road-tripping the California coast, two people, no rush",
];

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  isLoading: boolean;
  onSubmit: (prompt: string) => void;
}

export function TripForm({ value, onValueChange, isLoading, onSubmit }: Props) {
  const [interests, setInterests] = useState<string[]>([]);

  function toggleInterest(label: string) {
    setInterests((prev) => (prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    const withInterests = interests.length
      ? `${trimmed}\n\nEspecially interested in: ${interests.join(", ")}.`
      : trimmed;
    onSubmit(withInterests);
  }

  return (
    <form className="trip-form" onSubmit={handleSubmit}>
      <label htmlFor="trip-input">Describe your trip</label>
      <textarea
        id="trip-input"
        rows={4}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="Where are you going, for how long, and what are you into?"
      />

      <div className="interests-field">
        <span className="interests-label">What are you into? (optional)</span>
        <div className="interest-chips">
          {INTEREST_CATEGORIES.map(({ label, emoji }) => (
            <button
              key={label}
              type="button"
              className={`interest-chip${interests.includes(label) ? " active" : ""}`}
              onClick={() => toggleInterest(label)}
              aria-pressed={interests.includes(label)}
            >
              <span aria-hidden="true">{emoji}</span> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="trip-form-footer">
        <div className="examples">
          {EXAMPLES.map((example) => (
            <button key={example} type="button" className="example-chip" onClick={() => onValueChange(example)}>
              {example}
            </button>
          ))}
        </div>
        {/* not disabled while loading - resubmitting should cancel the old request, not be blocked */}
        <button type="submit" className="submit-button" disabled={!value.trim()}>
          {isLoading ? "Re-planning…" : "Plan trip"}
        </button>
      </div>
    </form>
  );
}
