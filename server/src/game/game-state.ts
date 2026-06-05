import { GameState } from "../types/shared";

export function initialState(): GameState {
  return {
    openedRows: [],
    activeRow: null,
    wrongOptionIds: [],
    answerRevealed: false,
    keywordSolved: false,
    score: 0,
  };
}
