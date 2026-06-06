import { GameState } from "../types/shared";
import { initialState } from "./game-state";
import { CROSSWORD_ROWS } from "./game-data";

const KEYWORD_BONUS = 60;

function openRow(state: GameState, rowIdx: number): number[] {
  return state.openedRows.includes(rowIdx)
    ? state.openedRows
    : [...state.openedRows, rowIdx];
}

function scoreActiveTeam(state: GameState, delta: number): GameState {
  if (state.activeTeamId === null) {
    return state;
  }

  const teams = state.teams.map((team) =>
    team.id === state.activeTeamId
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
    activeTeamId: null,
    answerRevealed: false,
  };
}

export function chooseAnswer(state: GameState, optionId: string): GameState {
  if (
    state.activeRow === null ||
    state.answerRevealed ||
    state.activeTeamId === null
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
  const activeTeamId = state.activeTeamId;
  const wrongTeams = state.wrongTeamIds.includes(activeTeamId)
    ? state.wrongTeamIds
    : [...state.wrongTeamIds, activeTeamId];
  const shouldReveal = wrongTeams.length >= state.teams.length;

  return {
    ...state,
    wrongOptionIds: wrongAnswers,
    wrongTeamIds: wrongTeams,
    activeTeamId: null,
    answerRevealed: shouldReveal,
    openedRows: shouldReveal
      ? openRow(state, state.activeRow)
      : state.openedRows,
  };
}

export function solveKeyword(state: GameState, correct = true): GameState {
  if (state.keywordSolved || state.activeTeamId === null) return state;

  if (!correct) {
    return {
      ...state,
      activeTeamId: null,
    };
  }

  return scoreActiveTeam({
    ...state,
    keywordSolved: true,
  }, KEYWORD_BONUS);
}

export function selectTeam(state: GameState, teamId: string): GameState {
  const activeTeam = state.teams.find((team) => team.id === teamId);
  if (!activeTeam) return state;
  if (
    state.activeRow !== null &&
    !state.answerRevealed &&
    state.wrongTeamIds.includes(teamId)
  ) {
    return state;
  }

  return {
    ...state,
    activeTeamId: teamId,
    score: activeTeam.score,
  };
}

export function resetGame(): GameState {
  return initialState();
}
