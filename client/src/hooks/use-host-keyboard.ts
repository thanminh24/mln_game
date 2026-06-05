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
        case "Digit1":
        case "Digit2":
        case "Digit3":
        case "Digit4":
          e.preventDefault();
          if (state.activeRow !== null && !state.answerRevealed) {
            emit("game:choose_option", { optionId: e.code.replace("Digit", "") });
          }
          break;

        case "KeyK":
          e.preventDefault();
          if (!state.keywordSolved && state.openedRows.length >= 2) emit("game:solve_keyword");
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
