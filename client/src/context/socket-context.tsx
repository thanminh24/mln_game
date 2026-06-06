import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { GameState, ServerToClientEvents, ClientToServerEvents } from "../types/shared";

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Keep in sync with server/src/game/game-state.ts initialState()
function buildInitialState(): GameState {
  return {
    openedRows: [],
    activeRow: null,
    wrongOptionIds: [],
    wrongTeamIds: [],
    answerRevealed: false,
    keywordSolved: false,
    score: 0,
    teams: [
      { id: "group-1", name: "Nhóm 1", color: "#ef4444", score: 0 },
      { id: "group-2", name: "Nhóm 2", color: "#3b82f6", score: 0 },
      { id: "group-3", name: "Nhóm 3", color: "#facc15", score: 0 },
      { id: "group-4", name: "Nhóm 4", color: "#22c55e", score: 0 },
      { id: "group-6", name: "Nhóm 6", color: "#a855f7", score: 0 },
    ],
    activeTeamId: "group-1",
    maxScore: 220,
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
      s.emit("game:request_state");
    });

    s.on("disconnect", () => {
      console.log("[socket] disconnected");
      setConnected(false);
    });

    s.on("game:state", (newState) => {
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
