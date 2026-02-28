import { useState, useEffect } from "react"
import type { WheelEvent as ReactWheelEvent } from "react"

// keep the last values globally so they survive unmount/mount
let persistentPxPerUnit = 1
let persistentOffset = 0

export function useViewport() {
  const [pxPerUnit, setpxPerUnit] = useState(persistentPxPerUnit)
  const [offset, setOffset] = useState(persistentOffset)

  // synchronize globals whenever state changes
  useEffect(() => {
    persistentPxPerUnit = pxPerUnit
  }, [pxPerUnit])
  useEffect(() => {
    persistentOffset = offset
  }, [offset])

  const onWheel = (e: ReactWheelEvent<HTMLCanvasElement>, totalSamples: number, canvasWidth: number) => {
    // e.preventDefault(); // caller already calls if desired

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    const scale = e.deltaY < 0 ? 1.1 : 0.9;

    setpxPerUnit(prev => {
      let newPx = Math.max(prev * scale, 0.1);

      // 🔹 画面に見えるサンプル数
      const visibleSamples = canvasWidth / newPx;

      // 🔹 全サンプルを表示できる最小ズーム
      const minPx = canvasWidth / totalSamples;
      if (newPx < minPx) newPx = minPx;

      return newPx;
    });
  };

  const onDrag = (dx: number) => {
    setOffset(prev => prev - dx / pxPerUnit)
  }

  // useful helper to keep offset within valid range when the data length or canvas width changes
  const clampOffset = (totalSamples: number, canvasWidth: number) => {
    const visible = canvasWidth / pxPerUnit;
    const maxOffset = Math.max(totalSamples - visible, 0);
    if (offset < 0) setOffset(0);
    else if (offset > maxOffset) setOffset(maxOffset);
  };

  /**
   * Zooms the viewport such that [start..end) bins fill the given canvas width.
   * Adjusts pxPerUnit and offset accordingly.
   */
  const zoomToRange = (start: number, end: number, canvasWidth: number) => {
    const range = Math.max(end - start, 1);
    const newPx = canvasWidth / range;
    setpxPerUnit(prev => {
      const minPx = canvasWidth / 100000; // prevent absurd values
      return Math.max(newPx, minPx);
    });
    setOffset(start);
  };

  const setViewport = (newOffset: number, newPx: number) => {
    setOffset(newOffset);
    setpxPerUnit(newPx);
  };

  return {
    pxPerUnit,
    offset,
    onWheel,
    onDrag,
    clampOffset,
    zoomToRange,
    setViewport
  }
}
