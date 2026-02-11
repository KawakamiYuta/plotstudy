import React, { useEffect, useRef } from "react";
import { frameStore } from "./frameStore";

const WIDTH = 800;
const HEIGHT = 300;

export default function WaveformBarChartCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctxRef.current = canvas.getContext("2d");

    const draw = (samples: number[]) => {
      const ctx = ctxRef.current;
      if (!ctx) return;

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const mid = HEIGHT / 2;

      // 🔥 ピクセル単位圧縮（超重要）
      const samplesPerPixel = Math.max(
        1,
        Math.floor(samples.length / WIDTH)
      );

      for (let x = 0; x < WIDTH; x++) {
        let min = 1;
        let max = -1;

        const start = x * samplesPerPixel;
        const end = Math.min(start + samplesPerPixel, samples.length);

        for (let i = start; i < end; i++) {
          const v = samples[i];
          if (v < min) min = v;
          if (v > max) max = v;
        }

        const yMin = mid - max * mid;
        const yMax = mid - min * mid;

        ctx.fillStyle = "#4e79a7";
        ctx.fillRect(x, yMin, 1, yMax - yMin);
      }

      // ゼロライン
      ctx.strokeStyle = "#888";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(WIDTH, mid);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const unsubscribe = frameStore.subscribe(draw);

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      style={{ background: "black" }}
    />
  );
}
