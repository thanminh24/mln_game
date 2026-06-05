import { useSocket } from "../hooks/use-socket";
import { useHostKeyboard } from "../hooks/use-host-keyboard";
import { CrosswordGamePanel } from "../components/crossword-game-panel";

export function HostView() {
  const { state, connected } = useSocket();

  useHostKeyboard(state);

  return (
    <div className="min-h-screen bg-[#0f0f0f] font-vietnamese">
      {!connected && (
        <div className="absolute top-3 right-3 z-50 bg-red-900 text-red-200 text-xs px-3 py-1 rounded-full">
          ⟳ Đang kết nối...
        </div>
      )}
      <CrosswordGamePanel state={state} />
    </div>
  );
}
