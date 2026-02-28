export function drawAnalysis(
  ctx: CanvasRenderingContext2D,
  spectrum: number[],
  startBin: number,
  endBin: number,
  width: number,
  height: number,
  threshold: number
) {
  const leftMargin = 30;
  const bottomMargin = 20;
  const drawWidth = width - leftMargin;
  const drawHeight = height - bottomMargin;
  const len = Math.max(endBin - startBin, 0);
  if (len <= 0) return;

  const slice = spectrum.slice(startBin, endBin);
  // include threshold when computing max so line is inside bounds
    const maxVal = Math.max(threshold, ...slice) + 50;
    // const maxVal = 200;
  const pxPerBin = drawWidth / len;

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(leftMargin, 0);

  for (let i = 0; i < len; i++) {
    const value = slice[i];
    const normalized = Math.min(1, Math.max(0, value / maxVal));
    const barHeight = drawHeight * normalized;
    const x = i * pxPerBin;
    const y = drawHeight - barHeight;

    ctx.fillStyle = value >= threshold ? "#ffeb3b" : "white";
    ctx.fillRect(x, y, pxPerBin * 0.9, barHeight);
  }

  // draw threshold line
  const yLine = drawHeight - (threshold / maxVal) * drawHeight;
  ctx.strokeStyle = "red";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, yLine);
  ctx.lineTo(drawWidth, yLine);
  ctx.stroke();

  // draw axis labels: x along bottom, y along left
  ctx.fillStyle = "white";
  ctx.font = "12px monospace";

  // y-axis (values)
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const yTicks = 4;
  for (let i = 0; i <= yTicks; i++) {
    const value = maxVal - (maxVal / yTicks) * i;
    const y = (drawHeight / yTicks) * i;
    ctx.fillText(value.toFixed(0), -6, y);
  }

  // x-axis: label each bar with its bin index
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let i = 0; i < len; i++) {
    const binIdx = startBin + i;
    const x = i * pxPerBin + pxPerBin / 2;
    ctx.fillText(binIdx.toString(), x, drawHeight + 2);
  }

  ctx.restore();
}
