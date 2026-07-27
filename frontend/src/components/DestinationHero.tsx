interface Props {
  destination: string;
  subtitle: string;
  imageUrl: string | null;
}

export function DestinationHero({ destination, subtitle, imageUrl }: Props) {
  return (
    <div className="destination-hero" style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}>
      <div className="destination-hero-overlay" />
      <div className="destination-hero-text">
        <h2>{destination}</h2>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}
