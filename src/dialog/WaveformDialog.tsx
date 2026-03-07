import { useEffect, useRef } from "react"
import { useWaveformDialogStore } from "../stores/useWaveformDialogStore"
import { drawGrid, drawWaveform } from "./drawWaveform"

export default function WaveformDialog() {
  const {
    isOpen,
    data,
    sampleRate,
    viewport,
    close,
  } = useWaveformDialogStore()

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!isOpen || !data) return

    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!

    const width = canvas.width
    const height = canvas.height

    drawGrid(
      ctx,
      width,
      height,
      viewport,
      sampleRate,
      data.length
    )

    drawWaveform(
      ctx,
      data,
      viewport,
      width,
      height
    )
  }, [isOpen, data, viewport, sampleRate])

  if (!isOpen || !data) return null

  return (
    <div style={overlayStyle}>
      <div style={dialogStyle}>
        <button onClick={close}>close</button>
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
        />
      </div>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}

const dialogStyle: React.CSSProperties = {
  background: "#111",
  padding: 16,
}