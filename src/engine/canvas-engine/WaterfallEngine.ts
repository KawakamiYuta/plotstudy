import { FrameData } from "../../stores/frameStore"

export class WaterfallEngine {

  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  private width = 0
  private height = 0

  private historySize = 1024
  private fftSize = 0

  private ring!: Float32Array
  private writeIndex = 0

  private zmin = 0
  private zmax = 160

  private lut = new Uint8ClampedArray(256 * 3)

  constructor(canvas: HTMLCanvasElement) {

    this.canvas = canvas

    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas2D not supported")

    this.ctx = ctx

    this.buildLUT()
  }

  updateFromFrame(frame: FrameData) {

    const spectrum = frame.spectrum

    if (this.fftSize !== spectrum.length) {

      this.fftSize = spectrum.length
      this.ring = new Float32Array(this.historySize * this.fftSize)
      this.writeIndex = 0
    }

    const offset = this.writeIndex * this.fftSize
    this.ring.set(spectrum, offset)

    this.writeIndex++
    if (this.writeIndex >= this.historySize)
      this.writeIndex = 0
  }

  resize() {

    const rect = this.canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    this.width = Math.floor(rect.width * dpr)
    this.height = Math.floor(rect.height * dpr)

    this.canvas.width = this.width
    this.canvas.height = this.height
  }

  render() {

    if (!this.ring) return

    const image = this.ctx.createImageData(this.width, this.height)

    const data = image.data

    for (let y = 0; y < this.height; y++) {

      const historyIndex =
        (this.writeIndex - y - 1 + this.historySize) % this.historySize

      const rowOffset = historyIndex * this.fftSize

      for (let x = 0; x < this.width; x++) {

        const src = Math.floor(x / this.width * this.fftSize)

        const v = this.ring[rowOffset + src]

        const t = (v - this.zmin) / (this.zmax - this.zmin)
        const c = Math.max(0, Math.min(255, Math.floor(t * 255)))

        const lutIndex = c * 3

        const i = (y * this.width + x) * 4

        data[i]     = this.lut[lutIndex]
        data[i + 1] = this.lut[lutIndex + 1]
        data[i + 2] = this.lut[lutIndex + 2]
        data[i + 3] = 255
      }
    }

    this.ctx.putImageData(image, 0, 0)
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