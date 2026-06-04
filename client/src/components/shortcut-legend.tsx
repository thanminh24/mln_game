import { useState } from "react";
import { GameState } from "../types/shared";

interface Props {
  state: GameState;
}

export function ShortcutLegend({ state }: Props) {
  const [visible, setVisible] = useState(false);

  const shortcuts = [
    {
      key: "F1",
      label: state.mode === "game1" ? "Mở chuông" : "Mở cổng vote",
      active:
        state.mode === "game1"
          ? state.g1_current_q !== null && !state.g1_buzz_active && !state.g1_buzz_winner
          : !state.g2_cho_phep_vote && !state.g2_da_cham_diem && !state.g2_done,
    },
    {
      key: "F2",
      label: "Đúng",
      active: !!state.g1_buzz_winner,
    },
    {
      key: "F3",
      label: state.g1_buzz_winner ? "Sai" : state.g2_cho_phep_vote ? "Đóng cổng" : "Đóng chuông",
      active: !!state.g1_buzz_winner || state.g1_buzz_active || state.g2_cho_phep_vote,
    },
    {
      key: "F4",
      label: "Tính điểm",
      active:
        state.mode === "game2" &&
        !state.g2_cho_phep_vote &&
        !state.g2_da_cham_diem &&
        !state.g2_done,
    },
    { key: "Esc", label: "Focus Reset", active: true },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {visible && (
        <div className="mb-2 bg-black/80 border border-[#3a3a3a] rounded-xl p-3 space-y-1 text-xs backdrop-blur-sm">
          {shortcuts.map(({ key, label, active }) => (
            <div key={key} className={`flex gap-2 ${active ? "text-white" : "text-[#555]"}`}>
              <span className="bg-[#2a2a2a] px-1.5 py-0.5 rounded font-mono">{key}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => setVisible((v) => !v)}
        className="w-8 h-8 rounded-full bg-[#2a2a2a] text-muted text-sm hover:bg-[#3a3a3a]
                   hover:text-white transition-colors flex items-center justify-center"
        title="Phím tắt"
      >
        ?
      </button>
    </div>
  );
}
