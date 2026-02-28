export function drawAnalysis(
  ctx: CanvasRenderingContext2D,
  spectrum: number[],
  startBin: number,
  endBin: number,
  width: number,
  height: number,
  threshold: number
) {
  const len = Math.max(endBin - startBin, 0);
  if (len <= 0) return;

  const slice = spectrum.slice(startBin, endBin);
  // include threshold when computing max so line is inside bounds
  const maxVal = Math.max(threshold, ...slice);
  const pxPerBin = width / len;

  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < len; i++) {
    const value = slice[i];
    const normalized = Math.min(1, Math.max(0, value / maxVal));
    const barHeight = height * normalized;
    const x = i * pxPerBin;
    const y = height - barHeight;

    ctx.fillStyle = value >= threshold ? "#ffeb3b" : "white";
    ctx.fillRect(x, y, pxPerBin * 0.9, barHeight);
  }

  // draw threshold line
  const yLine = height - (threshold / maxVal) * height;
  ctx.strokeStyle = "red";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, yLine);
  ctx.lineTo(width, yLine);
  ctx.stroke();
}
