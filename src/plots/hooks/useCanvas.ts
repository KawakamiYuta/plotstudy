import React, { useEffect, useRef, RefObject } from "react";

export function useCanvas(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    ctxRef.current = ctx

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  return ctxRef
}
