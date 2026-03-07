import React, { useEffect, useRef, useState } from "react";
import { FrameData, frameStore } from "../models/frameStore";
import { LargeDialog } from "./LargeDialog";
import { drawWaveform, drawGrid, Viewport } from "../../dialog/drawWaveform";

type Props = {
  startBin: number;
  endBin: number;
  wave: number[];
};

export function WaveformCanvas({ startBin, endBin, wave }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gridCanvasRef = useRef<HTMLCanvasElement>(null)
  const sampleRate = 1;
  const viewport = useState<Viewport>({
    scaleX: 1,
    offsetX: 0,
  })[0]

useEffect(() => {
  const canvas = canvasRef.current;
  const gcanvas = gridCanvasRef.current;
  if (!canvas || !gcanvas) return;

  const ctx = canvas.getContext("2d");
  const gctx = gcanvas.getContext("2d");
  if (!ctx || !gctx) return;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // ---- waveform canvas ----
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // ---- grid canvas ----
    gcanvas.width = rect.width * dpr;
    gcanvas.height = rect.height * dpr;
    gcanvas.style.width = rect.width + "px";
    gcanvas.style.height = rect.height + "px";
    gctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    draw(rect.width, rect.height);
  };

  const draw = (width: number, height: number) => {
    if (!wave) return;

    // gridは下層に固定
    gctx.clearRect(0, 0, width, height);
    drawGrid(
      gctx,
      width,
      height,
      viewport,
      sampleRate,
      wave.length
    );

    // waveformは上層
    ctx.clearRect(0, 0, width, height);
    drawWaveform(
      ctx,
      wave,
      viewport,
      width,
      height
    );
  };

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  resize();
  return () => observer.disconnect();
}, [wave, viewport, sampleRate]);

  if (!wave) return null

return (
  <div
    style={{
      position: "relative",
      width: "100%",
      height: "100%",   // ← これが重要
    }}
  >
    <canvas
      ref={gridCanvasRef}
      style={{
        position: "absolute",
        inset: 0,
      }}
    />
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
      }}
    />
  </div>
);
}
