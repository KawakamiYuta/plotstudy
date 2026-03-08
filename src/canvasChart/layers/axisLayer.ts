import { Layer } from "../chart"
import { Viewport } from "../viewport"

export class AxisLayer implements Layer {

  constructor(
    private marginLeft: number,
    private marginTop: number,
    private marginBottom: number,
    private width: number,
    private height: number,
    private view: Viewport,
    private maxValue: number,
    private xStep: number,
    private yStep: number
  ) {}

  draw(ctx: CanvasRenderingContext2D) {
    this.xStep = Math.ceil(computeLabelStep(this.xStep, this.view.pxPerUnit))

    ctx.save()

    ctx.fillStyle = "white"
    ctx.font = "12px monospace"

    const chartBottom =
      this.marginTop + this.height

    // ----- Y axis -----

    ctx.textAlign = "right"
    ctx.textBaseline = "middle"

    const yTicks =
      Math.floor(this.maxValue / this.yStep)

    for (let i = 0; i <= yTicks; i++) {

      const value =
        this.maxValue - i * this.yStep

      const y =
        this.marginTop +
        (this.height / yTicks) * i

      ctx.fillText(
        value.toFixed(0),
        this.marginLeft - 6,
        y
      )
    }

    // ----- X axis -----

    ctx.textAlign = "center"
    ctx.textBaseline = "top"

    const visible =
      Math.ceil(this.width / this.view.pxPerUnit)

    const start =
      Math.floor(this.view.offset)

    const first =
      Math.ceil(start / this.xStep) * this.xStep

    for (let i = first; i < start + visible; i += this.xStep) {

      const x =
        this.marginLeft +
        (i - this.view.offset) *
        this.view.pxPerUnit

      ctx.fillText(
        i.toString(),
        x + this.view.pxPerUnit / 2,
        chartBottom + 4
      )
    }

    ctx.restore()
  }
}

function computeLabelStep(minLabelIntervalPx: number, pxPerUnit:number){
  const units = minLabelIntervalPx / pxPerUnit

  const pow = Math.pow(10, Math.floor(Math.log10(units)))

  const steps = [1,2,5,10]

  for(const s of steps){
    const step = s * pow
    if(step >= units) return step
  }

  return 10 * pow
}