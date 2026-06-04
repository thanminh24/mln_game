import { GameState, Team, TEAMS } from "../types/shared";
import { useSocket } from "../hooks/use-socket";

interface Props {
  state: GameState;
}

export function HostSidebar({ state }: Props) {
  const { emit } = useSocket();

  function handleReset() {
    if (window.confirm("Đặt lại toàn bộ trò chơi? Mọi điểm số sẽ bị xoá.")) {
      emit("host:reset");
    }
  }

  return (
    <aside className="flex flex-col h-screen w-52 bg-surface border-r border-[#2a2a2a] p-4 gap-4 shrink-0">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-gold font-black text-xl leading-tight">MLN111</h1>
        <p className="text-muted text-xs">Triết học Mác - Lênin</p>
      </div>

      <hr className="border-[#2a2a2a]" />

      {/* Mode switch */}
      <div className="space-y-2">
        <p className="text-muted text-xs uppercase tracking-wider">Phần chơi</p>
        <button
          onClick={() => emit("host:switch_mode", { mode: "game1" })}
          className={[
            "w-full text-left px-3 py-2 rounded text-sm font-semibold transition-colors",
            state.mode === "game1"
              ? "bg-blue-600 text-white"
              : "bg-[#2a2a2a] text-muted hover:bg-[#333] hover:text-white",
          ].join(" ")}
        >
          <span className="text-muted text-xs mr-1">F1</span> Phần 1: Ô Chữ
        </button>
        <button
          onClick={() => emit("host:switch_mode", { mode: "game2" })}
          className={[
            "w-full text-left px-3 py-2 rounded text-sm font-semibold transition-colors",
            state.mode === "game2"
              ? "bg-blue-600 text-white"
              : "bg-[#2a2a2a] text-muted hover:bg-[#333] hover:text-white",
          ].join(" ")}
        >
          <span className="text-muted text-xs mr-1">F2</span> Phần 2: Lật Tranh
        </button>
      </div>

      <hr className="border-[#2a2a2a]" />

      {/* Mini scoreboard */}
      <div className="flex-1 space-y-2 overflow-auto">
        <p className="text-muted text-xs uppercase tracking-wider">Điểm số</p>
        {TEAMS.map((team) => (
          <div key={team} className="flex justify-between items-center">
            <span className="text-white text-xs truncate">{team}</span>
            <span className="text-gold font-bold text-sm ml-1">
              {state.scores[team as Team]}
            </span>
          </div>
        ))}
      </div>

      <hr className="border-[#2a2a2a]" />

      {/* Reset */}
      <button
        id="host-reset-btn"
        onClick={handleReset}
        className="w-full py-2 rounded border border-red-700 text-red-500 text-sm font-semibold
                   hover:bg-red-900/30 transition-colors"
      >
        Esc &nbsp;Đặt lại
      </button>
    </aside>
  );
}
