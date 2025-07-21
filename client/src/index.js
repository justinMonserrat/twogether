import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";

// 1. Grab the root div
const container = document.getElementById("root");

// 2. Create a root
const root = createRoot(container);

// 3. Render app inside AuthProvider
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
