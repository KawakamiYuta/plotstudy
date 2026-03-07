import { Layer } from "../chart"

export class ChartClipLayer implements Layer {

  constructor(
    private width:number,
    private height:number
  ) {}

  draw(ctx: CanvasRenderingContext2D) {

    ctx.save()

    ctx.beginPath()
    ctx.rect(0,0,this.width,this.height)
    ctx.clip()

  }

}