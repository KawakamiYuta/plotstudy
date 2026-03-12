export class WaterfallEngine {

  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  width = 0
  height = 0

  maxValue = 200

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
  }

  resize() {

    const rect = this.canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr

    this.ctx.setTransform(dpr,0,0,dpr,0,0)

    this.width = rect.width
    this.height = rect.height
  }

  pushFrame(series: number[]) {

    const ctx = this.ctx

    // scroll
    ctx.drawImage(
      this.canvas,
      0,
      1,
      this.width,
      this.height-1,
      0,
      0,
      this.width,
      this.height-1
    )

    // draw new row
    const binWidth = this.width / series.length

    for(let i=0;i<series.length;i++){

      const v = series[i]

      ctx.fillStyle = this.color(v)

      ctx.fillRect(
        i * binWidth,
        this.height - 1,
        binWidth,
        1
      )
    }
  }

  color(v:number){

    const t = Math.min(1, v / this.maxValue)

    const r = 255 * t
    const g = 180 * (1-Math.abs(t-0.5)*2)
    const b = 255 * (1-t)

    return `rgb(${r},${g},${b})`
  }

}