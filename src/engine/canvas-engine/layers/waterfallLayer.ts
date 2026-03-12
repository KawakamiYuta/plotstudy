import { Layer } from "../chart"
import { Viewport } from "../viewport"

export class WaterfallLayer implements Layer {

  history: number[][]
  viewport: Viewport
  chartWidth: number
  chartHeight: number
  maxValue: number

  constructor(
    history: number[][],
    viewport: Viewport,
    chartWidth: number,
    chartHeight: number,
    maxValue: number
  ) {
    this.history = history
    this.viewport = viewport
    this.chartWidth = chartWidth
    this.chartHeight = chartHeight
    this.maxValue = maxValue
  }

  draw(ctx: CanvasRenderingContext2D) {

    const rows = this.history.length
    if (rows === 0) return

    const rowHeight = this.chartHeight / rows

    for (let y = 0; y < rows; y++) {

      const frame = this.history[rows - 1 - y]   // 新しいデータを下に

      for (let i = 0; i < frame.length; i++) {

        const x = (i - this.viewport.offset) * this.viewport.pxPerUnit
        const w = this.viewport.pxPerUnit

        if (x + w < 0 || x > this.chartWidth) continue

        const value = frame[i]

        ctx.fillStyle = this.color(value)

        ctx.fillRect(
          x,
          this.chartHeight - (y + 1) * rowHeight,
          w,
          rowHeight
        )
      }
    }
  }

  color(v: number) {

    const t = Math.max(0, Math.min(1, v / this.maxValue))

    const r = 255 * t
    const g = 180 * (1 - Math.abs(t - 0.5) * 2)
    const b = 255 * (1 - t)

    return `rgb(${r},${g},${b})`
  }
}