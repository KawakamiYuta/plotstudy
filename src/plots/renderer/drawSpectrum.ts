export function drawSpectrum(
  ctx: CanvasRenderingContext2D,
  spectrum: number[],
  offsetY: number,
  height: number,
  innerWidth: number,
  maxValue: number,
  pxPerBin: number,
  offset: number
) {
  if (!spectrum.length) return;

  ctx.save();

  const startBin = Math.floor(offset);
  const endBin = Math.min(
    spectrum.length,
    Math.ceil(offset + innerWidth / pxPerBin)
  );

  const gradient = ctx.createLinearGradient(
    0,
    offsetY,
    0,
    offsetY + height
  );
  gradient.addColorStop(0.0, "#ff4d4d");
  gradient.addColorStop(0.5, "#f28e2b");
  gradient.addColorStop(1.0, "#1f77b4");

  ctx.beginPath();

  for (let i = startBin; i < endBin; i++) {
    const value = spectrum[i];

    const normalized = Math.min(
      1,
      Math.max(0, value / maxValue)
    );

    const x = (i - offset) * pxPerBin;
    const y = offsetY + height * (1 - normalized);

    if (i === startBin) {
      ctx.moveTo(x, offsetY + height);
      ctx.lineTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  // 右下へ閉じる
  ctx.lineTo(
    (endBin - offset) * pxPerBin,
    offsetY + height
  );

  ctx.closePath();

  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.restore();
}
