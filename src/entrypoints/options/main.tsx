import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SettingsApp from "@/components/settings/SettingsApp";
import "@/styles/globals.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Failed to find #root element in options.html");
}

createRoot(container).render(
  <StrictMode>
    <SettingsApp />
  </StrictMode>,
);
