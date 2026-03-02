import React, { useEffect, useRef } from "react";
import { FrameData, frameStore } from "../models/frameStore";

type Props = {
  startBin: number;
  endBin: number;
};

export function WaveformCanvas({ startBin, endBin }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const latestFrame = useRef<FrameData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const frame = latestFrame.current;
      console.log("Drawing waveform for bins", startBin, endBin);
      console.log(frame);
      if (!frame) return;

      const samples = frame.samples;
      const s = Math.max(0, startBin);
      const e = Math.min(samples.length, endBin);
      if (s >= e) return;

      const slice = samples.slice(s, e);
      const maxv = Math.max(...slice);
      const minv = Math.min(...slice);
      const range = maxv - minv || 1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#00ff88";
      ctx.beginPath();

      for (let i = 0; i < slice.length; i++) {
        const x = (i / (slice.length - 1)) * canvas.width;
        const norm = (slice[i] - minv) / range;
        const y = canvas.height * (1 - norm);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
    };

    draw();
    const unsub = frameStore.subscribe(draw);
    return () => unsub();
  }, [startBin, endBin]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={300}
      style={{ width: "100%", height: 300 }}
    />
  );
}