import { useState } from "react"
import type { WheelEvent as ReactWheelEvent } from "react"

export function useViewport() {
  const [pxPerUnit, setpxPerUnit] = useState(1)
  const [offset, setOffset] = useState(0)

const onWheel = (e: ReactWheelEvent<HTMLCanvasElement>, totalSamples: number, canvasWidth: number) => {
  // e.preventDefault();

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

    // // 🔹 offset 補正（マウス中心固定）
    // setOffset(prevOffset => {
    //   const sampleIndex = prevOffset + mouseX / prev;
    //   let newOffset = sampleIndex - mouseX / newPx;

    //   // 🔹 左右端で clamp
    //   const maxOffset = Math.max(totalSamples - visibleSamples, 0);
    //   if (newOffset < 0) newOffset = 0;
    //   if (newOffset > maxOffset) newOffset = maxOffset;

    //   return newOffset;
    // });

    return newPx;
  });
};


const onDrag = (dx: number) => {
  setOffset(prev => prev - dx / pxPerUnit)
}

  return {
    pxPerUnit,
    offset,
    onWheel,
    onDrag
  }
}
