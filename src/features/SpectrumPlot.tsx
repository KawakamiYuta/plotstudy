import React, { useRef } from "react"

import { useFrameRenderEngine } from "../hooks/useFrameRenderEngine"
import { ChartEngine } from "../engine/canvas-engine/ChartEngine"

export default function SpectrumPlot() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useFrameRenderEngine(canvasRef, ChartEngine)

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block"
      }}
    />
  )
}
