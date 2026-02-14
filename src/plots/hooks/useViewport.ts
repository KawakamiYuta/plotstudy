import { useState } from "react";

export function useViewport() {
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState(0)

  const onWheel = (e: WheelEvent) => {
    e.preventDefault()
    setZoom(z => Math.min(Math.max(z * (e.deltaY < 0 ? 1.1 : 0.9), 1), 100))
  }

  const onDrag = (dx: number) => {
    setOffset(o => o - dx * zoom)
  }

  return {
    zoom,
    offset,
    onWheel,
    onDrag
  }
}
