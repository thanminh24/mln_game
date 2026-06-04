import { useEffect } from "react";
import { GameState } from "../types/shared";
import { useSocket } from "./use-socket";

export function useHostKeyboard(state: GameState) {
  const { emit } = useSocket();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Guard: skip during Vietnamese IME composition
      if (e.isComposing || e.keyCode === 229) return;
      // Guard: skip when focused on text inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) return;

      switch (e.code) {
        case "F1":
          e.preventDefault();
          if (state.mode === "game1") {
            if (state.g1_current_q !== null && !state.g1_buzz_active && !state.g1_buzz_winner) {
              emit("host:open_buzz");
            }
          } else {
            if (!state.g2_cho_phep_vote && !state.g2_da_cham_diem && !state.g2_done) {
              emit("host:open_vote");
            }
          }
          break;

        case "F2":
          e.preventDefault();
          if (state.g1_buzz_winner) emit("host:correct");
          break;

        case "F3":
          e.preventDefault();
          if (state.g1_buzz_winner) {
            emit("host:wrong");
          } else if (state.g1_buzz_active) {
            emit("host:close_buzz");
          } else if (state.g2_cho_phep_vote) {
            emit("host:close_vote");
          }
          break;

        case "F4":
          e.preventDefault();
          if (
            state.mode === "game2" &&
            !state.g2_cho_phep_vote &&
            !state.g2_da_cham_diem &&
            !state.g2_done
          ) {
            emit("host:score");
          }
          break;

        case "Escape":
          // Focus reset button — no auto-confirm for safety
          e.preventDefault();
          (document.getElementById("host-reset-btn") as HTMLButtonElement | null)?.focus();
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state, emit]);
}
