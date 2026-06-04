export const TEAMS = ["Nhóm 1", "Nhóm 2", "Nhóm 3", "Nhóm 4", "Nhóm 6"] as const;
export type Team = (typeof TEAMS)[number];

export interface GameState {
  mode: "game1" | "game2";

  // Game 1 — Crossword
  g1_opened: number[]; // revealed row indices
  g1_current_q: number | null; // active question index
  g1_buzz_active: boolean;
  g1_buzz_winner: Team | null;
  g1_buzz_type: "row" | "keyword" | null;
  g1_keyword_solved: boolean;
  g1_timer_seconds: number | null; // null = no timer running

  // Game 2 — Image Reveal
  g2_round: number; // 0 or 1
  g2_question: number; // 0–4 within round
  g2_revealed_slices: number[]; // slice indices revealed
  g2_done: boolean; // round complete flag
  g2_cho_phep_vote: boolean; // voting gate open
  g2_da_cham_diem: boolean; // scored for current question
  g2_timer_seconds: number | null;

  // Shared
  scores: Record<Team, number>;
  votes: Record<Team, string | null>;
}

export interface ServerToClientEvents {
  "state:update": (state: GameState) => void;
}

export interface ClientToServerEvents {
  "host:switch_mode": (payload: { mode: "game1" | "game2" }) => void;
  "host:reset": () => void;
  "host:select_q": (payload: { idx: number }) => void;
  "host:open_buzz": () => void;
  "host:close_buzz": () => void;
  "host:correct": () => void;
  "host:wrong": () => void;
  "host:open_vote": () => void;
  "host:close_vote": () => void;
  "host:score": () => void;
  "host:next_q": () => void;
  "host:next_round": () => void;
  "host:early_reveal": () => void;
  "host:set_vote": (payload: { team: Team; answer: string }) => void;
  "player:join": (payload: { team: Team }) => void;
  "player:buzz": (payload: { team: Team; type: "row" | "keyword" }) => void;
  "player:vote": (payload: { team: Team; answer: string }) => void;
  "client:request_state": () => void;
}
