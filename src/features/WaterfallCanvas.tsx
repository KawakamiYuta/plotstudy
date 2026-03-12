import React, { useEffect, useRef } from "react";
import { FrameData, frameStore } from "../stores/frameStore";
import { WaterfallEngine } from "../engine/canvas-engine/WaterfallEngine";

export default function WaterfallCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<WaterfallEngine | null>(null)

  const latestFrame = useRef<FrameData | null>(null)

  useEffect(() => {
    if (!canvasRef.current || engineRef.current) return
    engineRef.current = new WaterfallEngine(canvasRef.current)
  }, [])

  useEffect(() => {
    const unsubscribe =
      frameStore.subscribe((frame) => {
        latestFrame.current = frame
        const engine = engineRef.current
        if (!engine) return

        console.log("push frame")
        engine.resize()
        engine.pushFrame(frame.spectrum)
        // engine.render()
      })
    return unsubscribe
  }, [])

//   useEffect(()=>{

//   const canvas = canvasRef.current
//   if(!canvas) return

//   const observer =
//     new ResizeObserver(()=>{

//       engineRef.current?.resize()
//       engineRef.current?.render()

//     })

//   observer.observe(canvas)

//   return ()=>observer.disconnect()

// },[])
// useEffect(() => {
//   const handler = () => {
//     console.log("layout change")
//     engineRef.current?.resize()
//     engineRef.current?.render()
//   }

//   window.addEventListener("layout-changed", handler)

//   return () => window.removeEventListener("layout-changed", handler)
// }, [])
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