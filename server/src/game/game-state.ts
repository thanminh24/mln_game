import { GameState, TEAMS } from "../types/shared";

export function initialState(): GameState {
  const scores = Object.fromEntries(TEAMS.map((t) => [t, 0])) as Record<
    (typeof TEAMS)[number],
    number
  >;
  const votes = Object.fromEntries(TEAMS.map((t) => [t, null])) as Record<
    (typeof TEAMS)[number],
    string | null
  >;

  return {
    mode: "game1",

    g1_opened: [],
    g1_current_q: null,
    g1_buzz_active: false,
    g1_buzz_winner: null,
    g1_buzz_type: null,
    g1_keyword_solved: false,
    g1_timer_seconds: null,

    g2_round: 0,
    g2_question: 0,
    g2_revealed_slices: [],
    g2_done: false,
    g2_cho_phep_vote: false,
    g2_da_cham_diem: false,
    g2_timer_seconds: null,

    scores,
    votes,
  };
}
