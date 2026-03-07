import { Layer } from "../chart"
import { Viewport } from "../viewport"

export class HoverBinLabelLayer implements Layer {

  constructor(
    private view: Viewport,
    private data: number[],
    private mouseX: ()=>number|null,
    private mouseY: ()=>number|null
  ) {}

  draw(ctx: CanvasRenderingContext2D) {

    const mx = this.mouseX()
    const my = this.mouseY()

    if (mx === null || my === null) return

    const bin =
      Math.round(
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
    const w =
      ctx.measureText(text).width +
      padding*2
    const h = 18

    const x = mx + 12
    const y = my + 12

    ctx.fillStyle = "white"
    ctx.fillRect(x,y,w,h)

    ctx.fillStyle = "black"
    ctx.fillText(text,x+padding,y+13)

    ctx.restore()

  }
}