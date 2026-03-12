import { Layer } from "../chart"
import { roundRect } from "../util/roundRect"

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

    const padding = 6
    const textW =
      ctx.measureText(text).width

    const w = textW + padding*2
    const h = 18

    const x =
      this.marginLeft - w - 8

    const y =
      my - h/2

    // shadow
    ctx.shadowColor = "rgba(0,0,0,0.35)"
    ctx.shadowBlur = 4
    ctx.shadowOffsetY = 2

    // background
    ctx.fillStyle = "rgba(30,30,30,0.9)"

    roundRect(ctx,x,y,w,h,4)
    ctx.fill()

    ctx.shadowColor = "transparent"

    // text
    ctx.fillStyle = "#fff"

    ctx.fillText(
      text,
      x + padding,
      y + h*0.7
    )

    ctx.restore()
  }

}
