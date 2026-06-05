import { useEffect, useState } from "react";
import { GameState } from "../types/shared";
import { useSocket } from "../hooks/use-socket";
import { CROSSWORD_ROWS } from "../data/game-data";
import { CrosswordGrid } from "./crossword-grid";

const MAX_WRONG_ATTEMPTS = 3;
const OPTION_LABELS = ["A", "B", "C", "D"];

interface Props {
  state: GameState;
}

export function CrosswordGamePanel({ state }: Props) {
  const { emit } = useSocket();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRowIdx, setModalRowIdx] = useState<number | null>(null);
  const { openedRows, activeRow, wrongOptionIds, answerRevealed, keywordSolved } = state;
  const currentRow = modalRowIdx !== null ? CROSSWORD_ROWS[modalRowIdx] : null;
  const modalRowIsActive = modalRowIdx !== null && activeRow === modalRowIdx;
  const modalRowIsOpened = modalRowIdx !== null && openedRows.includes(modalRowIdx);
  const modalAnswerRevealed = modalRowIsOpened || (modalRowIsActive && answerRevealed);
  const modalWrongOptionIds = modalRowIsActive ? wrongOptionIds : [];
  const attemptsLeft = Math.max(MAX_WRONG_ATTEMPTS - wrongOptionIds.length, 0);
  const revealedByAttempts = answerRevealed && wrongOptionIds.length >= MAX_WRONG_ATTEMPTS;
  const progressPct = (openedRows.length / CROSSWORD_ROWS.length) * 100;

  useEffect(() => {
    if (keywordSolved) setModalOpen(false);
  }, [keywordSolved]);

  function handleReset() {
    if (window.confirm("Đặt lại toàn bộ trò chơi? Mọi điểm số sẽ bị xoá.")) {
      setModalOpen(false);
      setModalRowIdx(null);
      emit("game:reset");
    }
  }

  function openRowQuestion(idx: number) {
    if (keywordSolved) return;
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
          <button
            onClick={() => emit("game:solve_keyword")}
            className="min-h-12 rounded-md border border-yellow-dim bg-[#1A1600] px-4 py-2 text-lg font-black text-yellow hover:bg-yellow hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow"
          >
            Hiện đáp án hàng dọc
          </button>
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
                      Còn {attemptsLeft} lượt sai
                    </span>
                  )}
                </div>

                <p className="whitespace-normal break-words text-[clamp(2rem,3vw,3.25rem)] font-black leading-tight text-white">
                  {currentRow.questionText}
                </p>

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
                        disabled={modalAnswerRevealed || isWrong || !modalRowIsActive}
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
                    {revealedByAttempts && modalRowIsActive ? "Đã sai 3 lần" : "Đáp án"}
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
