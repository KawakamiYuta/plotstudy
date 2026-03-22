import { FrameData } from "../../stores/frameStore"

export class WaterfallEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  private width = 0
  private height = 0

  private fftSize = 0
  private zmin = 0
  private zmax = 160

  private lut = new Uint8ClampedArray(256 * 3)

  // オフスクリーンバッファ
  private buffer!: HTMLCanvasElement
  private bufferCtx!: CanvasRenderingContext2D
  private lineHeight = 10

  // 過去のスペクトラムを保持するring buffer
  private historySize = 200
  private ring!: Float32Array
  private writeIndex = 0

  // X→FFT変換用のルックアップ
  private xmap!: Uint16Array

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas2D not supported")
    this.ctx = ctx

    this.buildLUT()
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    this.width = Math.floor(rect.width * dpr)
    this.height = Math.floor(rect.height * dpr)

    this.canvas.width = this.width
    this.canvas.height = this.height

    // オフスクリーンバッファを作成
    this.buffer = document.createElement("canvas")
    this.buffer.width = this.width
    this.buffer.height = this.height / this.lineHeight
    this.bufferCtx = this.buffer.getContext("2d")!

    // FFTサイズが既にある場合はXマップを更新
    if (this.fftSize > 0) this.buildXMap()

    // リサイズ時も全体を再描画
    this.drawWaterfall()
  }

  updateFromFrame(frame: FrameData) {
    const spectrum = frame.spectrum

    // 初回FFT設定
    if (this.fftSize === 0) {
      this.fftSize = spectrum.length
      this.ring = new Float32Array(this.historySize * this.fftSize)
      this.writeIndex = 0
      this.buildXMap()
    }

    // ring bufferに書き込み
    const offset = this.writeIndex * this.fftSize
    this.ring.set(spectrum, offset)
    this.writeIndex = (this.writeIndex + 1) % this.historySize
  }

  render() {
    this.drawWaterfall()
  }

private drawWaterfall() {
  if (!this.ring || !this.buffer) return

  const scale = 255 / (this.zmax - this.zmin)

  // バッファをクリア
  this.bufferCtx.clearRect(0, 0, this.width, this.height / this.lineHeight)

  const image = this.bufferCtx.createImageData(this.width, this.height / this.lineHeight)
  const data = image.data

  const rowsToDraw = Math.min(Math.floor(this.height / this.lineHeight), this.historySize)

  for (let y = 0; y < rowsToDraw; y++) {
    // const historyIndex = (this.writeIndex - rowsToDraw + y + this.historySize) % this.historySize
    const historyIndex = (this.writeIndex - 1 - y) % this.historySize
    console.log("xxx", y, historyIndex)

    const rowOffset = historyIndex * this.fftSize

    for (let x = 0; x < this.width; x++) {
      const src = this.xmap[x]
      const v = this.ring[rowOffset + src]
      const c = Math.max(0, Math.min(255, ((v - this.zmin) * scale) | 0))
      const lutIndex = c * 3
      const i = x * 4

      // const yyy = this.height / lineHeight - y
      data[y*this.width*4 + i]     = this.lut[lutIndex]
      data[y*this.width*4 + i + 1] = this.lut[lutIndex + 1]
      data[y*this.width*4 + i + 2] = this.lut[lutIndex + 2]
      data[y*this.width*4 + i + 3] = 255
    }

    // 1行を lineHeight に拡大して描画
    // this.bufferCtx.putImageData(image, 0, y*lineHeight)
    // this.bufferCtx.drawImage(
    //   this.buffer,
    //   0, 0, this.width, 1,                 // src
    //   0, y * lineHeight, this.width, lineHeight // dst
    // )
  }

  this.bufferCtx.putImageData(image, 0, 0)
  this.ctx.drawImage(this.buffer, 0, 0, this.width, this.height / this.lineHeight,
    0, 0, this.width, this.height
  )
  // this.ctx.drawImage(image, 0, 0)
  // オフスクリーンを画面にコピー
  // this.ctx.drawImage(this.buffer, 0, 0)
}

  // --------------------
  private buildXMap() {
    this.xmap = new Uint16Array(this.width)
    for (let x = 0; x < this.width; x++) {
      this.xmap[x] = Math.floor(x / this.width * this.fftSize)
    }
  }

  private buildLUT() {
    for (let i = 0; i < 256; i++) {
      const t = i / 255
      const r = Math.max(Math.min(1.5 - Math.abs(4 * t - 3), 1), 0)
      const g = Math.max(Math.min(1.5 - Math.abs(4 * t - 2), 1), 0)
      const b = Math.max(Math.min(1.5 - Math.abs(4 * t - 1), 1), 0)
      this.lut[i * 3]     = r * 255
      this.lut[i * 3 + 1] = g * 255
      this.lut[i * 3 + 2] = b * 255
    }
  }
}