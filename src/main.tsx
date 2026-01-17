/**
 * main.tsx - PATCH 863 - MINIMAL BOOTSTRAP
 * 
 * CRITICAL: Only React, ReactDOM and App - nothing else
 */
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
