import { GameState } from "../types/shared";
import { initialState } from "./game-state";
import { CROSSWORD_ROWS } from "./game-data";

const MAX_WRONG_ATTEMPTS = 3;
const ROW_POINTS = 10;
const KEYWORD_POINTS = 30;

function openRow(state: GameState, rowIdx: number): number[] {
  return state.openedRows.includes(rowIdx)
    ? state.openedRows
    : [...state.openedRows, rowIdx];
}

export function selectQuestion(state: GameState, idx: number): GameState {
  if (!CROSSWORD_ROWS[idx] || state.openedRows.includes(idx) || state.keywordSolved) {
    return state;
  }

  return {
    ...state,
    activeRow: idx,
    wrongOptionIds: [],
    answerRevealed: false,
  };
}

export function chooseAnswer(state: GameState, optionId: string): GameState {
  if (
    state.activeRow === null ||
    state.answerRevealed ||
    state.keywordSolved
  ) {
    return state;
  }

  const row = CROSSWORD_ROWS[state.activeRow];
  if (!row || !row.options.some((option) => option.id === optionId)) {
    return state;
  }

  if (optionId === row.correctOptionId) {
    return {
      ...state,
      openedRows: openRow(state, state.activeRow),
      answerRevealed: true,
      score: state.score + ROW_POINTS,
    };
  }

  if (state.wrongOptionIds.includes(optionId)) {
    return state;
  }

  const wrongAnswers = [...state.wrongOptionIds, optionId];
  const shouldReveal = wrongAnswers.length >= MAX_WRONG_ATTEMPTS;

  return {
    ...state,
    wrongOptionIds: wrongAnswers,
    answerRevealed: shouldReveal,
    openedRows: shouldReveal
      ? openRow(state, state.activeRow)
      : state.openedRows,
  };
}

export function solveKeyword(state: GameState): GameState {
  if (state.keywordSolved) return state;

  return {
    ...state,
    openedRows: CROSSWORD_ROWS.map((_, i) => i),
    keywordSolved: true,
    answerRevealed: true,
    score: state.score + KEYWORD_POINTS,
  };
}

export function resetGame(): GameState {
  return initialState();
}
