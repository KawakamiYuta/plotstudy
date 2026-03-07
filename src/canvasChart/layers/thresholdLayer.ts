import { Layer } from "../chart"

export class ThresholdLayer implements Layer {

  constructor(
    private threshold: number,
    private maxValue: number,
    private width: number,
    private height: number,
  ) {}

  draw(ctx: CanvasRenderingContext2D) {

    const y =
      this.height -
      (this.threshold / this.maxValue) * this.height

    ctx.save()

    ctx.strokeStyle = "#ffeb3b"

    ctx.beginPath()
    ctx.moveTo(0,y)
    ctx.lineTo(this.width,y)
    ctx.stroke()

    ctx.restore()
  }
}