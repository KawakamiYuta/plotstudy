import { Layer } from "../chart"
import { roundRect } from "../util/roundRect"
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
const binText = `x: ${bin}`
const valText = `y: ${value.toFixed(1)}`

  ctx.save()
  ctx.font = "12px monospace"

  const padding = 6
  const lineHeight = 14
const w = Math.max(
  ctx.measureText(binText).width,
  ctx.measureText(valText).width
) + padding*2
  const h = lineHeight*2 + padding*2

  let x = mx + 12
  let y = my + 12

  // --- キャンバスの右端に収める ---
  const canvas = ctx.canvas
  if (x + w > canvas.width) x = canvas.width - w - 4
  if (y + h > canvas.height) y = canvas.height - h - 4
  if (x < 0) x = 4
  if (y < 0) y = 4

  // shadow
  ctx.shadowColor = "rgba(0,0,0,0.35)"
  ctx.shadowBlur = 4
  ctx.shadowOffsetY = 2

  // background
  ctx.fillStyle = "rgba(30,30,30,0.9)"
  roundRect(ctx, x, y, w, h, 6)
  ctx.fill()

  ctx.shadowColor = "transparent"

  // text

  ctx.fillStyle = "#fff"
//   ctx.fillText(text, x + padding, y + 13)
ctx.fillText(binText, x + padding, y + padding + lineHeight - 2)
ctx.fillText(valText, x + padding, y + padding + lineHeight*2 - 2)
  ctx.restore()
}

}