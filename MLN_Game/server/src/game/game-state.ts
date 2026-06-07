import { GameState, TeamScore } from "../types/shared";
import { CROSSWORD_ROWS } from "./game-data";

export const DEFAULT_TEAMS: TeamScore[] = [
  { id: "group-1", name: "Nhóm 1", color: "#ef4444", score: 0 },
  { id: "group-2", name: "Nhóm 2", color: "#3b82f6", score: 0 },
  { id: "group-3", name: "Nhóm 3", color: "#facc15", score: 0 },
  { id: "group-4", name: "Nhóm 4", color: "#22c55e", score: 0 },
  { id: "group-6", name: "Nhóm 6", color: "#a855f7", score: 0 },
];

export const MAX_SCORE = CROSSWORD_ROWS.reduce((total, row) => total + row.points, 0);

export function initialState(): GameState {
  return {
    openedRows: [],
    activeRow: null,
    wrongOptionIds: [],
    wrongTeamIds: [],
    answerRevealed: false,
    keywordSolved: false,
    score: 0,
    teams: DEFAULT_TEAMS.map((team) => ({ ...team })),
    activeTeamId: DEFAULT_TEAMS[0].id,
    maxScore: MAX_SCORE,
  };
}
