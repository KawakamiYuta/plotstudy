import { FrameData } from "../../stores/frameStore"
import { WaterfallRingBuffer } from "./waterfallRingBuffer"

import { CrosshairLayer } from "./layers/crosshairLayer"
import { attachMouseTracker } from "./controllers/attachMouseTracker"
import { ChartTransform } from "./chartTransform"
import { HoverXyLabelLayer } from "./layers/hoverXyLabelLayer"

export type WfBBox = {
  bin0: number   // FFT index start
  bin1: number   // FFT index end
  t0: number   // row start (最新=0)
  t1: number   // row end
}

export class WaterfallEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  private width = 0
  private height = 0

  private fftSize = 0
  private wfRing : WaterfallRingBuffer | null = null;
  private zmin = 0
  private zmax = 160

  private lut = new Uint8ClampedArray(256 * 3)

  // オフスクリーンバッファ
  private buffer!: HTMLCanvasElement
  private bufferCtx!: CanvasRenderingContext2D
  private lineHeight = 10

  // // 過去のスペクトラムを保持するring buffer
  // private historySize = 200
  // private ring!: Float32Array
  // private writeIndex = 0

  private margin = { left: 0, right: 0, top: 0, bottom: 0}
  private viewport = { pxPerUnit: 2, offset: 0 }
  private crosshair: CrosshairLayer
  private transform: ChartTransform

  // X→FFT変換用のルックアップ
  private xmap!: Uint16Array
  private boxes: WfBBox[] = [
    { bin0: 394, bin1: 429, t0: 40, t1: 80}]

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas2D not supported")
    this.ctx = ctx

    this.transform = new ChartTransform(
      canvas.width, canvas.height, this.margin, this.viewport
    )
      this.crosshair = new CrosshairLayer(
        canvas.width, canvas.height
    )
    attachMouseTracker(canvas, this.crosshair, this.transform, () => this.render())

    this.buildLUT()
  }

  setBoxes(boxes: WfBBox[]) {
    this.boxes = boxes
  }

private binToX(bin: number) {
  return bin / this.fftSize * this.width
}

private timeToY(time: number) {
  return time * this.lineHeight
}

private drawBBox(box: WfBBox) {
  const x0 = this.binToX(box.bin0)
  const x1 = this.binToX(box.bin1)

  const newest = this.wfRing?.getNewestFrameNo() ?? 0
  const y0 = this.timeToY(newest - box.t0)
  const y1 = this.timeToY(newest - box.t1)

  // if (y0 < 0 || y1 < 0) return
  const w = x1 - x0
  const h = y1 - y0

  // 半透明塗り
  // this.ctx.fillStyle = "rgba(255, 255, 255, 0.52)"
  // this.ctx.fillRect(x0, y0, w, h)

// 塗り
this.ctx.fillStyle = "rgba(255,0,0,0.15)"
this.ctx.fillRect(x0,y0,w,h)

// 白縁
this.ctx.lineWidth = 4
this.ctx.strokeStyle = "white"
this.ctx.strokeRect(x0,y0,w,h)

// 本枠
this.ctx.lineWidth = 2
this.ctx.strokeStyle = "red"
this.ctx.strokeRect(x0,y0,w,h)
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    this.width = Math.floor(rect.width * dpr)
    this.height = Math.floor(rect.height * dpr)

    this.canvas.width = this.width
    this.canvas.height = this.height

    this.transform.resize(this.width, this.height)
    this.crosshair.width = this.canvas.width
    this.crosshair.height = this.canvas.height

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

    if(!this.wfRing) {
      this.wfRing = new WaterfallRingBuffer(spectrum.length, 200)
    }
    // 初回FFT設定
    if (this.fftSize === 0) {
      this.fftSize = spectrum.length
      // this.ring = new Float32Array(this.historySize * this.fftSize)
      // this.writeIndex = 0
      this.buildXMap()
    }

    this.wfRing.push(frame.frame_number, new Float32Array(spectrum))

    // // ring bufferに書き込み
    // const offset = this.writeIndex * this.fftSize
    // this.ring.set(spectrum, offset)
    // this.writeIndex = (this.writeIndex + 1) % this.historySize
  }

  render() {
  if (!this.wfRing || !this.buffer) return
    this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight)
    this.drawWaterfall()

    for(const box of this.boxes) {
      this.drawBBox(box)
    }

    const visibleRow = Math.floor(this.height / this.lineHeight)
   const rowsToDraw = Math.min(this.wfRing.size(), visibleRow)
   const yOffset = Math.max(0, this.wfRing.size() - rowsToDraw)

    let hover = new HoverXyLabelLayer(
      () => this.crosshair.mouseX,
      () => this.crosshair.mouseY,
      (v) => this.xmap[v],
      (v) => (this.wfRing?.getNewestFrameNo() ?? 0) - Math.round(v / this.lineHeight)
    )
    hover.draw(this.ctx);
  }

private drawWaterfall() {
  if (!this.wfRing || !this.buffer) return

  const scale = 255 / (this.zmax - this.zmin)
  this.bufferCtx.clearRect(0, 0, this.width, this.height / this.lineHeight)

  const image = this.bufferCtx.createImageData(this.width, this.height / this.lineHeight)
  const data = image.data

  const visibleRow = Math.floor(this.height / this.lineHeight)
  const rowsToDraw = Math.min(this.wfRing.size(), visibleRow)
  const yOffset = Math.max(0, this.wfRing.size() - rowsToDraw)
  
  for (let y = 0; y < rowsToDraw; y++) {
    const row = this.wfRing.getRow(y)
    // const historyIndex = (this.writeIndex - rowsToDraw + y + this.historySize) % this.historySize
    // const historyIndex = (this.writeIndex - 1 - y) % this.historySize
    // console.log("xxx", y, historyIndex)

    // const rowOffset = historyIndex * this.fftSize

    for (let x = 0; x < this.width; x++) {
      const src = this.xmap[x]
      // const v = this.ring[rowOffset + src]
      const v = row[src]
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