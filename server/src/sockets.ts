import { Server } from "socket.io";
import { GameState, ServerToClientEvents, ClientToServerEvents, TEAMS, Team } from "./types/shared";
import * as engine from "./game/game-engine";
import { G1_DATA } from "./game/game-data";

const VALID_TEAMS = new Set<string>(TEAMS);
const VALID_ANSWERS = new Set(["A", "B", "C", "D"]);
const G1_MAX_IDX = G1_DATA.length - 1;

function isValidTeam(t: unknown): t is Team {
  return typeof t === "string" && VALID_TEAMS.has(t);
}

export function registerSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  getState: () => GameState,
  setState: (s: GameState) => void
) {
  function broadcast() {
    io.emit("state:update", getState());
  }

  io.on("connection", (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    socket.emit("state:update", getState());

    socket.on("client:request_state", () => {
      socket.emit("state:update", getState());
    });

    socket.on("host:reset", () => {
      setState(engine.resetGame());
      broadcast();
    });

    socket.on("host:switch_mode", ({ mode }) => {
      if (mode !== "game1" && mode !== "game2") return;
      setState(engine.switchMode(getState(), mode));
      broadcast();
    });

    // Game 1
    socket.on("host:select_q", ({ idx }) => {
      if (!Number.isInteger(idx) || idx < 0 || idx > G1_MAX_IDX) return;
      setState(engine.selectQuestion(getState(), idx));
      broadcast();
    });

    socket.on("host:open_buzz", () => {
      setState(engine.openBuzz(getState()));
      broadcast();
    });

    socket.on("host:close_buzz", () => {
      setState(engine.closeBuzz(getState()));
      broadcast();
    });

    socket.on("host:correct", () => {
      if (!getState().g1_buzz_winner) return;
      setState(engine.markCorrect(getState()));
      broadcast();
    });

    socket.on("host:wrong", () => {
      if (!getState().g1_buzz_winner) return;
      setState(engine.markWrong(getState()));
      broadcast();
    });

    // Game 2
    socket.on("host:open_vote", () => {
      setState(engine.openVote(getState()));
      broadcast();
    });

    socket.on("host:close_vote", () => {
      setState(engine.closeVote(getState()));
      broadcast();
    });

    socket.on("host:set_vote", ({ team, answer }) => {
      if (!isValidTeam(team) || !VALID_ANSWERS.has(answer)) return;
      setState(engine.setVote(getState(), team, answer));
      broadcast();
    });

    socket.on("host:score", () => {
      const s = getState();
      // Guard: must not already be scored, and vote gate must have been used
      if (s.g2_da_cham_diem || s.g2_cho_phep_vote) return;
      setState(engine.scoreVotes(s));
      broadcast();
    });

    socket.on("host:next_q", () => {
      setState(engine.advanceQuestion(getState()));
      broadcast();
    });

    socket.on("host:next_round", () => {
      setState(engine.advanceRound(getState()));
      broadcast();
    });

    socket.on("host:early_reveal", () => {
      setState(engine.earlyReveal(getState()));
      broadcast();
    });

    // Player events
    socket.on("player:buzz", ({ team, type }) => {
      if (!isValidTeam(team) || (type !== "row" && type !== "keyword")) return;
      setState(engine.buzzIn(getState(), team, type));
      broadcast();
    });

    socket.on("player:vote", ({ team, answer }) => {
      if (!isValidTeam(team) || !VALID_ANSWERS.has(answer)) return;
      setState(engine.recordVote(getState(), team, answer));
      broadcast();
    });

    socket.on("disconnect", () => {
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });
}
