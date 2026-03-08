import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

import { frameStore } from "./plots/models/frameStore";

frameStore.init();

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement!);

root.render(
    <App />
);

//  <React.StrictMode>
  // </React.StrictMode>,
