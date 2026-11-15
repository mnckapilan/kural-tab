import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "../../components/App";
import "../../styles/globals.css";
import "../../styles/style.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Failed to find #root element in newtab.html");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
