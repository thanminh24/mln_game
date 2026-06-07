import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { PasswordGate } from "./components/password-gate";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PasswordGate>
      <App />
    </PasswordGate>
  </React.StrictMode>
);
