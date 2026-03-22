import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthContext";
import App from "./App";
import "./styles/index.css";
import "./styles/accounts.css";

const syncDisplayMode = () => {
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari PWA fallback.
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true;

  document.documentElement.dataset.displayMode = isStandalone
    ? "standalone"
    : "browser";
};

syncDisplayMode();
const displayModeQuery = window.matchMedia("(display-mode: standalone)");
if (typeof displayModeQuery.addEventListener === "function") {
  displayModeQuery.addEventListener("change", syncDisplayMode);
} else {
  displayModeQuery.onchange = syncDisplayMode;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
