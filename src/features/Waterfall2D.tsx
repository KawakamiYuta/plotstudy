import React, { useEffect, useRef } from "react";
import { frameStore } from "../stores/frameStore";

const HISTORY = 200;
const FFT_SIZE = 512;

export const Waterfall2D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const historyRef = useRef<Float32Array[]>([]);

  const norm = (v: Float32Array) => {
    const out = new Float32Array(v.length);
    for (let i = 0; i < v.length; i++) {
      out[i] = Math.min(1, v[i] / 160);
    }
    return out;
  };

  // 🎨 3Dと同じ思想のカラーマップ
  const colorMap = (v: number, z: number) => {
    const vv = Math.pow(v, 1.0);

    let r = 0.15 + vv * 0.5;
    let g = 0.2 + vv * 0.6;
    let b = 0.25 + vv * 0.7;

    // 奥行きフェード
    const depthFade = 1.0 - z / HISTORY;
    const fade = 0.6 + depthFade * 0.4;

    r *= fade;
    g *= fade;
    b *= fade;

    // ピーク強調
    if (v > 0.8) {
      const boost = (v - 0.8) / 0.2;
      r = r + (1 - r) * boost * 0.8;
      g = g + (1 - g) * boost * 0.8;
      b = b + (1 - b) * boost * 0.8;
    }

    return `rgb(${(r * 255) | 0}, ${(g * 255) | 0}, ${(b * 255) | 0})`;
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // =========================
    // 描画
    // =========================
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = "#0b0f14";
      ctx.fillRect(0, 0, w, h);

      const history = historyRef.current;

      const rowHeight = h / HISTORY;
      const colWidth = w / FFT_SIZE;

      for (let z = 0; z < history.length; z++) {
        const row = history[z];

        for (let x = 0; x < row.length; x++) {
          const v = row[x];

          ctx.fillStyle = colorMap(v, z);

          ctx.fillRect(
            x * colWidth,
            z * rowHeight,
            colWidth + 1,
            rowHeight + 1
          );
        }
      }
    };

    // =========================
    // データ購読
    // =========================
    const unsub = frameStore.subscribe((frame) => {
      const data = norm(frame.spectrum as Float32Array);

      historyRef.current.unshift(data);
      if (historyRef.current.length > HISTORY) {
        historyRef.current.pop();
      }

      draw();
    });

    return () => {
      unsub();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        background: "#0b0f14",
      }}
    />
  );
};