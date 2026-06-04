import { useEffect, useRef } from "react";
import { Team, TEAMS } from "../types/shared";

interface Props {
  scores: Record<Team, number>;
  compact?: boolean;
}

export function Scoreboard({ scores, compact = false }: Props) {
  const prevScores = useRef<Record<Team, number>>({ ...scores });
  const pulseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    for (const team of TEAMS) {
      if (scores[team] !== prevScores.current[team]) {
        const el = pulseRefs.current[team];
        if (el) {
          el.classList.add("animate-pulse");
          timeouts.push(
            setTimeout(() => el.classList.remove("animate-pulse"), 800)
          );
        }
      }
    }
    prevScores.current = { ...scores };
    return () => timeouts.forEach(clearTimeout);
  }, [scores]);

  const maxScore = Math.max(...Object.values(scores), 1);

  if (compact) {
    return (
      <div className="space-y-1">
        {TEAMS.map((team) => (
          <div key={team} className="flex justify-between text-sm">
            <span className="text-muted truncate">{team}</span>
            <span className="text-gold font-bold ml-2">{scores[team]}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {TEAMS.map((team) => {
        const score = scores[team];
        const pct = (score / maxScore) * 100;
        return (
          <div
            key={team}
            ref={(el) => {
              pulseRefs.current[team] = el;
            }}
          >
            <div className="flex justify-between mb-1">
              <span className="text-white text-sm font-semibold">{team}</span>
              <span className="text-gold font-bold text-sm">{score} đ</span>
            </div>
            <div className="h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
