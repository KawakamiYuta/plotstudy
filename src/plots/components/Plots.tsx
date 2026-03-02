import React, { useEffect, useRef, useCallback, useState } from "react";
import { useCanvas } from "../hooks/useCanvas";
import { useViewport } from "../hooks/useViewport";
import { FrameData, frameStore } from "../models/frameStore";
import { renderFrame } from "../renderer/renderFrame";
import { MARGIN } from "../renderer/layout";

import { Window } from "@tauri-apps/api/window";
import { WaveformManager } from "./WaveformManager";

const openWebViewWindow = (startBin: number, endBin: number) => {
  const label = `waveform-${startBin}-${endBin}`;

  const win = new Window(label, {
    url: `/waveform?start=${startBin}&end=${endBin}`,
    width: 800,
    height: 400,
    title: `waveform ${startBin}-${endBin}`,
    transparent: false,
    decorations: true,
    theme: "dark"
  });

  win.once("tauri://created", () => {
    console.log("window created");
  });

  win.once("tauri://error", (e) => {
    console.error(e);
  });
  return win;
};

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

// when clicking, remember both the neighborhood and the exact bin for special color
interface ClickSelection {
  center: number;
  bins: number[];
}

export default function SpectrumOnly(_props: SpectrumOnlyProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useCanvas(canvasRef);
  const fftViewPort = useViewport();
  const fftViewPortRef = useRef(fftViewPort);
  const latestFrame = useRef<FrameData | null>(null);
  // track analysis mode locally rather than via props
  const [analysisMode, setAnalysisMode] = React.useState(false);
  // selection triggered by a click: center bin + surrounding bins
  const [clickSelection, setClickSelection] = React.useState<ClickSelection | null>(null);
  // remember viewport before entering analysis so we can restore it
  const prevViewportRef = useRef<{ offset: number; pxPerUnit: number } | null>(null);

  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);

  const openWaveformRef = useRef<
    ((s: number, e: number) => void) | null
  >(null);

  const handleOpenWaveform = (startBin: number, endBin: number) => {
    openWaveformRef.current?.(startBin, endBin);
  };

  // track hover details. two modes:
  // - single: info for a specific bin
  // - range: special case during analysis where the cursor is within
  //   an overlay_bins region; show data for all bins in that range.
  const [hoverInfo, setHoverInfo] = useState<
    | { type: "single"; bin: number; value: number; x: number; y: number }
    | { type: "range"; bins: { bin: number; value: number }[]; x: number; y: number }
    | null
  >(null);

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
      clickSelection ? clickSelection.bins : [], // selectedBins
      clickSelection ? clickSelection.center : null
    );
  }, [analysisMode, clickSelection]);
  useEffect(() => {
    const unsubscribe = frameStore.subscribe((frame) => {
      console.log("Received new frame", frame);
      latestFrame.current = frame;
      draw();
    });
    return unsubscribe;
  }, [draw]);

  // helper used when the user wants to inspect the time-domain waveform
  // corresponding to a range of frequency bins.  The function opens a
  // small pop‑up window, draws the current frame's samples for the
  // requested span, and keeps it up‑to‑date until the window closes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // const openWaveformWindow = useCallback((startBin: number, endBin: number) => {
  //   const win = openWebViewWindow(startBin, endBin);
  //   if (!win) return;

  //   // win.document.title = `waveform ${startBin}-${endBin}`;
  //   // win.document.body.style.margin = "0";
  //   const canvas = win.document.createElement("canvas");
  //   canvas.style.width = "100%";
  //   canvas.style.height = "100%";
  //   // give it a reasonable drawing size so the ctx.scale calls work
  //   canvas.width = 800;
  //   canvas.height = 400;
  //   win.document.body.appendChild(canvas);

  //   const drawWindow = () => {
  //     const frame = latestFrame.current;
  //     if (!frame) return;
  //     const samples = frame.samples;
  //     const totalBins = frame.spectrum.length;
  //     const s = Math.max(0, startBin);
  //     const e = Math.min(totalBins, endBin);
  //     if (s >= e) return;

  //     const ctx = canvas.getContext("2d");
  //     if (!ctx) return;
  //     ctx.clearRect(0, 0, canvas.width, canvas.height);

  //     // take the slice of samples matching the bin indices.  there is no
  //     // exact mapping provided, so we use a 1:1 correspondence.
  //     const slice = samples.slice(s, e);
  //     const maxv = Math.max(...slice);
  //     const minv = Math.min(...slice);
  //     const range = maxv - minv || 1;

  //     ctx.strokeStyle = "#000";
  //     ctx.beginPath();
  //     for (let i = 0; i < slice.length; i++) {
  //       const x = (i / (slice.length - 1)) * canvas.width;
  //       const norm = (slice[i] - minv) / range;
  //       const y = canvas.height * (1 - norm);
  //       if (i === 0) ctx.moveTo(x, y);
  //       else ctx.lineTo(x, y);
  //     }
  //     ctx.stroke();
  //   };

  //   // draw now and then subscribe for updates
  //   drawWindow();
  //   const unsub = frameStore.subscribe(drawWindow);
  //   win.addEventListener("beforeunload", () => {
  //     unsub();
  //   });
  // }, []);

  // we don't need to remember previous viewport anymore; always zoom on dblclick

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const down = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastXRef.current = e.clientX;
    };

    const move = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const dx = e.clientX - lastXRef.current;
        fftViewPort.onDrag(dx);
        lastXRef.current = e.clientX;
        return;
      }
      // handle hover when not dragging
      const frame = latestFrame.current;
      const canvas = canvasRef.current;
      if (!frame || !canvas) {
        setHoverInfo(null);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const yCanvas = (e.clientY - rect.top) * scaleY;

      const innerHeight = canvas.height - MARGIN.top - MARGIN.bottom;
      const spectrumTop = MARGIN.top;
      const spectrumBottom = spectrumTop + innerHeight;

      if (yCanvas < spectrumTop || yCanvas > spectrumBottom) {
        // outside the Y-axis region entirely
        setHoverInfo(null);
        return;
      }

      const x = (e.clientX - rect.left) * scaleX - MARGIN.left;
      const v = fftViewPortRef.current;
      const bin = Math.floor(v.offset + x / v.pxPerUnit);
      if (bin < 0 || bin >= frame.spectrum.length) {
        setHoverInfo(null);
        return;
      }

      // determine the bar's vertical span in canvas coords
      const value = frame.spectrum[bin];
      const maxValue = 200; // dbMax from renderer
      const normalized = Math.min(1, Math.max(0, value / maxValue));
      const barHeight = innerHeight * normalized;
      const barTop = spectrumTop + innerHeight - barHeight;

      if (yCanvas < barTop) {
        // cursor is above the bar itself
        setHoverInfo(null);
        return;
      }

      const tooltipX = e.clientX - rect.left + 10;
      const tooltipY = e.clientY - rect.top + 10;

      // special case: in analysis mode with an overlay selection range,
      // display information for entire range rather than a single bin.
      if (
        analysisMode &&
        clickSelection &&
        (clickSelection.bins.includes(bin) || clickSelection.center === bin)
      ) {
        const binsData = clickSelection.bins.map((b) => ({
          bin: b,
          value: frame.spectrum[b],
        }));
        setHoverInfo({ type: "range", bins: binsData, x: tooltipX, y: tooltipY });
      } else {
        setHoverInfo({ type: "single", bin, value, x: tooltipX, y: tooltipY });
      }
    };

    const up = (_e: MouseEvent) => {
      isDraggingRef.current = false;
    };

    const leave = () => {
      setHoverInfo(null);
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
      let bins: number[] = [];

      // if backend provided analysis_bins we insist that the *center* is one of them
      if (frame.analysis_bins && frame.analysis_bins.length) {
        if (!frame.analysis_bins.includes(bin)) {
          return; // clicked bin not permitted
        }
      }

      // try to look up overlay bins from the frame mapping; fall back to radius
      if (frame.overlay_bins_by_center && frame.overlay_bins_by_center[bin]) {
        bins = frame.overlay_bins_by_center[bin];
      } 

      setClickSelection({ center: bin, bins });
      draw();
    };

    // when the user double-clicks, there are two possible actions:
  // 1. if we're inside a set of user-selected bins, open a new window
  //    and plot the corresponding time waveform.
  // 2. otherwise behave as before: toggle analysis mode on the
  //    highlight_range.
  const dblclick = (e: MouseEvent) => {
      const frame = latestFrame.current;
      if (!frame || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const x = (e.clientX - rect.left) * scaleX - MARGIN.left;
      const v = fftViewPortRef.current;
      const bin = Math.floor(v.offset + x / v.pxPerUnit);

      console.log("Double-clicked bin", bin);

      // if we have a user click selection and the dblclick happened
      // within that range, open the waveform viewer window instead of
      // doing the normal analysis toggle.
      if (
        clickSelection &&
        clickSelection.bins.length &&
        clickSelection.bins.includes(bin)
      ) {
        const bins = clickSelection.bins;
        const start = Math.min(...bins);
        const end = Math.max(...bins) + 1; // exclusive
        console.log("Opening waveform window for bins", bins);
        // openWaveformWindow(start, end);
        handleOpenWaveform(start, end);
        return;
      }

      const hrange = frame.highlight_range;
      if (!hrange) return;

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
          // setAnalysisMode(false);
          // if (prevViewportRef.current) {
          //   fftViewPort.setViewport(
          //     prevViewportRef.current.offset,
          //     prevViewportRef.current.pxPerUnit
          //   );
          // }
        }
        draw();
      }
    };

    canvas.addEventListener("mousedown", down);
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseleave", leave);
    canvas.addEventListener("mouseup", up);
    canvas.addEventListener("click", click);
    canvas.addEventListener("dblclick", dblclick);

    return () => {
      canvas.removeEventListener("mousedown", down);
      canvas.removeEventListener("mousemove", move);
      canvas.removeEventListener("mouseleave", leave);
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
    if (!analysisMode && clickSelection) {
      setClickSelection(null);
    }
  }, [analysisMode, clickSelection]);

  // clear hover when the selection changes (so stale tooltip doesn't linger)
  useEffect(() => {
    if (hoverInfo) setHoverInfo(null);
  }, [clickSelection]);


  useEffect(draw, [fftViewPort.pxPerUnit, fftViewPort.offset]);

  // redraw when user-selected bins update
  useEffect(() => {
    draw();
  }, [clickSelection, draw]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <WaveformManager
        registerOpen={(fn) => {
          openWaveformRef.current = fn;
        }}
      />
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%" }}
        onWheel={onWheel}
      />
      {hoverInfo && (
        <div
          style={{
            position: "absolute",
            top: hoverInfo.y,
            left: hoverInfo.x,
            pointerEvents: "none",
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            padding: "2px 6px",
            borderRadius: 3,
            fontSize: 12,
            whiteSpace: "nowrap",
            maxHeight: 200,
            overflowY: "auto",
          }}
        >
          {hoverInfo.type === "single" ? (
            <>
              <div>bin: {hoverInfo.bin}</div>
              <div>value: {hoverInfo.value.toFixed(2)}</div>
            </>
          ) : (
            <>
              <div>overlay range:</div>
              {hoverInfo.bins.map((b) => (
                <div key={b.bin}>
                  {b.bin}: {b.value.toFixed(2)}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}