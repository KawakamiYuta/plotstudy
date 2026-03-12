import { Viewport } from "../viewport"
import { roundRect } from "../util/roundRect"

export class HoverLabelLayer {

  constructor(
    private view: Viewport,
    private data: number[],
    private mouseX: ()=>number|null,
    private mouseY: ()=>number|null
  ){}

  draw(ctx: CanvasRenderingContext2D){

    const mx = this.mouseX()
    const my = this.mouseY()

    if(mx===null || my===null) return

    const bin =
      Math.floor(
        this.view.offset +
        mx / this.view.pxPerUnit
      )

    if(bin < 0 || bin >= this.data.length) return

    const value = this.data[bin]

    const lines = [
      `bin   ${bin}`,
      `value ${value.toFixed(2)}`
    ]

    ctx.save()

    ctx.font = "12px monospace"

    const padding = 6
    const lineHeight = 14

    const width =
      Math.max(
        ...lines.map(
          l=>ctx.measureText(l).width
        )
      ) + padding*2

    const height =
      lines.length*lineHeight +
      padding*2

    const x = mx + 12
    const y = my + 12

    // shadow
    ctx.shadowColor = "rgba(0,0,0,0.35)"
    ctx.shadowBlur = 4
    ctx.shadowOffsetY = 2

    // background
    ctx.fillStyle = "rgba(30,30,30,0.9)"

    roundRect(
      ctx,
      x,
      y,
      width,
      height,
      6
    )

    ctx.fill()

    ctx.shadowColor = "transparent"

    // text
    ctx.fillStyle = "#fff"

    lines.forEach((line,i)=>{

      ctx.fillText(
        line,
        x + padding,
        y + padding + lineHeight*(i+0.8)
      )

    })

    ctx.restore()
  }
}