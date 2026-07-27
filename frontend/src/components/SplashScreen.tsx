interface Props {
  exiting: boolean;
}

export function SplashScreen({ exiting }: Props) {
  return (
    <div className={`splash${exiting ? " splash-exit" : ""}`} aria-hidden="true">
      <svg className="splash-compass" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.4" />
        <path d="M15 9l-2 5-5 2 2-5z" fill="currentColor" />
      </svg>
      <h1 className="splash-title">PlanIt</h1>
    </div>
  );
}
