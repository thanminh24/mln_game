import { GameState } from "../types/shared";
import { initialState } from "./game-state";
import { CROSSWORD_ROWS } from "./game-data";

const KEYWORD_BONUS = 60;
const MAX_WRONG_ATTEMPTS = 3;

function openRow(state: GameState, rowIdx: number): number[] {
  return state.openedRows.includes(rowIdx)
    ? state.openedRows
    : [...state.openedRows, rowIdx];
}

function scoreActiveTeam(state: GameState, delta: number): GameState {
  return scoreTeam(state, state.activeTeamId, delta);
}

function scoreTeam(state: GameState, teamId: string, delta: number): GameState {
  const teams = state.teams.map((team) =>
    team.id === teamId
      ? { ...team, score: Math.max(0, team.score + delta) }
      : team
  );
  const activeTeam = teams.find((team) => team.id === state.activeTeamId);

  return {
    ...state,
    teams,
    score: activeTeam?.score ?? state.score,
  };
}

export function selectQuestion(state: GameState, idx: number): GameState {
  if (!CROSSWORD_ROWS[idx] || state.openedRows.includes(idx)) {
    return state;
  }

  return {
    ...state,
    activeRow: idx,
    wrongOptionIds: [],
    wrongTeamIds: [],
    answerRevealed: false,
  };
}

export function chooseAnswer(state: GameState, optionId: string): GameState {
  if (
    state.activeRow === null ||
    state.answerRevealed
  ) {
    return state;
  }

  if (state.wrongTeamIds.includes(state.activeTeamId)) {
    return state;
  }

  const row = CROSSWORD_ROWS[state.activeRow];
  if (!row || !row.options.some((option) => option.id === optionId)) {
    return state;
  }

  if (state.wrongOptionIds.includes(optionId)) {
    return state;
  }

  if (optionId === row.correctOptionId) {
    const nextState = {
      ...state,
      openedRows: openRow(state, state.activeRow),
      answerRevealed: true,
    };

    return scoreActiveTeam(nextState, row.points);
  }

  const wrongAnswers = state.wrongOptionIds.includes(optionId)
    ? state.wrongOptionIds
    : [...state.wrongOptionIds, optionId];
  const wrongTeams = state.wrongTeamIds.includes(state.activeTeamId)
    ? state.wrongTeamIds
    : [...state.wrongTeamIds, state.activeTeamId];
  const shouldReveal = wrongAnswers.length >= MAX_WRONG_ATTEMPTS;

  return {
    ...state,
    wrongOptionIds: wrongAnswers,
    wrongTeamIds: wrongTeams,
    answerRevealed: shouldReveal,
    openedRows: shouldReveal
      ? openRow(state, state.activeRow)
      : state.openedRows,
  };
}

export function solveKeyword(state: GameState, correct = true, teamId = state.activeTeamId): GameState {
  if (state.keywordSolved) return state;

  if (!correct) {
    return state;
  }

  if (!state.teams.some((team) => team.id === teamId)) {
    return state;
  }

  return scoreTeam({
    ...state,
    activeTeamId: teamId,
    keywordSolved: true,
  }, teamId, KEYWORD_BONUS);
}

export function selectTeam(state: GameState, teamId: string): GameState {
  const activeTeam = state.teams.find((team) => team.id === teamId);
  if (!activeTeam) return state;

  return {
    ...state,
    activeTeamId: teamId,
    score: activeTeam.score,
  };
}

export function resetGame(): GameState {
  return initialState();
}
