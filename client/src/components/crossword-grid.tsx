import type { CSSProperties } from "react";
import styles from "./crossword-grid.module.css";
import { GameState } from "../types/shared";
import { CROSSWORD_ROWS, KEYWORD, KEYWORD_ASCII } from "../data/game-data";

const TOTAL_COLS = 30;
const KEYWORD_COL = 12;
const DIFFICULTY_LABELS = {
  easy: "Dễ",
  medium: "Vừa",
  hard: "Khó",
};

interface Props {
  state: GameState;
  onSelectRow?: (idx: number) => void;
}

export function CrosswordGrid({ state, onSelectRow }: Props) {
  const { openedRows, keywordSolved } = state;
  const allRowsOpened = openedRows.length === CROSSWORD_ROWS.length;

  return (
    <div className="relative w-full min-w-0">
      <div className="flex flex-col gap-[3px]">
        {CROSSWORD_ROWS.map((row, rowIdx) => {
          const revealed = openedRows.includes(rowIdx);
          const canSelect = Boolean(onSelectRow) && !allRowsOpened;

          return (
            <div
              key={row.answerAscii}
              role={canSelect ? "button" : undefined}
              tabIndex={canSelect ? 0 : undefined}
              aria-label={canSelect ? `Mở câu hỏi hàng ${rowIdx + 1}` : undefined}
              onClick={canSelect ? () => onSelectRow?.(rowIdx) : undefined}
              onKeyDown={
                canSelect
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectRow?.(rowIdx);
                      }
                    }
                  : undefined
              }
              className={[
                "flex min-w-0 items-center gap-2 rounded-md",
                canSelect
                  ? "cursor-pointer transition-colors hover:bg-yellow/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow"
                  : "",
              ].join(" ")}
            >
              <div className="w-6 shrink-0 text-right text-[10px] font-bold text-[#555555]">
                {rowIdx + 1}
              </div>
              <div className="hidden w-20 shrink-0 text-xs font-black text-muted sm:block">
                {DIFFICULTY_LABELS[row.difficulty]} · {row.points}
              </div>
              <div
                className="grid min-w-0 flex-1 gap-[3px]"
                style={{ gridTemplateColumns: `repeat(${TOTAL_COLS}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: TOTAL_COLS }, (_, col) => {
                  const inBounds =
                    col >= row.colOffset && col < row.colOffset + row.wordLength;
                  const isKeywordCol = col === KEYWORD_COL;

                  if (!inBounds) {
                    return (
                      <div
                        key={`${rowIdx}-${col}`}
                        className="aspect-square min-w-0"
                        aria-hidden="true"
                      />
                    );
                  }

                  const keywordRevealed = keywordSolved && isKeywordCol;
                  const letter = revealed || keywordRevealed ? row.answerAscii[col - row.colOffset] : "";
                  const staggerDelay = `${(col - row.colOffset) * 35}ms`;
                  const cellState = revealed
                    ? isKeywordCol
                      ? "border-2 border-yellow bg-white text-black"
                      : "border border-yellow-dim bg-yellow text-black"
                    : keywordRevealed
                      ? "border-2 border-yellow bg-yellow text-black"
                    : isKeywordCol
                      ? "border border-yellow bg-surface text-white"
                      : "border border-[#333333] bg-surface text-white";

                  return (
                    <div
                      key={`${rowIdx}-${col}`}
                      className={[
                        "aspect-square min-w-0 rounded-[2px]",
                        "flex items-center justify-center select-none",
                        "font-mono text-[clamp(0.65rem,1.6vw,1.25rem)] font-black leading-none",
                        cellState,
                        revealed ? styles["cell-revealed"] : "",
                        !revealed && isKeywordCol ? styles["cell-keyword-pulse"] : "",
                        keywordSolved && isKeywordCol ? styles["cell-keyword-flash"] : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={{ "--stagger-delay": staggerDelay } as CSSProperties}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {keywordSolved && allRowsOpened && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-w-full rounded-lg border border-yellow bg-black px-6 py-4 text-center shadow-2xl">
            <p className="break-words text-game-md font-black leading-tight text-yellow">
              TỪ KHÓA: {KEYWORD}
            </p>
            <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-muted">
              {KEYWORD_ASCII}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
