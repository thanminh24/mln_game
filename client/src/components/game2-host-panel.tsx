import { GameState } from "../types/shared";
import { useSocket } from "../hooks/use-socket";
import { G2_DATA } from "../data/game-data";
import { ImageSliceReveal } from "./image-slice-reveal";
import { VoteStatusGrid } from "./vote-status-grid";
import { ManualVotePanel } from "./manual-vote-panel";
import { Scoreboard } from "./scoreboard";
import { CountdownTimer } from "./countdown-timer";
import { useNavigate } from "react-router-dom";

interface Props {
  state: GameState;
}

export function Game2HostPanel({ state }: Props) {
  const { emit } = useSocket();
  const navigate = useNavigate();
  const { g2_round, g2_question, g2_done, g2_cho_phep_vote, g2_da_cham_diem,
          g2_revealed_slices, g2_timer_seconds, scores } = state;

  const round = G2_DATA[g2_round];
  const isGameEnd = !round;
  const question = round?.cau_hoi[g2_question];
  const isFullyRevealed = g2_revealed_slices.length >= 5 || g2_done;

  // Game end screen — both rounds complete
  if (isGameEnd) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
        <h2 className="text-game-xl font-black text-gold text-center">
          🏆 KẾT THÚC TOÀN BỘ CHƯƠNG TRÌNH!
        </h2>
        <div className="w-full max-w-md">
          <Scoreboard scores={scores} />
        </div>
        <button
          onClick={() => navigate("/summary")}
          className="px-8 py-3 rounded-xl bg-gold text-black font-black text-game-sm
                     hover:opacity-90 transition-opacity"
        >
          Xem Tổng Kết →
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-screen overflow-hidden">
      {/* Left: question + controls */}
      <div className="flex flex-col flex-1 p-4 gap-4 overflow-y-auto">

        {/* Round header */}
        <div className="bg-surface rounded-xl px-4 py-3 flex justify-between items-center">
          <h2 className="text-gold font-black text-lg">{round.round_name}</h2>
          <span className="text-muted text-sm">
            Câu {g2_question + 1} / {round.cau_hoi.length}
          </span>
        </div>

        {/* Question display */}
        {question && !g2_done && (
          <div className="bg-surface rounded-xl p-4 space-y-3">
            <p className="text-white font-bold text-base leading-relaxed">
              {question.question_text}
            </p>
            <div className="space-y-2">
              {(["A", "B", "C", "D"] as const).map((opt) => {
                const text = question[`opt_${opt}` as keyof typeof question];
                const isCorrect = opt === question.correct_answer;
                let cls = "px-3 py-2 rounded text-sm text-left w-full ";
                if (g2_da_cham_diem && isCorrect) {
                  cls += "bg-green-800 text-green-100 font-bold";
                } else {
                  cls += "bg-[#111] text-muted";
                }
                return (
                  <div key={opt} className={cls}>
                    <span className="font-bold text-white mr-2">{opt}.</span>{text as string}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Philosophy lesson after round done */}
        {g2_done && (
          <div className="bg-surface rounded-xl p-4 space-y-3">
            <p className="text-gold font-bold text-sm uppercase tracking-wider">
              Bài học triết học
            </p>
            <blockquote className="border-l-4 border-gold pl-4 text-white text-sm leading-relaxed">
              {round.round_explanation}
            </blockquote>
          </div>
        )}

        {/* Vote gate controls */}
        {!g2_done && (
          <div className="bg-surface rounded-xl p-4 space-y-3">
            <p className="text-muted text-xs uppercase tracking-wider">Cổng bình chọn</p>
            {!g2_cho_phep_vote ? (
              <button
                onClick={() => emit("host:open_vote")}
                disabled={g2_da_cham_diem}
                className="w-full py-3 rounded bg-green-700 text-white font-bold text-sm
                           hover:bg-green-600 transition-colors disabled:opacity-40"
              >
                🟢 MỞ CỔNG BÌNH CHỌN
              </button>
            ) : (
              <div className="space-y-2">
                <CountdownTimer
                  initialSeconds={g2_timer_seconds ?? 10}
                  running={g2_cho_phep_vote}
                  onComplete={() => emit("host:close_vote")}
                />
                <button
                  onClick={() => emit("host:close_vote")}
                  className="w-full py-2 rounded bg-red-800 text-white font-bold text-sm
                             hover:bg-red-700 transition-colors"
                >
                  🔴 KHÓA CỔNG BÌNH CHỌN
                </button>
              </div>
            )}

            {/* Manual vote input panel */}
            {g2_cho_phep_vote && !g2_da_cham_diem && (
              <div className="pt-1">
                <p className="text-muted text-xs mb-2">Nhập câu trả lời:</p>
                <ManualVotePanel state={state} />
              </div>
            )}

            {/* Vote status */}
            <div className="pt-1">
              <p className="text-muted text-xs mb-2">Trạng thái nhóm:</p>
              <VoteStatusGrid state={state} />
            </div>
          </div>
        )}

        {/* Score actions */}
        <div className="space-y-2">
          {!g2_done && !g2_cho_phep_vote && !g2_da_cham_diem && (
            <button
              onClick={() => emit("host:score")}
              className="w-full py-3 rounded-xl bg-blue-700 text-white font-black text-sm
                         hover:bg-blue-600 transition-colors"
            >
              💥 TÍNH ĐIỂM &amp; LẬT MẢNH
            </button>
          )}
          {g2_da_cham_diem && !g2_done && (
            <button
              onClick={() => emit("host:next_q")}
              className="w-full py-3 rounded-xl bg-[#2a2a2a] text-white font-bold text-sm
                         hover:bg-[#3a3a3a] transition-colors"
            >
              ➡️ CÂU HỎI TIẾP THEO
            </button>
          )}
          {g2_done && (
            <button
              onClick={() => emit("host:next_round")}
              className="w-full py-3 rounded-xl bg-gold text-black font-black text-sm
                         hover:opacity-90 transition-opacity"
            >
              ➡️ SANG TRANH TIẾP THEO
            </button>
          )}
        </div>
      </div>

      {/* Right: image */}
      <div className="w-96 shrink-0 border-l border-[#2a2a2a] p-4 flex flex-col gap-4">
        <ImageSliceReveal
          imgSrc={`/images/${round.image_file}`}
          revealedSlices={g2_revealed_slices}
          isFullyRevealed={isFullyRevealed}
        />
        <Scoreboard scores={scores} />
      </div>
    </div>
  );
}
