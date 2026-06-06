import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GameState } from "../types/shared";
import { useSocket } from "../hooks/use-socket";
import { CROSSWORD_ROWS } from "../data/game-data";
import { CrosswordGrid } from "./crossword-grid";

const OPTION_LABELS = ["A", "B", "C", "D"];
const KEYWORD_BONUS = 60;
const DIFFICULTY_LABELS = {
  easy: "Dễ",
  medium: "Vừa",
  hard: "Khó",
};

interface Props {
  state: GameState;
}

export function CrosswordGamePanel({ state }: Props) {
  const { emit } = useSocket();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRowIdx, setModalRowIdx] = useState<number | null>(null);
  const { openedRows, activeRow, wrongOptionIds, wrongTeamIds, answerRevealed, keywordSolved, teams, activeTeamId, maxScore } = state;
  const currentRow = modalRowIdx !== null ? CROSSWORD_ROWS[modalRowIdx] : null;
  const activeTeam = activeTeamId === null
    ? null
    : teams.find((team) => team.id === activeTeamId) ?? null;
  const modalRowIsActive = modalRowIdx !== null && activeRow === modalRowIdx;
  const modalRowIsOpened = modalRowIdx !== null && openedRows.includes(modalRowIdx);
  const modalAnswerRevealed = modalRowIsOpened || (modalRowIsActive && answerRevealed);
  const modalWrongOptionIds = modalRowIsActive ? wrongOptionIds : [];
  const activeTeamFailedCurrentRow = activeTeamId !== null && modalRowIsActive && wrongTeamIds.includes(activeTeamId);
  const canAnswerCurrentRow = modalRowIsActive && activeTeamId !== null && !activeTeamFailedCurrentRow;
  const teamsLeft = Math.max(teams.length - wrongTeamIds.length, 0);
  const revealedByAttempts = answerRevealed && wrongTeamIds.length >= teams.length;
  const progressPct = (openedRows.length / CROSSWORD_ROWS.length) * 100;
  const allRowsOpened = openedRows.length === CROSSWORD_ROWS.length;

  useEffect(() => {
    if (allRowsOpened) setModalOpen(false);
  }, [allRowsOpened]);

  function handleReset() {
    if (window.confirm("Đặt lại toàn bộ trò chơi? Mọi điểm số sẽ bị xoá.")) {
      setModalOpen(false);
      setModalRowIdx(null);
      emit("game:reset");
    }
  }

  function openRowQuestion(idx: number) {
    if (allRowsOpened) return;
    setModalRowIdx(idx);
    if (!openedRows.includes(idx)) {
      emit("game:select_row", { idx });
    }
    setModalOpen(true);
  }

  return (
    <main className="min-h-dvh bg-black text-white font-vietnamese">
      <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2 xl:px-6">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
            MLN111 · Triết học Mác - Lênin
          </p>
          <h1 className="truncate text-lg font-black leading-tight xl:text-xl">
            Ô chữ: Quan hệ tồn tại xã hội và ý thức xã hội
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {allRowsOpened && (
            <Link
              to="/summary"
              className="min-h-11 rounded-md border border-yellow-dim bg-[#1A1600] px-4 py-2 text-sm font-bold text-yellow hover:bg-yellow hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow"
            >
              Tổng kết
            </Link>
          )}
          <button
            id="host-reset-btn"
            onClick={handleReset}
            className="min-h-11 rounded-md border border-wrong-dim px-4 py-2 text-sm font-bold text-red-200 hover:bg-wrong-dim/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow"
          >
            Đặt lại
          </button>
        </div>
      </header>

      <section className="flex min-w-0 flex-col gap-4 p-4 xl:p-6">
        <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
          <div className="grid gap-2 md:grid-cols-5">
            {teams.map((team) => {
              const selected = team.id === activeTeamId;
              const teamFailedCurrentRow =
                activeRow !== null && !answerRevealed && wrongTeamIds.includes(team.id);

              return (
                <button
                  key={team.id}
                  onClick={() => emit("game:select_team", { teamId: team.id })}
                  disabled={teamFailedCurrentRow}
                  className={[
                    "min-h-20 rounded-lg border bg-surface p-3 text-left transition-colors",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow",
                    "disabled:cursor-not-allowed disabled:opacity-45",
                    selected ? "border-yellow" : "border-border hover:border-yellow-dim",
                  ].join(" ")}
                  style={{ boxShadow: selected ? `inset 0 0 0 2px ${team.color}` : undefined }}
                >
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: team.color }} />
                    {team.name}
                  </span>
                  <span className="mt-2 block text-3xl font-black leading-none text-white">
                    {team.score}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-lg border border-yellow-dim bg-[#1A1600] px-4 py-3 text-right">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Mốc hàng ngang</p>
            <p className="text-3xl font-black leading-none text-yellow">{maxScore}</p>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
                Bảng ô chữ
              </p>
            </div>
            <div className="w-full max-w-xs">
              <div className="mb-1 flex justify-between text-xs font-bold text-muted">
                <span>{openedRows.length} / {CROSSWORD_ROWS.length} hàng</span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full bg-yellow transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-3 xl:p-4">
            <CrosswordGrid state={state} onSelectRow={openRowQuestion} />
          </div>
        </div>

        {!keywordSolved && (
          <div className="grid gap-2 md:grid-cols-2">
            <button
              onClick={() => emit("game:solve_keyword", { correct: true })}
              disabled={activeTeamId === null}
              className="min-h-12 rounded-md border border-yellow-dim bg-[#1A1600] px-4 py-2 text-lg font-black text-yellow hover:bg-yellow hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow disabled:cursor-not-allowed disabled:opacity-45"
            >
              Hàng dọc đúng +{KEYWORD_BONUS}
            </button>
            <button
              onClick={() => emit("game:solve_keyword", { correct: false })}
              disabled={activeTeamId === null}
              className="min-h-12 rounded-md border border-wrong-dim px-4 py-2 text-lg font-black text-red-200 hover:bg-wrong-dim/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow disabled:cursor-not-allowed disabled:opacity-45"
            >
              Hàng dọc sai 0 điểm
            </button>
          </div>
        )}
      </section>

      {modalOpen && currentRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="question-modal-title"
            className="flex max-h-[92dvh] w-full max-w-7xl flex-col xl:h-[92dvh] rounded-xl border border-border bg-surface shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
                  Hàng {(modalRowIdx ?? 0) + 1} · {currentRow.wordLength} chữ
                </p>
                <h2 id="question-modal-title" className="text-game-sm font-black leading-tight text-white">
                  Câu hỏi trắc nghiệm
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="min-h-11 rounded-md border border-[#333333] px-4 py-2 text-sm font-bold text-white hover:border-yellow hover:text-yellow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow"
              >
                Đóng
              </button>
            </div>

            <div
              className={[
                "grid min-w-0 min-h-0 flex-1 gap-5 overflow-y-auto p-5 xl:p-6",
                currentRow.promptImage
                  ? "xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]"
                  : "grid-cols-1",
              ].join(" ")}
            >
              <div className="flex min-w-0 flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                      {!modalAnswerRevealed && (
                    <span className="rounded-full border border-yellow-dim bg-[#1A1600] px-4 py-2 text-base font-bold text-yellow">
                      Còn {teamsLeft} nhóm
                    </span>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#333333] bg-black px-4 py-2 text-base font-bold text-white">
                      {DIFFICULTY_LABELS[currentRow.difficulty]}
                    </span>
                    <span className="rounded-full border border-yellow-dim bg-[#1A1600] px-4 py-2 text-base font-bold text-yellow">
                      {currentRow.points} điểm
                    </span>
                    <span className="rounded-full border border-[#333333] bg-black px-4 py-2 text-base font-bold text-white">
                      {activeTeam?.name ?? "Chon nhom tra loi"}
                    </span>
                  </div>
                </div>

                <p className="whitespace-normal break-words text-[clamp(2rem,3vw,3.25rem)] font-black leading-tight text-white">
                  {currentRow.questionText}
                </p>

                {!modalAnswerRevealed && modalRowIsActive && activeTeamId === null && (
                  <div className="rounded-lg border border-yellow-dim bg-[#1A1600] p-4 text-base font-bold text-yellow">
                    Chon nhom da gianh quyen tra loi truoc khi bam dap an.
                  </div>
                )}

                {!modalAnswerRevealed && activeTeamFailedCurrentRow && (
                  <div className="rounded-lg border border-wrong-dim bg-[#1C0606] p-4 text-base font-bold text-red-200">
                    {activeTeam?.name} đã trả lời sai hàng này. Hãy chọn nhóm khác để giành quyền trả lời.
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {currentRow.options.map((option, optionIdx) => {
                    const isCorrect = modalAnswerRevealed && option.id === currentRow.correctOptionId;
                    const isWrong = modalWrongOptionIds.includes(option.id);
                    const stateClass = isCorrect
                      ? "border-correct bg-correct-dim/70 text-white"
                      : isWrong
                        ? "border-wrong-dim bg-[#1C0606] text-red-200 line-through"
                        : "border-[#333333] bg-black text-white hover:border-yellow hover:bg-[#1A1600]";

                    return (
                      <button
                        key={option.id}
                        aria-label={`Đáp án ${OPTION_LABELS[optionIdx] ?? option.id}: ${option.text}`}
                        onClick={() => {
                          if (modalRowIsActive) {
                            emit("game:choose_option", { optionId: option.id });
                          }
                        }}
                        disabled={modalAnswerRevealed || isWrong || !canAnswerCurrentRow}
                        className={[
                          "min-h-24 rounded-lg border p-5 text-left transition-colors",
                          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow",
                          "disabled:cursor-not-allowed disabled:opacity-70",
                          stateClass,
                        ].join(" ")}
                      >
                        <span className="mb-3 block text-sm font-black uppercase tracking-[0.16em] text-muted">
                          {OPTION_LABELS[optionIdx] ?? option.id}
                        </span>
                        <span className="block whitespace-normal break-words text-[clamp(1.35rem,2vw,2.15rem)] font-black leading-snug">
                          {option.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {currentRow.promptImage && (
                <div className="min-w-0">
                  <div className="aspect-video overflow-hidden rounded-lg border border-[#333333] bg-black">
                    <img
                      src={currentRow.promptImage}
                      alt={`Gợi ý hình ảnh cho hàng ${(modalRowIdx ?? 0) + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              )}

              {modalAnswerRevealed && (
                <div
                  aria-live="polite"
                  className={[
                    "rounded-lg border border-yellow/40 bg-yellow/10 p-5",
                    currentRow.promptImage ? "xl:col-span-2" : "",
                  ].join(" ")}
                >
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-yellow">
                    {revealedByAttempts && modalRowIsActive ? "Tất cả nhóm đã sai" : "Đáp án"}
                  </p>
                  <p className="mt-1 break-words text-game-sm font-black text-white">
                    Đáp án: {currentRow.answerText}
                  </p>
                  <p className="mt-2 whitespace-normal break-words text-xl font-bold leading-relaxed text-muted">
                    {currentRow.explanation}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
