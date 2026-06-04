import { GameState, TEAMS, Team } from "../types/shared";
import { G2_DATA } from "./game-data";

// +10 for row buzz correct, +30 for keyword buzz correct
export function scoreCorrectBuzz(state: GameState): GameState {
  if (!state.g1_buzz_winner) return state;
  const pts = state.g1_buzz_type === "keyword" ? 30 : 10;
  return {
    ...state,
    scores: {
      ...state.scores,
      [state.g1_buzz_winner]: state.scores[state.g1_buzz_winner] + pts,
    },
  };
}

// +20 for each team that voted the correct answer; reveals corresponding slice
export function scoreVotes(state: GameState): GameState {
  if (state.g2_da_cham_diem) return state;

  const round = G2_DATA[state.g2_round];
  if (!round) return state;
  const question = round.cau_hoi[state.g2_question];
  if (!question) return state;

  const correctAnswer = question.correct_answer;
  const newScores = { ...state.scores };

  for (const team of TEAMS) {
    if (state.votes[team as Team] === correctAnswer) {
      newScores[team as Team] += 20;
    }
  }

  // Reveal the slice corresponding to this question index
  const newSlices = state.g2_revealed_slices.includes(state.g2_question)
    ? state.g2_revealed_slices
    : [...state.g2_revealed_slices, state.g2_question];

  return {
    ...state,
    scores: newScores,
    g2_revealed_slices: newSlices,
    g2_da_cham_diem: true,
  };
}
