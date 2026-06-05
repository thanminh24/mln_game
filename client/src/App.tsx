import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./context/socket-context";
import { HostView } from "./views/host-view";

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
      </Routes>
    </BrowserRouter>
  );
}
