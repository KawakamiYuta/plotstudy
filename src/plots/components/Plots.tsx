import React, { useEffect, useRef, useCallback } from "react";
import { useCanvas } from "../hooks/useCanvas";
import { useViewport } from "../hooks/useViewport";
import { FrameData, frameStore } from "../models/frameStore";
import { renderFrame } from "../renderer/renderFrame";

export default function SpectrumOnly() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useCanvas(canvasRef);
  const fftViewPort = useViewport();
  const fftViewPortRef = useRef(fftViewPort);
  const latestFrame = useRef<FrameData | null>(null);

  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);

  // keep ref synced so that subscription callback always sees the latest state
  useEffect(() => {
    fftViewPortRef.current = fftViewPort;
  }, [fftViewPort]);

  const draw = useCallback(() => {
    if (!latestFrame.current || !ctxRef.current || !canvasRef.current) return;

    const v = fftViewPortRef.current;
    const canvasWidth = canvasRef.current.clientWidth;
    v.clampOffset(latestFrame.current.spectrum.length, canvasWidth);

    renderFrame(
      ctxRef.current,
      canvasRef.current,
      latestFrame.current,
      v,
      v,
      false
    );
  }, []);

  useEffect(() => {
    const unsubscribe = frameStore.subscribe((frame) => {
      latestFrame.current = frame;
      draw();
    });
    return unsubscribe;
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const down = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastXRef.current = e.clientX;
    };

    const move = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastXRef.current;
      fftViewPort.onDrag(dx);
      lastXRef.current = e.clientX;
    };

    const up = (_e: MouseEvent) => {
      isDraggingRef.current = false;
    };

    canvas.addEventListener("mousedown", down);
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseup", up);

    return () => {
      canvas.removeEventListener("mousedown", down);
      canvas.removeEventListener("mousemove", move);
      canvas.removeEventListener("mouseup", up);
    };
  }, []);

  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !latestFrame.current) return;
    // always adjust FFT viewport since waveform is hidden
    const canvasWidth = canvasRef.current.clientWidth;
    fftViewPort.onWheel(e, latestFrame.current.spectrum.length, canvasWidth);
  };

  useEffect(draw, [fftViewPort.pxPerUnit, fftViewPort.offset]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%" }}
      onWheel={onWheel}
    />
  );
}