import React, { useEffect, useRef } from "react";
import { drawAnalysis } from "../renderer/drawAnalysis";
import "../../controls/styles/ControlPanel.css"; // reuse modal styles

interface AnalysisModalProps {
  range: { start: number; end: number };
  spectrum: number[];
  threshold: number;
  onClose: () => void;
}

export default function AnalysisModal({
  range,
  spectrum,
  threshold,
  onClose,
}: AnalysisModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    // scale y-axis to displayed slice rather than global maxima
    drawAnalysis(
      ctx,
      spectrum,
      range.start,
      range.end,
      width,
      height,
      threshold
    );
  }, [range, spectrum, threshold]);

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: "640px" }}>
        <h3>分析: bins {range.start}–{range.end}</h3>
        <canvas
          ref={canvasRef}
          width={640}
          height={640}
          style={{ width: "100%", height: "auto", background: "#000" }}
        />
        <div className="modal-buttons" style={{ marginTop: "12px" }}>
          <button onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  );
}
