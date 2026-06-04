import { Team, TEAMS } from "../types/shared";

interface Props {
  scores: Record<Team, number>;
}

const PODIUM_COLORS = [
  { bg: "bg-gold", text: "text-black", label: "🥇 Nhất" },
  { bg: "bg-gray-300", text: "text-black", label: "🥈 Nhì" },
  { bg: "bg-amber-700", text: "text-white", label: "🥉 Ba" },
];

const PODIUM_HEIGHTS = ["h-28", "h-20", "h-14"];

export function PodiumScoreboard({ scores }: Props) {
  const ranked = [...TEAMS].sort((a, b) => scores[b as Team] - scores[a as Team]);
  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  // Podium display order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const rankOf = (team: string) => top3.indexOf(team as Team);

  return (
    <div className="space-y-8">
      {/* Podium */}
      <div className="flex items-end justify-center gap-4">
        {podiumOrder.map((team) => {
          if (!team) return null;
          const rank = rankOf(team);
          const col = rank === 0 ? 1 : rank === 1 ? 0 : 2;
          const { bg, text, label } = PODIUM_COLORS[col];
          return (
            <div key={team} className="flex flex-col items-center gap-2">
              <span className="text-white text-sm font-bold text-center">{team}</span>
              <span className="text-gold font-black text-lg">{scores[team as Team]} đ</span>
              <div className={`w-28 ${PODIUM_HEIGHTS[col]} ${bg} rounded-t-lg flex items-center justify-center`}>
                <span className={`text-sm font-bold ${text}`}>{label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Flat table for ranks 4-5 */}
      {rest.length > 0 && (
        <div className="border border-[#2a2a2a] rounded-xl overflow-hidden">
          {rest.map((team, i) => (
            <div
              key={team}
              className={`flex justify-between px-6 py-3 ${
                i < rest.length - 1 ? "border-b border-[#2a2a2a]" : ""
              }`}
            >
              <span className="text-muted text-sm">{top3.length + i + 1}. {team}</span>
              <span className="text-gold font-bold">{scores[team as Team]} đ</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
