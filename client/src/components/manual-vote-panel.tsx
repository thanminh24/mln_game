import { GameState, Team, TEAMS } from "../types/shared";
import { useSocket } from "../hooks/use-socket";

const ANSWERS = ["A", "B", "C", "D"] as const;

interface Props {
  state: GameState;
}

export function ManualVotePanel({ state }: Props) {
  const { emit } = useSocket();
  const { votes } = state;

  return (
    <div className="space-y-2">
      {TEAMS.map((team) => {
        const current = votes[team as Team];
        return (
          <div key={team} className="flex items-center gap-2">
            <span className="text-white text-sm w-16 shrink-0">{team}</span>
            <div className="flex gap-1">
              {ANSWERS.map((ans) => (
                <button
                  key={ans}
                  onClick={() => emit("host:set_vote", { team: team as Team, answer: ans })}
                  className={[
                    "w-9 h-9 rounded text-sm font-bold transition-colors",
                    current === ans
                      ? "bg-blue-600 text-white"
                      : "bg-[#2a2a2a] text-muted hover:bg-[#3a3a3a] hover:text-white",
                  ].join(" ")}
                >
                  {ans}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
