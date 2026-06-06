// Mirror of client/src/types/shared.ts — keep in sync

export interface TeamScore {
  id: string;
  name: string;
  color: string;
  score: number;
}

export interface GameState {
  openedRows: number[];
  activeRow: number | null;
  wrongOptionIds: string[];
  wrongTeamIds: string[];
  answerRevealed: boolean;
  keywordSolved: boolean;
  score: number;
  teams: TeamScore[];
  activeTeamId: string;
  wager: number;
  usedWagerTeamIds: string[];
  maxScore: number;
}

export interface ServerToClientEvents {
  "game:state": (state: GameState) => void;
}

export interface ClientToServerEvents {
  "game:reset": () => void;
  "game:select_row": (payload: { idx: number }) => void;
  "game:choose_option": (payload: { optionId: string }) => void;
  "game:select_team": (payload: { teamId: string }) => void;
  "game:set_wager": (payload: { wager: number }) => void;
  "game:solve_keyword": (payload?: { correct?: boolean }) => void;
  "game:request_state": () => void;
}
