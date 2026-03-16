import ReactDOM from "react-dom/client";
import App from "./app/App";

import { getCurrentWindow } from '@tauri-apps/api/window';

// when using `"withGlobalTauri": true`, you may use
// const { getCurrentWindow } = window.__TAURI__.window;

const appWindow = getCurrentWindow();

document
  .getElementById('titlebar-minimize')
  ?.addEventListener('click', () => appWindow.minimize());
document
  .getElementById('titlebar-maximize')
  ?.addEventListener('click', () => appWindow.toggleMaximize());
document
  .getElementById('titlebar-close')
  ?.addEventListener('click', () => appWindow.close());

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement!);

root.render(
    <App />
);

//  <React.StrictMode>
  // </React.StrictMode>,
