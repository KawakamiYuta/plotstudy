import React from "react";
import { invoke } from "@tauri-apps/api/core";

export default function ControlPanel() {
  const handleClick = async () => {
    try {
      await invoke("pull_frame");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={handleClick}>
        Request Frame
      </button>
    </div>
  );
}
