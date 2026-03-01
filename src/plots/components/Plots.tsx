import React, { useEffect, useRef, useCallback } from "react";
import { useCanvas } from "../hooks/useCanvas";
import { useViewport } from "../hooks/useViewport";
import { FrameData, frameStore } from "../models/frameStore";
import { renderFrame } from "../renderer/renderFrame";
import { MARGIN } from "../renderer/layout";

/**
 * Props for the spectrum-only canvas.  All rendering metadata (threshold,
 * highlight range, special bins) is supplied inside the incoming frame
 * payload—there are no props to control the display directly.
 */
interface SpectrumOnlyProps {
  // component no longer accepts threshold/highlight range;
  // metadata comes with the frame data itself
}

const CLICK_RADIUS = 10; // number of bins either side of clicked bar to color

export default function SpectrumOnly(_props: SpectrumOnlyProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useCanvas(canvasRef);
  const fftViewPort = useViewport();
  const fftViewPortRef = useRef(fftViewPort);
  const latestFrame = useRef<FrameData | null>(null);
  // track analysis mode locally rather than via props
  const [analysisMode, setAnalysisMode] = React.useState(false);
  // bins selected by a click while in analysis mode; we color these specially
  const [clickedBins, setClickedBins] = React.useState<number[]>([]);
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

    const frame = latestFrame.current;
    const hrange = frame.highlight_range;

    // when in analysis mode, constrain viewport to highlight range if provided
    if (analysisMode && hrange) {
      const visible = canvasWidth / v.pxPerUnit;
      const range = hrange.end - hrange.start;
      const minPx = canvasWidth / Math.max(range, 1);

      let newPx = v.pxPerUnit;
      if (newPx < minPx) newPx = minPx;

      let newOffset = v.offset;
      const minOff = hrange.start;
      const maxOff = Math.max(hrange.end - visible, minOff);
      if (newOffset < minOff) newOffset = minOff;
      if (newOffset > maxOff) newOffset = maxOff;

      if (newOffset !== v.offset || newPx !== v.pxPerUnit) {
        fftViewPort.setViewport(newOffset, newPx);
        return;
      }
    } else {
      v.clampOffset(frame.spectrum.length, canvasWidth);
    }

    // pass the clicked bins directly to the renderer so they can be
    // coloured separately from any backend-provided analysis_bins.
    renderFrame(
      ctxRef.current,
      canvasRef.current,
      frame,
      v,
      v,
      false,
      analysisMode,
      clickedBins // this argument will be handed off as selectedBins
    );
  }, [analysisMode, clickedBins]);
  useEffect(() => {
    const unsubscribe = frameStore.subscribe((frame) => {
      console.log("Received new frame", frame);
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

    // user clicks a bar while in analysis mode to mark a range of bins
    const click = (e: MouseEvent) => {
      // only react to single clicks (dblclick will have detail === 2)
      if (e.detail !== 1) return;
      if (!analysisMode) return;
      const frame = latestFrame.current;
      if (!frame || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const x = (e.clientX - rect.left) * scaleX - MARGIN.left;
      const v = fftViewPortRef.current;
      const bin = Math.floor(v.offset + x / v.pxPerUnit);
      if (bin < 0 || bin >= frame.spectrum.length) return;

      // choose a fixed radius around the clicked bin (can be adjusted later)
      const start = Math.max(0, bin - CLICK_RADIUS);
      const end = Math.min(frame.spectrum.length, bin + CLICK_RADIUS + 1);
      const bins: number[] = [];
      for (let i = start; i < end; i++) bins.push(i);

      setClickedBins(bins);
      draw();
    };

    const dblclick = (e: MouseEvent) => {
      const frame = latestFrame.current;
      const hrange = frame?.highlight_range;
      if (!hrange || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const x = (e.clientX - rect.left) * scaleX - MARGIN.left;
      const v = fftViewPortRef.current;
      const bin = Math.floor(v.offset + x / v.pxPerUnit);
      if (bin >= hrange.start && bin < hrange.end) {
        if (!analysisMode) {
          prevViewportRef.current = { offset: v.offset, pxPerUnit: v.pxPerUnit };
          const width = canvas.clientWidth;
          const totalBins = frame ? frame.spectrum.length : 0;
          const range = hrange.end - hrange.start;
          const margin = 0;
          const start = Math.max(0, hrange.start - margin);
          const end = Math.min(totalBins, hrange.end + margin);
          fftViewPort.zoomToRange(start, end, width);
          setAnalysisMode(true);
        } else {
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
    canvas.addEventListener("click", click);
    canvas.addEventListener("dblclick", dblclick);

    return () => {
      canvas.removeEventListener("mousedown", down);
      canvas.removeEventListener("mousemove", move);
      canvas.removeEventListener("mouseup", up);
      canvas.removeEventListener("click", click);
      canvas.removeEventListener("dblclick", dblclick);
    };
  }, [draw, analysisMode]);


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

  // when exiting analysis mode remove any user-selected bins
  useEffect(() => {
    if (!analysisMode && clickedBins.length) {
      setClickedBins([]);
    }
  }, [analysisMode, clickedBins.length]);


  useEffect(draw, [fftViewPort.pxPerUnit, fftViewPort.offset]);

  // redraw when user-selected bins update
  useEffect(() => {
    draw();
  }, [clickedBins, draw]);

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