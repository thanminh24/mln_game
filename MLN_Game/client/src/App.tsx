import { BrowserRouter, Routes, Route } from "react-router-dom";
import { appBasePath } from "./config/runtime-config";
import { SocketProvider } from "./context/socket-context";
import { HostView } from "./views/host-view";
import { SummaryPage } from "./views/summary-page";

export default function App() {
  return (
    <BrowserRouter basename={appBasePath}>
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
