import express from "express";
import http from "http";
import path from "path";
import cors from "cors";
import { Server } from "socket.io";
import { GameState, ServerToClientEvents, ClientToServerEvents } from "./types/shared";
import { initialState } from "./game/game-state";
import { createRouter } from "./routes";
import { registerSocketHandlers } from "./sockets";

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 6942;
const APP_BASE_PATH = process.env.APP_BASE_PATH || "/";

// In-memory game state
let state: GameState = initialState();
const getState = () => state;
const setState = (s: GameState) => { state = s; };

// In production, client is served from same origin — no CORS needed
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3001";
const corsOrigin = process.env.NODE_ENV === "production" ? false : CLIENT_ORIGIN;

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// REST routes
app.use(createRouter(getState));

// Serve built client in production
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../../client/dist");
  const staticRoute = APP_BASE_PATH === "/" ? "/" : APP_BASE_PATH;

  app.use(staticRoute, express.static(clientBuildPath));
  app.get(`${staticRoute === "/" ? "" : staticRoute}/*`, (_req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// Socket.IO
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: corsOrigin, methods: ["GET", "POST"] },
});

registerSocketHandlers(io, getState, setState);

httpServer.listen(PORT, () => {
  console.log(`[server] running on http://localhost:${PORT}`);
});
