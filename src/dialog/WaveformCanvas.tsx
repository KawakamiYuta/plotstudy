import { useEffect, useRef } from "react"
import { WaveChartEngine } from "../canvasChart/WaveChartEngine"

type Props = {
  data: number[]
}

export function WaveCanvas({ data }: Props) {
const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<WaveChartEngine | null>(null)

useEffect(() => {
    console.log("WaveCanvas mounted")
  const canvas = canvasRef.current
  if (!canvas) return

  console.log("Initializing WaveChartEngine")

  const engine = new WaveChartEngine(canvas)
  engineRef.current = engine

  console.log("Setting series data and rendering", data)
  engine.setSeries(data)
  engine.render()

  return () => {
    console.log("Cleaning up WaveCanvas")
    engineRef.current = null
  }

}, [])

// useEffect(()=>{

//   const canvas = canvasRef.current
//   if(!canvas) return

//   const parent = canvas.parentElement
//   if(!parent) return

//   const observer =
//     new ResizeObserver(()=>{

//       engineRef.current?.resize()
//       engineRef.current?.render()

//     })

//   observer.observe(parent)

//   return ()=>observer.disconnect()

// },[])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%" }}
    />
  )
}