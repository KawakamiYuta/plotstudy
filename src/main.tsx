import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { frameStore } from "./plots/models/frameStore";

frameStore.init();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}>
    <App />
    </div>
  </React.StrictMode>,
);
