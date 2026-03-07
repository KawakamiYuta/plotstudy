export type Viewport = {
  scaleX: number
  offsetX: number
}

export function getNiceStep(secPerPixel: number) {
  const targetPx = 100
  const rawStep = secPerPixel * targetPx

  const pow10 = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const steps = [1, 2, 5]

  for (const s of steps) {
    if (pow10 * s >= rawStep) {
      return pow10 * s
    }
  }
  return pow10 * 10
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  viewport: Viewport,
  sampleRate: number,
  dataLength: number
) {
  ctx.clearRect(0, 0, width, height)

  const secPerPixel =
    (dataLength / sampleRate) /
    (width * viewport.scaleX)

  const stepSec = getNiceStep(secPerPixel)

  const totalSec = dataLength / sampleRate

  ctx.strokeStyle = "#333"
  ctx.fillStyle = "#aaa"
  ctx.font = "12px monospace"

  for (let t = 0; t <= totalSec; t += stepSec) {
    const x =
      (t / totalSec) * width * viewport.scaleX
      - viewport.offsetX

    if (x < 0 || x > width) continue

    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()

    ctx.fillText(`${(t * 1000).toFixed(1)} ms`, x + 4, height - 4)
  }

  // Y軸中心線
  ctx.beginPath()
  ctx.moveTo(0, height / 2)
  ctx.lineTo(width, height / 2)
  ctx.stroke()
}

export function drawWaveform(
  ctx: CanvasRenderingContext2D,
  data: number[],
  viewport: Viewport,
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width, height)

  ctx.strokeStyle = "#00ffcc"
  ctx.lineWidth = 1
  ctx.beginPath()

  const centerY = height / 2
  const step = width / data.length

  for (let i = 0; i < data.length; i++) {
    const x = i * step * viewport.scaleX - viewport.offsetX
    const y = centerY - data[i] * centerY

    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }

  ctx.stroke()
}