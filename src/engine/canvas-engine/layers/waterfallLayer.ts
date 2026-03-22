import { Layer } from "../chart"
import { Viewport } from "../viewport"

export class WaterfallLayer implements Layer {
  private buffer!: HTMLCanvasElement
  private bufferCtx!: CanvasRenderingContext2D
  private lineHeight = 10

  constructor(
    private data: Float32Array,
    private view: Viewport,
    private width: number,
    private height: number,
    private zmin: number,
    private zmax: number,
  ) {

    // オフスクリーンバッファを作成
    this.buffer = document.createElement("canvas")
    this.buffer.width = this.width
    this.buffer.height = this.height / this.lineHeight
    this.bufferCtx = this.buffer.getContext("2d")!
  }

  draw(ctx: CanvasRenderingContext2D) {
  const scale = 255 / (this.zmax - this.zmin)
  this.bufferCtx.clearRect(0, 0, this.width, this.height / this.lineHeight)

  const image = this.bufferCtx.createImageData(this.width, this.height / this.lineHeight)
  const data = image.data

  const rowsToDraw = Math.min(Math.floor(this.height / this.lineHeight), this.historySize)
  }
}