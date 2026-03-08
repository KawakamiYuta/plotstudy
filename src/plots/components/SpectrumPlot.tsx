import React, { useEffect, useRef } from "react";
import { FrameData, frameStore } from "../models/frameStore";
import { useViewport } from "../hooks/useViewport";
import { ChartEngine } from "../../canvasChart/ChartEngine";
import { WaveformManager } from "./WaveformManager";
import { useWaveformDialogStore } from "../../stores/useWaveformDialogStore";

interface SpectrumOnlyProps {}

export default function SpectrumPlot(_props: SpectrumOnlyProps) {

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<ChartEngine | null>(null)

  const viewport = useViewport()
  const latestFrame = useRef<FrameData | null>(null)

  const {isOpen, open} = useWaveformDialogStore.getState()
  useEffect(() => {
    if (!canvasRef.current || engineRef.current) return
    engineRef.current = new ChartEngine(canvasRef.current)
  }, [])

  useEffect(() => {
    const unsubscribe =
      frameStore.subscribe((frame) => {
        latestFrame.current = frame
        const engine = engineRef.current
        if (!engine) return

        engine.setSeries(frame.spectrum)
        engine.setBins(frame.analysis_bins || [])
        engine.setThreshold(frame.threshold || 0)
        engine.setHighlightRanges(frame.highlight_range ? 
          [frame.highlight_range] : [])
        const bandDict = 
        frame.overlay_bins_by_center ? Object.fromEntries(
          Object.entries(frame.overlay_bins_by_center).map(([center, bins]) => [
            center, { start: Math.min(...bins), end: Math.max(...bins) }
          ])
        ) : null
        if (bandDict) engine.setBandDict(bandDict)
        engine.render()
      })
    return unsubscribe
  }, [])

  useEffect(()=>{

  const canvas = canvasRef.current
  if(!canvas) return

  const observer =
    new ResizeObserver(()=>{

      engineRef.current?.resize()
      engineRef.current?.render()

    })

  observer.observe(canvas)

  return ()=>observer.disconnect()

},[])

  const onWheel =
    (e:React.WheelEvent<HTMLCanvasElement>) => {

      const frame = latestFrame.current
      const canvas = canvasRef.current

      if (!frame || !canvas) return

      viewport.onWheel(
        e,
        frame.spectrum.length,
        canvas.clientWidth
      )

      engineRef.current?.render()

  }

  return (

    <div
      style={{
        position:"relative",
        width:"100%",
        height:"100%"
      }}
    >
      <button className = "execute-open"
        onClick={() => {
          if (!isOpen && latestFrame.current) {
            open(latestFrame.current.samples || []);
          }
        }}
      >
        Open Waveform
      </button>

      <canvas
        ref={canvasRef}
        style={{
          width:"100%",
          height:"100%"
        }}
        onWheel={onWheel}
      />
    </div>
  )
}