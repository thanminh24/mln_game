import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { GameState, ServerToClientEvents, ClientToServerEvents, TEAMS } from "../types/shared";

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Keep in sync with server/src/game/game-state.ts initialState()
function buildInitialState(): GameState {
  const scores = Object.fromEntries(TEAMS.map((t) => [t, 0])) as Record<
    (typeof TEAMS)[number],
    number
  >;
  const votes = Object.fromEntries(TEAMS.map((t) => [t, null])) as Record<
    (typeof TEAMS)[number],
    string | null
  >;
  return {
    mode: "game1",
    g1_opened: [],
    g1_current_q: null,
    g1_buzz_active: false,
    g1_buzz_winner: null,
    g1_buzz_type: null,
    g1_keyword_solved: false,
    g1_timer_seconds: null,
    g2_round: 0,
    g2_question: 0,
    g2_revealed_slices: [],
    g2_done: false,
    g2_cho_phep_vote: false,
    g2_da_cham_diem: false,
    g2_timer_seconds: null,
    scores,
    votes,
  };
}

interface SocketContextValue {
  socket: AppSocket | null;
  state: GameState;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  state: buildInitialState(),
  connected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  // useState (not useRef) so context re-renders when socket instance changes
  const [socket, setSocket] = useState<AppSocket | null>(null);
  const [state, setState] = useState<GameState>(buildInitialState);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s: AppSocket = io(window.location.origin, {
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });

    setSocket(s);

    s.on("connect", () => {
      console.log("[socket] connected:", s.id);
      setConnected(true);
      s.emit("client:request_state");
    });

    s.on("disconnect", () => {
      console.log("[socket] disconnected");
      setConnected(false);
    });

    s.on("state:update", (newState) => {
      setState(newState);
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, state, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  return useContext(SocketContext);
}
