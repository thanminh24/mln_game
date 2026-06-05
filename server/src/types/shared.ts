// Mirror of client/src/types/shared.ts — keep in sync

export interface GameState {
  openedRows: number[];
  activeRow: number | null;
  wrongOptionIds: string[];
  answerRevealed: boolean;
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
