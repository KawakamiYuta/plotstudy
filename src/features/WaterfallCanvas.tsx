import { useRef } from "react"

import { useFrameRenderEngine } from "../hooks/useFrameRenderEngine"
import { WaterfallEngine } from "../engine/canvas-engine/WaterfallEngine"

export default function WaterfallCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useFrameRenderEngine(canvasRef, WaterfallEngine)

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