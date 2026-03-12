import React, { useEffect, useRef } from "react";

import { FrameData, frameStore } from "../stores/frameStore";
import { ChartEngine } from "../engine/canvas-engine/ChartEngine";
import { useWaveformDialogStore } from "../stores/useWaveformDialogStore";
import { useLayoutStore } from "../stores/useLayoutStore"

export default function SpectrumPlot() {
  const { addTab } = useLayoutStore()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<ChartEngine | null>(null)

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
useEffect(() => {
  const handler = () => {
    console.log("layout change")
    engineRef.current?.resize()
    engineRef.current?.render()
  }

  window.addEventListener("layout-changed", handler)

  return () => window.removeEventListener("layout-changed", handler)
}, [])
  return (

    // <div
    //   style={{
    //     position:"relative",
    //     width:"100%",
    //     height:"100%"
    //   }}
    // >
    //   <button className = "execute-open"
    //     onClick={() => {
    //       if (!isOpen && latestFrame.current) {
    //         // open(latestFrame.current.samples || []);
    //         addTab({name: "Waveform", component: "waveform", 
    //           config: { data: latestFrame.current.samples }})
    //       }
    //     }}
    //   >
    //     Open Waveform
    //   </button>

      <canvas
        ref={canvasRef}
        style={{
          width:"100%",
          height:"100%",
          display: "block"
        }}
      />
    // </div>
  )
}