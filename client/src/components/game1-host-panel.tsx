import { useState } from "react";
import { GameState, Team, TEAMS } from "../types/shared";
import { useSocket } from "../hooks/use-socket";
import { G1_DATA } from "../data/game-data";
import { CrosswordGrid } from "./crossword-grid";
import { Scoreboard } from "./scoreboard";
import { CountdownTimer } from "./countdown-timer";

interface Props {
  state: GameState;
}

export function Game1HostPanel({ state }: Props) {
  const { emit } = useSocket();
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);

  const {
    g1_opened, g1_current_q, g1_buzz_active,
    g1_buzz_winner, g1_buzz_type, g1_keyword_solved, g1_timer_seconds, scores,
  } = state;

  const available = G1_DATA.map((row, i) => ({ row, i })).filter(({ i }) => !g1_opened.includes(i));
  const currentQ = g1_current_q !== null ? G1_DATA[g1_current_q] : null;

  function selectQuestion() {
    if (selectedIdx < 0 || g1_opened.includes(selectedIdx)) return;
    emit("host:select_q", { idx: selectedIdx });
  }

  function buzzForTeam(team: Team, type: "row" | "keyword") {
    emit("player:buzz", { team, type });
  }

  return (
    <div className="flex flex-1 h-screen overflow-hidden">
      {/* Left: grid + scoreboard */}
      <div className="flex flex-col flex-1 p-4 gap-4 overflow-auto">
        <CrosswordGrid state={state} />
        <div className="bg-surface rounded-xl p-4">
          <p className="text-muted text-xs uppercase tracking-wider mb-3">Bảng điểm</p>
          <Scoreboard scores={scores} />
        </div>
      </div>

      {/* Right: control panel */}
      <div className="w-80 shrink-0 border-l border-[#2a2a2a] p-4 overflow-y-auto space-y-4">

        {/* Question selector */}
        {!g1_keyword_solved && (
          <section className="bg-surface rounded-xl p-4 space-y-3">
            <p className="text-muted text-xs uppercase tracking-wider">Chọn hàng ngang</p>
            <select
              value={selectedIdx}
              onChange={(e) => setSelectedIdx(Number(e.target.value))}
              className="w-full bg-[#111] border border-[#3a3a3a] text-white text-sm rounded px-3 py-2"
            >
              <option value={-1}>-- Chọn câu hỏi --</option>
              {available.map(({ row, i: idx }) => (
                <option key={idx} value={idx}>
                  Hàng {idx + 1} — {row.word_length} chữ
                </option>
              ))}
            </select>
            <button
              onClick={selectQuestion}
              disabled={selectedIdx < 0}
              className="w-full py-2 rounded bg-blue-600 text-white font-semibold text-sm
                         disabled:opacity-40 hover:bg-blue-500 transition-colors"
            >
              Chọn câu hỏi này
            </button>

            {/* Current question text */}
            {currentQ && (
              <div className="bg-[#111] rounded p-3 border border-[#2a2a2a]">
                <p className="text-muted text-xs mb-1">Câu hỏi {(g1_current_q ?? 0) + 1}:</p>
                <p className="text-white text-sm leading-relaxed">{currentQ.question_text}</p>
              </div>
            )}
          </section>
        )}

        {/* Buzz controls (only when question selected, no winner) */}
        {currentQ && !g1_buzz_winner && !g1_keyword_solved && (
          <section className="bg-surface rounded-xl p-4 space-y-3">
            <p className="text-muted text-xs uppercase tracking-wider">Chuông hàng ngang</p>
            {!g1_buzz_active ? (
              <button
                onClick={() => emit("host:open_buzz")}
                className="w-full py-3 rounded bg-green-700 text-white font-bold text-sm
                           hover:bg-green-600 transition-colors"
              >
                🟢 MỞ CHUÔNG GIÀNH QUYỀN
              </button>
            ) : (
              <div className="space-y-2">
                <CountdownTimer
                  initialSeconds={g1_timer_seconds ?? 15}
                  running={g1_buzz_active}
                  onComplete={() => emit("host:close_buzz")}
                />
                <p className="text-yellow-400 text-sm font-semibold text-center animate-pulse">
                  ⏳ Đang chờ nhóm bấm chuông...
                </p>
                <button
                  onClick={() => emit("host:close_buzz")}
                  className="w-full py-2 rounded bg-red-800 text-white font-bold text-sm
                             hover:bg-red-700 transition-colors"
                >
                  🔴 KHÓA CHUÔNG
                </button>
                {/* Manual buzz — host registers which team buzzed */}
                <div className="pt-2">
                  <p className="text-muted text-xs mb-2">Nhóm bấm chuông:</p>
                  <div className="grid grid-cols-1 gap-1">
                    {TEAMS.map((team) => (
                      <button
                        key={team}
                        onClick={() => buzzForTeam(team as Team, "row")}
                        className="py-2 px-3 rounded bg-[#2a2a2a] text-white text-sm font-semibold
                                   hover:bg-blue-700 transition-colors text-left"
                      >
                        🔔 {team}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Buzz winner alert + judge panel */}
        {g1_buzz_winner && (
          <section className="bg-red-900 border border-red-600 rounded-xl p-4 space-y-3">
            {g1_buzz_type === "keyword" ? (
              <>
                <p className="text-white font-black text-base text-center">
                  🚨 {g1_buzz_winner}
                </p>
                <p className="text-red-200 text-sm text-center">
                  BẤM CHUÔNG GIẢI TỪ KHÓA DỌC!
                </p>
              </>
            ) : (
              <>
                <p className="text-white font-black text-base text-center">
                  🎯 {g1_buzz_winner}
                </p>
                <p className="text-red-200 text-sm text-center">
                  giành quyền trả lời Hàng {(g1_current_q ?? 0) + 1}
                </p>
              </>
            )}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => emit("host:correct")}
                className="py-3 rounded bg-green-700 text-white font-bold text-sm
                           hover:bg-green-600 transition-colors"
              >
                ✅ ĐÚNG
                <span className="block text-xs font-normal opacity-80">
                  {g1_buzz_type === "keyword" ? "+30đ & WIN" : "+10đ & Mở ô"}
                </span>
              </button>
              <button
                onClick={() => emit("host:wrong")}
                className="py-3 rounded bg-gray-700 text-white font-bold text-sm
                           hover:bg-gray-600 transition-colors"
              >
                ❌ SAI
                {g1_buzz_type === "row" && (
                  <span className="block text-xs font-normal opacity-80">Mở lại chuông</span>
                )}
              </button>
            </div>
          </section>
        )}

        {/* Keyword buzz section — always visible when game active */}
        {!g1_keyword_solved && !g1_buzz_winner && (
          <section className="bg-surface rounded-xl p-4 space-y-3">
            <p className="text-muted text-xs uppercase tracking-wider">Giải từ khóa dọc</p>
            <div className="grid grid-cols-1 gap-1">
              {TEAMS.map((team) => (
                <button
                  key={team}
                  onClick={() => buzzForTeam(team as Team, "keyword")}
                  className="py-2 px-3 rounded bg-red-950 border border-red-800 text-red-300
                             text-sm font-semibold hover:bg-red-800 transition-colors text-left"
                >
                  🔑 {team} giải từ khóa
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Game over state */}
        {g1_keyword_solved && (
          <section className="bg-green-900/40 border border-green-700 rounded-xl p-4 text-center">
            <p className="text-green-300 font-bold text-base">🎉 TỪ KHÓA ĐÃ GIẢI MÃ!</p>
            <p className="text-muted text-sm mt-1">Chuyển sang Phần 2: Lật Tranh</p>
          </section>
        )}
      </div>
    </div>
  );
}
