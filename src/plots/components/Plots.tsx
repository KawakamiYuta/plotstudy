import React, { useEffect, useRef } from "react";
import { useCanvas } from "../hooks/useCanvas";
import { useViewport } from "../hooks/useViewport";
import { FrameData, frameStore } from "../models/frameStore";
import { renderFrame } from "../renderer/renderFrame";

export default function SpectrumOnly() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useCanvas(canvasRef);
  const fftViewPort = useViewport();
  const latestFrame = useRef<FrameData | null>(null);

  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);

  useEffect(() => {
    const unsubscribe = frameStore.subscribe((frame) => {
      latestFrame.current = frame;
      draw();
    });
    return () => unsubscribe();
  }, []);

  const draw = () => {
    if (!latestFrame.current || !ctxRef.current || !canvasRef.current) return;

    renderFrame(
      ctxRef.current,
      canvasRef.current,
      latestFrame.current,
      fftViewPort,            // viewport argument is ignored when showWave=false
      fftViewPort,
      false                   // only draw spectrum
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const down = (e: MouseEvent) => {
      console.log("down", e.clientX);
      isDraggingRef.current = true;
      lastXRef.current = e.clientX;
    };

    const move = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastXRef.current;
       console.log("move", dx);

      fftViewPort.onDrag(dx);
      lastXRef.current = e.clientX;

    };

    const up = (_e: MouseEvent) => {
      console.log("up", _e.clientX);
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