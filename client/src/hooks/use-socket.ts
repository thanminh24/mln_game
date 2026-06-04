import { useCallback } from "react";
import { useSocketContext } from "../context/socket-context";
import { ClientToServerEvents } from "../types/shared";

type EmitFn = <E extends keyof ClientToServerEvents>(
  event: E,
  ...args: Parameters<ClientToServerEvents[E]>
) => void;

export function useSocket() {
  const { socket, state, connected } = useSocketContext();

  const emit = useCallback<EmitFn>(
    (event, ...args) => {
      if (socket) {
          socket.emit(event, ...args);
      }
    },
    [socket]
  );

  return { emit, state, connected };
}
