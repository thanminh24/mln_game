import { BrowserRouter, Routes, Route, useSearchParams } from "react-router-dom";
import { SocketProvider } from "./context/socket-context";
import { HostView } from "./views/host-view";
import { PlayerView } from "./views/player-view";
import { SummaryPage } from "./views/summary-page";

function GameView() {
  const [params] = useSearchParams();
  const role = params.get("role");
  return role === "player" ? <PlayerView /> : <HostView />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/summary" element={<SummaryPage />} />
        <Route
          path="/"
          element={
            <SocketProvider>
              <GameView />
            </SocketProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
