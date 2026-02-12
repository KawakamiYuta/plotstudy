import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./ControlPanel.css";

export default function ControlPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [threshold, setThreshold] = useState(20);

  const handleNextFrame = async () => {
    try {
      await invoke("pull_frame");
    } catch (e) {
      console.error(e);
    }
  };

  const handleExecute = async () => {
    try {
      await invoke("run_external_command", {
        params: { threshold },
      });
      setIsOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="control-panel">
        <button
          className="execute-open"
          onClick={() => setIsOpen(true)}
        >
          実行
        </button>
        <button onClick={handleNextFrame}>
          Next Frame
        </button>
      </div>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>実行パラメータ</h3>

            <div className="slider-group">
              <span>Threshold</span>

              <input
                type="range"
                min="0"
                max="100"
                value={threshold}
                onChange={(e) =>
                  setThreshold(Number(e.target.value))
                }
              />

              <span className="slider-value">
                {threshold}
              </span>
            </div>

            <div className="modal-buttons">
              <button onClick={() => setIsOpen(false)}>
                キャンセル
              </button>

              <button
                className="execute"
                onClick={handleExecute}
              >
                実行
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
