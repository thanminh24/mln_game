export interface GameState {
  openedRows: number[]; // revealed row indices
  activeRow: number | null; // active question index
  wrongOptionIds: string[]; // option ids already tried for current row
  answerRevealed: boolean; // true after correct choice or 3 wrong attempts
  keywordSolved: boolean;
  score: number;
}

export interface ServerToClientEvents {
  "game:state": (state: GameState) => void;
}

export interface ClientToServerEvents {
  "game:reset": () => void;
  "game:select_row": (payload: { idx: number }) => void;
  "game:choose_option": (payload: { optionId: string }) => void;
  "game:solve_keyword": () => void;
  "game:request_state": () => void;
}
