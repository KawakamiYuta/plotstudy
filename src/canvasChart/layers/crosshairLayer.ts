import { Layer } from "../chart"

export class CrosshairLayer implements Layer {

  mouseX: number | null = null
  mouseY: number | null = null
  width: number
  height: number

  constructor(width:number,height:number){
    this.width = width
    this.height = height
  }

  draw(ctx: CanvasRenderingContext2D) {

    if (this.mouseX === null || this.mouseY === null) return

    ctx.save()

    ctx.strokeStyle = "#aaaaaa44"

    ctx.beginPath()

    ctx.moveTo(this.mouseX,0)
    ctx.lineTo(this.mouseX,this.height)

    ctx.moveTo(0,this.mouseY)
    ctx.lineTo(this.width,this.mouseY)

    ctx.stroke()

    ctx.restore()
  }
}