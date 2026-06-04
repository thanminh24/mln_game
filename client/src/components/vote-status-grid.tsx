import { GameState, Team, TEAMS } from "../types/shared";
import { G2_DATA } from "../data/game-data";

interface Props {
  state: GameState;
}

export function VoteStatusGrid({ state }: Props) {
  const { g2_cho_phep_vote, g2_da_cham_diem, g2_round, g2_question, votes } = state;
  const correctAnswer = G2_DATA[g2_round]?.cau_hoi[g2_question]?.correct_answer;

  return (
    <div className="space-y-2">
      {TEAMS.map((team) => {
        const vote = votes[team as Team];
        let badge: React.ReactNode;

        if (g2_da_cham_diem) {
          const isCorrect = vote === correctAnswer;
          badge = (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                isCorrect
                  ? "bg-green-800 text-green-200"
                  : "bg-red-900 text-red-200"
              }`}
            >
              {vote ?? "—"} {isCorrect ? "✓" : "✗"}
            </span>
          );
        } else if (g2_cho_phep_vote && vote !== null) {
          badge = (
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-800 text-blue-200">
              ✅ Đã chốt
            </span>
          );
        } else if (g2_cho_phep_vote) {
          badge = (
            <span className="text-xs px-2 py-0.5 rounded bg-yellow-900 text-yellow-300 animate-pulse">
              ⏳ Chưa chốt
            </span>
          );
        } else {
          badge = (
            <span className="text-xs px-2 py-0.5 rounded bg-[#2a2a2a] text-muted">
              ⏳ Chờ
            </span>
          );
        }

        return (
          <div key={team} className="flex justify-between items-center">
            <span className="text-white text-sm">{team}</span>
            {badge}
          </div>
        );
      })}
    </div>
  );
}
