import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./ControlPanel.css";

export type ExecutionParams = {
  threshold: number;
};

export default function ControlPanel() {
  const [executionParams, setExecutionParams] = useState<ExecutionParams>({
    threshold: 10,
  });

  const handleNextFrame = async () => {
    try {
      await invoke("pull_frame", {
        threshold: executionParams.threshold, // ← Rustへ渡せる
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="control-panel">
      <button onClick={handleNextFrame}>
        Next Frame
      </button>

      <label>
        Min SNR{" "}
        <input
          type="range"
          min="0"
          max="100"
          value={executionParams.threshold}
          onChange={(e) =>
            setExecutionParams({
              ...executionParams,
              threshold: Number(e.target.value),
            })
          }
        />
      </label>
    </div>
  );
}
