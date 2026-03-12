import { Layer } from "../chart"
import { Viewport, visibleRange } from "../viewport"

export type SeriesType = "bar" | "line"

export class SeriesLayer implements Layer {

  constructor(
    private data: number[],
    private view: Viewport,
    private width: number,
    private height: number,
    private maxValue: number,
    private type: SeriesType = "bar",
    private colorFn?: (i:number,v:number)=>string
  ) {}

  draw(ctx: CanvasRenderingContext2D) {

    const { start, end } =
      visibleRange(
        this.data.length,
        this.width,
        this.view
      )

    const barWidth =
      this.view.pxPerUnit * 0.9

    ctx.save()

    if (this.type === "line")
      ctx.beginPath()

    for (let i = start; i < end; i++) {

      const v = this.data[i]

      const normalized =
        Math.min(1, Math.max(0, v / this.maxValue))

      const x =
        (i - this.view.offset) *
        this.view.pxPerUnit

      const h =
        this.height * normalized

      const y =
        this.height - h

      if (this.colorFn) {
        ctx.fillStyle = this.colorFn(i,v)
        ctx.strokeStyle = this.colorFn(i,v)
      }

      if (this.type === "bar") {

        ctx.fillRect(x, y, barWidth, h)

      } else {

        if (i === start)
          ctx.moveTo(x,y)
        else
          ctx.lineTo(x,y)

      }

    }

    if (this.type === "line")
      ctx.stroke()

    ctx.restore()

  }
}