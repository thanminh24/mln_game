import { useState, useEffect, useRef } from "react";
import { useInterval } from "../hooks/use-interval";

interface Props {
  initialSeconds: number;
  onComplete: () => void;
  running: boolean;
}

export function CountdownTimer({ initialSeconds, onComplete, running }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  // One-shot guard: prevent duplicate emits in the tick gap before server state propagates
  const firedRef = useRef(false);

  useInterval(
    () => setSecondsLeft((prev) => Math.max(prev - 1, 0)),
    running && secondsLeft > 0 ? 1000 : null
  );

  useEffect(() => {
    if (!running) {
      firedRef.current = false; // reset when timer is stopped (gate closed externally)
      return;
    }
    if (secondsLeft === 0 && !firedRef.current) {
      firedRef.current = true;
      onComplete();
    }
  }, [secondsLeft, running, onComplete]);

  const isUrgent = secondsLeft <= 3;

  return (
    <div className="text-center">
      <span
        className={[
          "text-4xl font-black tabular-nums",
          isUrgent ? "text-red-500 animate-pulse" : "text-white",
        ].join(" ")}
      >
        {secondsLeft}
      </span>
      <span className="text-muted text-sm ml-1">s</span>
    </div>
  );
}
