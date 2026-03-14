import { useEffect, RefObject, useRef } from "react"

import { frameStore, FrameData } from "../stores/frameStore"
// import { ChartEngine } from "../engine/canvas-engine/ChartEngine"
import { useResizeObserver } from "./useResizeObserver"

export function useFrameRenderEngine<E extends {
  updateFromFrame(frame: FrameData): void
  render(): void
  resize(): void
}>(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  Engine: new (canvas: HTMLCanvasElement) => E
) {

  const engineRef = useRef<E | null>(null)

  useEffect(() => {

    const canvas = canvasRef.current
    if (!canvas || engineRef.current) return

    engineRef.current = new Engine(canvas)

  }, [])


  useEffect(() => {

    const unsubscribe = frameStore.subscribe((frame) => {

      const engine = engineRef.current
      if (!engine) return

      engine.updateFromFrame(frame)
      engine.render()

    })

    return unsubscribe

  }, [])

  useResizeObserver(canvasRef, () => {

    const engine = engineRef.current
    if (!engine) return

    engine.resize()
    engine.render()

  })
}