import { Layer } from "../chart"

export class HoverValueLabelLayer implements Layer {

  constructor(
    private mouseY: ()=>number|null,
    private marginLeft:number,
    private height:number,
    private maxValue:number
  ) {}

  draw(ctx: CanvasRenderingContext2D) {

    const my = this.mouseY()

    if (my === null) return

    const normalized =
      1 - my / this.height

    const value =
      normalized * this.maxValue

    const text =
      value.toFixed(1)

    ctx.save()

    ctx.font = "12px monospace"

    const w =
      ctx.measureText(text).width + 10
    const h = 16

    const x =
      this.marginLeft - w - 4

    const y =
      my - h/2

    ctx.fillStyle = "white"
    ctx.fillRect(x,y,w,h)

    ctx.fillStyle = "black"
    ctx.fillText(text,x+5,y+12)

    ctx.restore()

  }
}