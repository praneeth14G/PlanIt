import type { FormEvent } from "react";

const EXAMPLES = [
  "5 days in Lisbon, relaxed pace, into food and architecture",
  "3-day weekend in Tokyo for first-timers, budget-conscious",
  "A week road-tripping the California coast, two people, no rush",
];

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  disabled: boolean;
  onSubmit: (prompt: string) => void;
}

export function TripForm({ value, onValueChange, disabled, onSubmit }: Props) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
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
      <div className="trip-form-footer">
        <div className="examples">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              className="example-chip"
              disabled={disabled}
              onClick={() => onValueChange(example)}
            >
              {example}
            </button>
          ))}
        </div>
        <button type="submit" className="submit-button" disabled={disabled || !value.trim()}>
          {disabled ? "Planning…" : "Plan trip"}
        </button>
      </div>
    </form>
  );
}
