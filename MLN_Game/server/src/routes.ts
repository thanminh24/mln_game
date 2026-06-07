import { Router } from "express";
import { GameState } from "./types/shared";
import { CASE_STUDY_SUMMARY, CROSSWORD_ROWS, KEYWORD, KEYWORD_ASCII } from "./game/game-data";

export function createRouter(getState: () => GameState) {
  const router = Router();

  router.get("/api/state", (_req, res) => {
    res.json(getState());
  });

  router.get("/api/data", (_req, res) => {
    res.json({
      rows: CROSSWORD_ROWS,
      keyword: KEYWORD,
      keywordAscii: KEYWORD_ASCII,
      caseStudySummary: CASE_STUDY_SUMMARY,
    });
  });

  return router;
}
