import { Layer } from "../chart"
import { Viewport } from "../viewport"

export class GridLayer implements Layer {

  constructor(
    private width: number,
    private height: number,
    private view: Viewport,
    private xStep: number,
    private yStep: number
  ) {}

  draw(ctx: CanvasRenderingContext2D) {

    ctx.save()

    ctx.strokeStyle = "#333"

    ctx.strokeRect(0,0,this.width,this.height)

    ctx.beginPath()

    // horizontal lines
    for (let y = 0; y <= this.height; y += this.yStep) {

      ctx.moveTo(0, y)
      ctx.lineTo(this.width, y)

    }

    // vertical lines

    const visible =
      Math.ceil(this.width / this.view.pxPerUnit)

    const start =
      Math.floor(this.view.offset)

    const first =
      Math.ceil(start / this.xStep) * this.xStep

    for (let i = first; i < start + visible; i += this.xStep) {

      const x =
        (i - this.view.offset) *
        this.view.pxPerUnit

      ctx.moveTo(x, 0)
      ctx.lineTo(x, this.height)

    }

    ctx.stroke()

    ctx.restore()

  }
}