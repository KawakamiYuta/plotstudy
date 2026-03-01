import React, { useEffect, useRef, useCallback } from "react";
import { useCanvas } from "../hooks/useCanvas";
import { useViewport } from "../hooks/useViewport";
import { FrameData, frameStore } from "../models/frameStore";
import { renderFrame } from "../renderer/renderFrame";
import { MARGIN } from "../renderer/layout";

/**
 * Props for the spectrum-only canvas.  Consumers may provide an optional
 * `highlightRange` to draw a semi-transparent overlay over a range of
 * frequency bins on the spectrum plot.  The component itself manages an
 * "analysis mode" state that is entered by double-clicking the highlighted
 * region and exited either by another double-click or by pressing ESC.
 */
interface SpectrumOnlyProps {
  // optional bin range to highlight on spectrum
  highlightRange?: { start: number; end: number };
  // current threshold value for highlighting special bins
  threshold: number;
}

export default function SpectrumOnly({ highlightRange, threshold }: SpectrumOnlyProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useCanvas(canvasRef);
  const fftViewPort = useViewport();
  const fftViewPortRef = useRef(fftViewPort);
  const latestFrame = useRef<FrameData | null>(null);
  // track analysis mode locally rather than via props
  const [analysisMode, setAnalysisMode] = React.useState(false);
  // remember viewport before entering analysis so we can restore it
  const prevViewportRef = useRef<{ offset: number; pxPerUnit: number } | null>(null);

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

    // when in analysis mode, keep the viewport strictly within the
    // highlighted range and prevent zooming out past its width.
    if (analysisMode && highlightRange) {
      const visible = canvasWidth / v.pxPerUnit;
      const range = highlightRange.end - highlightRange.start;
      const minPx = canvasWidth / Math.max(range, 1);

      let newPx = v.pxPerUnit;
      if (newPx < minPx) newPx = minPx;

      let newOffset = v.offset;
      const minOff = highlightRange.start;
      const maxOff = Math.max(highlightRange.end - visible, minOff);
      if (newOffset < minOff) newOffset = minOff;
      if (newOffset > maxOff) newOffset = maxOff;

      if (newOffset !== v.offset || newPx !== v.pxPerUnit) {
        fftViewPort.setViewport(newOffset, newPx);
        // state change will trigger another draw via effect; abandon this draw
        return;
      }
    } else {
      v.clampOffset(latestFrame.current.spectrum.length, canvasWidth);
    }

    renderFrame(
      ctxRef.current,
      canvasRef.current,
      latestFrame.current,
      v,
      v,
      false,
      highlightRange ? highlightRange.start : null,
      highlightRange ? highlightRange.end : null,
      analysisMode,
      threshold
    );
  }, [highlightRange, analysisMode, threshold]);
  useEffect(() => {
    const unsubscribe = frameStore.subscribe((frame) => {
      latestFrame.current = frame;
      draw();
    });
    return unsubscribe;
  }, [draw]);

  // we don't need to remember previous viewport anymore; always zoom on dblclick

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

    const dblclick = (e: MouseEvent) => {
      if (!highlightRange || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const x = (e.clientX - rect.left) * scaleX - MARGIN.left;
      const v = fftViewPortRef.current;
      const bin = Math.floor(v.offset + x / v.pxPerUnit);
      if (bin >= highlightRange.start && bin < highlightRange.end) {
        if (!analysisMode) {
          // entering analysis, remember current viewport and zoom to range
          prevViewportRef.current = { offset: v.offset, pxPerUnit: v.pxPerUnit };
          const width = canvas.clientWidth;
          const totalBins = latestFrame.current ? latestFrame.current.spectrum.length : 0;
          const range = highlightRange.end - highlightRange.start;
          // const margin = Math.max(1, Math.floor(range * 0.1));
          const margin = 0;
          const start = Math.max(0, highlightRange.start - margin);
          const end = Math.min(totalBins, highlightRange.end + margin);
          fftViewPort.zoomToRange(start, end, width);
          setAnalysisMode(true);
        } else {
          // leaving analysis, restore previous viewport
          setAnalysisMode(false);
          if (prevViewportRef.current) {
            fftViewPort.setViewport(
              prevViewportRef.current.offset,
              prevViewportRef.current.pxPerUnit
            );
          }
        }
        draw();
      }
    };

    canvas.addEventListener("mousedown", down);
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseup", up);
    canvas.addEventListener("dblclick", dblclick);

    return () => {
      canvas.removeEventListener("mousedown", down);
      canvas.removeEventListener("mousemove", move);
      canvas.removeEventListener("mouseup", up);
      canvas.removeEventListener("dblclick", dblclick);
    };
  }, [highlightRange, draw, analysisMode]);


  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !latestFrame.current) return;
    // always adjust FFT viewport since waveform is hidden
    const canvasWidth = canvasRef.current.clientWidth;
    fftViewPort.onWheel(e, latestFrame.current.spectrum.length, canvasWidth);
  };

  // escape key cancels analysis mode and restores viewport
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && analysisMode) {
        setAnalysisMode(false);
        if (prevViewportRef.current) {
          fftViewPort.setViewport(
            prevViewportRef.current.offset,
            prevViewportRef.current.pxPerUnit
          );
        }
        draw();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [analysisMode, draw, fftViewPort]);

  useEffect(draw, [fftViewPort.pxPerUnit, fftViewPort.offset]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%" }}
        onWheel={onWheel}
      />
    </>
  );
}