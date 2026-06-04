import styles from "./crossword-grid.module.css";
import { GameState } from "../types/shared";
import { G1_DATA } from "../data/game-data";

const TOTAL_COLS = 35;
const KEYWORD_COL = 12;

interface Props {
  state: GameState;
}

export function CrosswordGrid({ state }: Props) {
  const { g1_opened, g1_keyword_solved } = state;

  return (
    <div className="relative w-full">
      {/* 35-column CSS Grid */}
      <div
        className="grid gap-[2px] w-full"
        style={{ gridTemplateColumns: `repeat(${TOTAL_COLS}, 1fr)` }}
      >
        {G1_DATA.map((row, rowIdx) => {
          const revealed = g1_opened.includes(rowIdx);
          return Array.from({ length: TOTAL_COLS }, (_, col) => {
            const inBounds =
              col >= row.col_offset && col < row.col_offset + row.word_length;
            const isKeywordCol = col === KEYWORD_COL;
            const letter =
              inBounds && revealed
                ? row.word_ascii[col - row.col_offset]
                : "";
            const staggerDelay = inBounds
              ? `${(col - row.col_offset) * 50}ms`
              : "0ms";

            if (!inBounds) {
              // Transparent filler cell — keeps grid alignment
              return (
                <div
                  key={`${rowIdx}-${col}`}
                  className="aspect-square max-w-[26px]"
                />
              );
            }

            let cellBg = "bg-surface border border-[#3a3a3a]";
            if (revealed) {
              cellBg = isKeywordCol
                ? "bg-keyword border border-red-700"
                : "bg-blue-500 border border-blue-400";
            }

            return (
              <div
                key={`${rowIdx}-${col}`}
                className={[
                  "aspect-square max-w-[26px] flex items-center justify-center",
                  "font-mono text-[11px] font-bold text-white select-none",
                  cellBg,
                  revealed ? styles["cell-revealed"] : "",
                  g1_keyword_solved && isKeywordCol
                    ? styles["cell-keyword-flash"]
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={
                  revealed
                    ? ({ "--stagger-delay": staggerDelay } as React.CSSProperties)
                    : undefined
                }
              >
                {letter}
              </div>
            );
          });
        })}
      </div>

      {/* Keyword solved overlay banner */}
      {g1_keyword_solved && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/70 rounded-xl px-8 py-4 text-center backdrop-blur-sm">
            <p className="text-game-lg font-black text-gold tracking-widest">
              🎉 TỪ KHÓA: YÊU NƯỚC
            </p>
            <p className="text-muted text-sm mt-1">
              Hãy chuyển sang Phần 2 để tiếp tục!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
