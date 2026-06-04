import { Router } from "express";
import { GameState } from "./types/shared";
import { G1_DATA, G2_DATA } from "./game/game-data";

export function createRouter(getState: () => GameState) {
  const router = Router();

  router.get("/api/state", (_req, res) => {
    res.json(getState());
  });

  router.get("/api/data", (_req, res) => {
    res.json({ rows: G1_DATA, rounds: G2_DATA });
  });

  return router;
}
