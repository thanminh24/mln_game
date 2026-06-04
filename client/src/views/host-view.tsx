import { useSocket } from "../hooks/use-socket";
import { useHostKeyboard } from "../hooks/use-host-keyboard";
import { HostSidebar } from "../components/host-sidebar";
import { Game1HostPanel } from "../components/game1-host-panel";
import { Game2HostPanel } from "../components/game2-host-panel";
import { ShortcutLegend } from "../components/shortcut-legend";

export function HostView() {
  const { state, connected } = useSocket();

  // Attach F1–F4 + Esc keyboard shortcuts (safe for Vietnamese IME)
  useHostKeyboard(state);

  return (
    <div className="flex h-screen bg-[#0f0f0f] font-vietnamese overflow-hidden">
      {!connected && (
        <div className="absolute top-3 right-3 z-50 bg-red-900 text-red-200 text-xs px-3 py-1 rounded-full">
          ⟳ Đang kết nối...
        </div>
      )}

      <HostSidebar state={state} />

      {state.mode === "game1" ? (
        <Game1HostPanel state={state} />
      ) : (
        <Game2HostPanel state={state} />
      )}

      <ShortcutLegend state={state} />
    </div>
  );
}
