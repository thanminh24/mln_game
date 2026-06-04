import { GameState, Team, TEAMS } from "../types/shared";
import { initialState } from "./game-state";
import { scoreCorrectBuzz, scoreVotes as _scoreVotes } from "./scorer";
import { tryAcquire, reset as resetLock } from "./buzz-lock";

const TOTAL_ROWS = 7;
const TOTAL_SLICES = 5;
const MAX_G2_ROUNDS = 2; // matches G2_DATA.length
const BUZZ_TIMER_SECONDS = 15;
const VOTE_TIMER_SECONDS = 10;

function clearBuzz(state: GameState): GameState {
  return {
    ...state,
    g1_buzz_active: false,
    g1_buzz_winner: null,
    g1_buzz_type: null,
    g1_timer_seconds: null,
  };
}

function clearVotes(state: GameState): GameState {
  const votes = Object.fromEntries(TEAMS.map((t) => [t, null])) as Record<Team, string | null>;
  return { ...state, votes };
}

export function selectQuestion(state: GameState, idx: number): GameState {
  resetLock();
  return {
    ...clearBuzz(state),
    g1_current_q: idx,
  };
}

export function openBuzz(state: GameState): GameState {
  resetLock();
  return {
    ...state,
    g1_buzz_active: true,
    g1_buzz_winner: null,
    g1_buzz_type: null,
    g1_timer_seconds: BUZZ_TIMER_SECONDS,
  };
}

export function closeBuzz(state: GameState): GameState {
  resetLock();
  // g1_buzz_winner intentionally preserved so judge panel stays visible
  return { ...state, g1_buzz_active: false, g1_buzz_type: null, g1_timer_seconds: null };
}

// First-wins: lock stays acquired until host reopens buzz (openBuzz/selectQuestion/markWrong call resetLock)
export function buzzIn(
  state: GameState,
  team: Team,
  type: "row" | "keyword"
): GameState {
  if (!state.g1_buzz_active) return state;
  if (!tryAcquire()) return state; // another team already acquired — this team loses
  return {
    ...state,
    g1_buzz_active: false,
    g1_buzz_winner: team,
    g1_buzz_type: type,
    g1_timer_seconds: null,
  };
}

export function markCorrect(state: GameState): GameState {
  const scored = scoreCorrectBuzz(state);
  if (state.g1_buzz_type === "keyword") {
    // Reveal all rows and mark keyword solved
    const allRows = Array.from({ length: TOTAL_ROWS }, (_, i) => i);
    return {
      ...clearBuzz(scored),
      g1_opened: allRows,
      g1_keyword_solved: true,
      g1_current_q: null,
    };
  }
  // Row buzz: reveal the current row
  const rowIdx = state.g1_current_q;
  const newOpened =
    rowIdx !== null && !scored.g1_opened.includes(rowIdx)
      ? [...scored.g1_opened, rowIdx]
      : scored.g1_opened;
  return {
    ...clearBuzz(scored),
    g1_opened: newOpened,
    g1_current_q: null,
  };
}

export function markWrong(state: GameState): GameState {
  if (state.g1_buzz_type === "row") {
    // Reopen buzz for row type — other teams can try
    resetLock();
    return {
      ...state,
      g1_buzz_active: true,
      g1_buzz_winner: null,
      g1_buzz_type: null,
      g1_timer_seconds: BUZZ_TIMER_SECONDS,
    };
  }
  // Keyword type wrong — just clear winner
  resetLock();
  return {
    ...state,
    g1_buzz_active: false,
    g1_buzz_winner: null,
    g1_buzz_type: null,
    g1_timer_seconds: null,
  };
}

export function openVote(state: GameState): GameState {
  return {
    ...clearVotes(state),
    g2_cho_phep_vote: true,
    g2_da_cham_diem: false,
    g2_timer_seconds: VOTE_TIMER_SECONDS,
  };
}

export function closeVote(state: GameState): GameState {
  return {
    ...state,
    g2_cho_phep_vote: false,
    g2_timer_seconds: null,
  };
}

export function recordVote(state: GameState, team: Team, answer: string): GameState {
  if (!state.g2_cho_phep_vote) return state;
  return {
    ...state,
    votes: { ...state.votes, [team]: answer },
  };
}

// Alias for host manual vote entry (Phase 3)
export const setVote = recordVote;

export function scoreVotes(state: GameState): GameState {
  return _scoreVotes(state);
}

export function advanceQuestion(state: GameState): GameState {
  const nextQ = state.g2_question + 1;
  const isDone = nextQ >= TOTAL_SLICES;
  return {
    ...clearVotes(state),
    g2_question: isDone ? state.g2_question : nextQ,
    g2_done: isDone,
    g2_cho_phep_vote: false,
    g2_da_cham_diem: false,
    g2_timer_seconds: null,
  };
}

export function advanceRound(state: GameState): GameState {
  if (state.g2_round >= MAX_G2_ROUNDS - 1) return state; // already on last round
  const votes = Object.fromEntries(TEAMS.map((t) => [t, null])) as Record<Team, string | null>;
  return {
    ...state,
    g2_round: state.g2_round + 1,
    g2_question: 0,
    g2_revealed_slices: [],
    g2_done: false,
    g2_cho_phep_vote: false,
    g2_da_cham_diem: false,
    g2_timer_seconds: null,
    votes,
  };
}

export function earlyReveal(state: GameState): GameState {
  const allSlices = Array.from({ length: TOTAL_SLICES }, (_, i) => i);
  return {
    ...state,
    g2_revealed_slices: allSlices,
    g2_done: true,
    g2_cho_phep_vote: false,
    g2_timer_seconds: null,
  };
}

export function switchMode(state: GameState, mode: "game1" | "game2"): GameState {
  return { ...clearBuzz(state), mode };
}

export function resetGame(): GameState {
  resetLock();
  return initialState();
}
