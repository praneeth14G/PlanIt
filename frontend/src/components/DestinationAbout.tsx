interface Props {
  description: string | null;
  spots: string[];
  extraSpotsCount: number;
}

export function DestinationAbout({ description, spots, extraSpotsCount }: Props) {
  if (!description && spots.length === 0) return null;

  return (
    <div className="destination-about">
      {description && <p className="destination-description">{description}</p>}
      {spots.length > 0 && (
        <p className="destination-spots">
          <span className="destination-spots-label">Spots you'll visit: </span>
          {spots.join(", ")}
          {extraSpotsCount > 0 && `, and ${extraSpotsCount} more`}
        </p>
      )}
    </div>
  );
}
