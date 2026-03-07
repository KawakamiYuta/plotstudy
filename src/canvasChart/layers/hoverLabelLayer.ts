import { Layer } from "../chart"
import { Viewport } from "../viewport"

export class HoverLabelLayer implements Layer {

  constructor(
    private view: Viewport,
    private data: number[],
    private mouseX: ()=>number|null
  ){}

  draw(ctx: CanvasRenderingContext2D) {

    const mx = this.mouseX()

    if (mx === null) return

    const bin =
      Math.floor(
        this.view.offset +
        mx / this.view.pxPerUnit
      )

    if (bin < 0 || bin >= this.data.length) return

    const value = this.data[bin]

    const text =
      `bin:${bin}  val:${value.toFixed(1)}`

    ctx.save()

    ctx.font = "12px monospace"

    const padding = 6

    const textWidth =
      ctx.measureText(text).width

    const w = textWidth + padding*2
    const h = 18

    ctx.fillStyle = "white"
    ctx.fillRect(10,10,w,h)

    ctx.fillStyle = "black"
    ctx.fillText(text,10+padding,22)

    ctx.restore()
  }
}