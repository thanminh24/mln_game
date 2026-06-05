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
    answerRevealed: false,
    keywordSolved: false,
    score: 0,
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
