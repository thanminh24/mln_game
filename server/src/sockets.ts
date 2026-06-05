import { Server } from "socket.io";
import { GameState, ServerToClientEvents, ClientToServerEvents } from "./types/shared";
import * as engine from "./game/game-engine";
import { CROSSWORD_ROWS } from "./game/game-data";

const LAST_ROW_INDEX = CROSSWORD_ROWS.length - 1;

export function registerSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  getState: () => GameState,
  setState: (s: GameState) => void
) {
  function broadcast() {
    io.emit("game:state", getState());
  }

  io.on("connection", (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    socket.emit("game:state", getState());

    socket.on("game:request_state", () => {
      socket.emit("game:state", getState());
    });

    socket.on("game:reset", () => {
      setState(engine.resetGame());
      broadcast();
    });

    socket.on("game:select_row", ({ idx }) => {
      if (!Number.isInteger(idx) || idx < 0 || idx > LAST_ROW_INDEX) return;
      setState(engine.selectQuestion(getState(), idx));
      broadcast();
    });

    socket.on("game:choose_option", ({ optionId }) => {
      if (typeof optionId !== "string") return;
      setState(engine.chooseAnswer(getState(), optionId));
      broadcast();
    });

    socket.on("game:solve_keyword", () => {
      setState(engine.solveKeyword(getState()));
      broadcast();
    });

    socket.on("disconnect", () => {
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });
}
