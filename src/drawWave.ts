function drawWave(ctx: CanvasRenderingContext2D, samples: number[]) {
  const mid = INNER_HEIGHT / 2;

  const samplesPerPixel = Math.max(
    1,
    Math.floor(samples.length / INNER_WIDTH)
  );

  ctx.fillStyle = "#4e79a7";

  for (let x = 0; x < INNER_WIDTH; x++) {
    let min = 1;
    let max = -1;

    const start = x * samplesPerPixel;
    const end = Math.min(start + samplesPerPixel, samples.length);

    for (let i = start; i < end; i++) {
      const v = samples[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }

    const yMin = mid - max * mid;
    const yMax = mid - min * mid;

    ctx.fillRect(x, yMin, 1, yMax - yMin);
  }
}
export { drawWave };