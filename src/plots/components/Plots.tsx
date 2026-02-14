import React, { useEffect, useRef, useState } from "react";
import { useCanvas } from "../hooks/useCanvas";
import { useViewport } from "../hooks/useViewport";
import { FrameData, frameStore } from "../models/frameStore";
import { renderFrame } from "../renderer/renderFrame";

export default function WaveformWithAxis() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useCanvas(canvasRef);
    const viewport = useViewport();
    const latestFrame = useRef<FrameData | null>(null)

    useEffect(() => {
        const unsubscribe = frameStore.subscribe((frame) => {
            latestFrame.current = frame;
            draw();
        });
        return () => unsubscribe();
    }, []);

    const draw = () => {
        if (!latestFrame.current) return
        if (!ctxRef.current) return
        if (!canvasRef.current) return

        renderFrame(
            ctxRef.current,
            canvasRef.current,
            latestFrame.current,
            viewport
        )
    }

useEffect(() => {
  const canvas = canvasRef.current
  if (!canvas) return

  let isDragging = false
  let lastX = 0

  const down = (e: MouseEvent) => {
    isDragging = true
    lastX = e.clientX
  }

  const move = (e: MouseEvent) => {
    if (!isDragging) return

    const dx = e.clientX - lastX
    lastX = e.clientX

    viewport.onDrag(dx)
  }

  const up = () => {
    isDragging = false
  }

  canvas.addEventListener("mousedown", down)
  canvas.addEventListener("mousemove", move)
  canvas.addEventListener("mouseup", up)

  return () => {
    canvas.removeEventListener("mousedown", down)
    canvas.removeEventListener("mousemove", move)
    canvas.removeEventListener("mouseup", up)
  }
}, [viewport])


    useEffect(draw, [viewport.pxPerSample, viewport.offset])
    return <canvas 
        ref={canvasRef}
        style={{ width: "100%", height: "100%" }}
        onWheel={(e) => {viewport.onWheel(e, latestFrame.current?.samples.length || 0, canvasRef.current?.clientWidth || 0)}}
         />;
}