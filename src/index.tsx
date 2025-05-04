import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import "./styles/style.css";

// Initialize the app when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("root");

  if (!container) {
    console.error("Failed to find root element");
    return;
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
