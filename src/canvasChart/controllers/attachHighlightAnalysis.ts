import { ChartTransform } from "../chartTransform"
import { Viewport } from "../viewport"

export type HighlightRange = {
  start: number
  end: number
}

export function attachHighlightAnalysis(
  canvas: HTMLCanvasElement,
  view: Viewport,
  transform: ChartTransform,
  getHighlights: () => HighlightRange[] | null,
  enterAnalysis: (range: HighlightRange) => void,
  exitAnalysis: () => void,
  requestRender: () => void
) {

  canvas.addEventListener("dblclick", (e) => {
    const ranges = getHighlights()
    if (!ranges || ranges.length === 0) return

    const canvasX = transform.canvasToChartX(e.clientX)
    const bin = transform.chartToBin(canvasX)

    for (const range of ranges) {
      const width = range.end - range.start
      if (width <= 0) continue

      if (bin >= range.start && bin <= range.end) {
        enterAnalysis(range)
        requestRender()
        return
      }
    }
  })

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      exitAnalysis()
      requestRender()
    }
  })
}