import { ChartTransform } from "../chartTransform"

export function attachBinSelection(
  canvas: HTMLCanvasElement,
  transform: ChartTransform,
  getMode: () => string,
  getAnalysisRange: () => { start: number; end: number } | null,
  setSelectedBin: (bin: number) => void,
  requestRender: () => void
) {

  canvas.addEventListener("click", (e) => {

    if (getMode() !== "analysis") return

    const range = getAnalysisRange()
    if (!range) return

    // const rect = canvas.getBoundingClientRect()
    // const x = e.clientX - rect.left

    const bin = transform.canvasToBin(e.clientX)

    if (bin < range.start || bin > range.end) return

    console.log("Selected bin:", bin)
    setSelectedBin(bin)

    requestRender()
  })

}