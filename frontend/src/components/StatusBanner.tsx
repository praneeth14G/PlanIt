interface Props {
  status: "idle" | "loading" | "error" | "success";
  message?: string;
  onRetry?: () => void;
}

export function StatusBanner({ status, message, onRetry }: Props) {
  if (status === "idle") {
    return <p className="status-banner status-idle">Describe a trip above and I'll build you an itinerary.</p>;
  }

  if (status === "loading") {
    return (
      <p className="status-banner status-loading" role="status">
        <span className="spinner" aria-hidden="true" />
        Building your itinerary…
      </p>
    );
  }

  if (status === "error") {
    return (
      <div className="status-banner status-error" role="alert">
        <span>{message}</span>
        {onRetry && (
          <button type="button" className="retry-button" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }

  return null;
}
