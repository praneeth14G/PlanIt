import type { StopWithId } from "@flam/shared";

interface Props {
  stop: StopWithId;
  isFirst: boolean;
  isLast: boolean;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function StopRow({ stop, isFirst, isLast, onRemove, onMoveUp, onMoveDown }: Props) {
  return (
    <li className="stop-row">
      {(onMoveUp || onMoveDown) && (
        <div className="stop-move">
          <button type="button" onClick={onMoveUp} disabled={isFirst || !onMoveUp} aria-label="Move earlier in the day">
            ↑
          </button>
          <button type="button" onClick={onMoveDown} disabled={isLast || !onMoveDown} aria-label="Move later in the day">
            ↓
          </button>
        </div>
      )}
      <div className="stop-body">
        <div className="stop-heading">
          {stop.time && <span className="stop-time">{stop.time}</span>}
          <span className="stop-name">{stop.name}</span>
          {stop.category && <span className="stop-category">{stop.category}</span>}
        </div>
        <p className="stop-description">{stop.description}</p>
      </div>
      <button type="button" className="stop-remove" onClick={onRemove} aria-label={`Remove ${stop.name}`}>
        ×
      </button>
    </li>
  );
}
