import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./context/socket-context";
import { HostView } from "./views/host-view";
import { SummaryPage } from "./views/summary-page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <SocketProvider>
              <HostView />
            </SocketProvider>
          }
        />
        <Route path="/summary" element={<SummaryPage />} />
      </Routes>
    </BrowserRouter>
  );
}
