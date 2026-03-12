import { Layer } from "../chart"
import { Viewport } from "../viewport"

export class HighlightLayer implements Layer {

  constructor(
    private start: number,
    private end: number,
    private view: Viewport,
    private height: number,
    private color="rgba(0,255,0,0.15)"
  ) {}

  draw(ctx: CanvasRenderingContext2D) {
    const x0 = (this.start - this.view.offset) * this.view.pxPerUnit
    const x1 = (this.end - this.view.offset) * this.view.pxPerUnit

    ctx.save()
    ctx.fillStyle = this.color
    ctx.fillRect(x0,0,x1-x0,this.height)
    ctx.restore()
  }
}