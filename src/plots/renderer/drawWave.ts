export function drawWave(
  ctx: CanvasRenderingContext2D,
  samples: number[],
  innerWidth: number,
  waveHeight: number,
  pxPerSample: number,
  offset: number,
  maxValue: number,
) {
  if (samples.length === 0) return

  ctx.beginPath()

  const startIndex = Math.floor(offset)
  const endIndex = Math.min(
    samples.length,
    Math.ceil(offset + innerWidth / pxPerSample)
  )

  console.log(`Drawing wave: startIndex=${startIndex}, endIndex=${endIndex}, offset=${offset.toFixed(2)}`)
  for (let i = startIndex; i < endIndex; i++) {
    const x = (i - offset) * pxPerSample
    const value = samples[i]
    const y = waveHeight * (1 - value / maxValue)

    if (i === startIndex) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }

  ctx.strokeStyle = "#4e79a7"
  ctx.lineWidth = 1
  ctx.stroke()
}
