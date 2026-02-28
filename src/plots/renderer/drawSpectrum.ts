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

  ctx.fillStyle = gradient;

  for (let i = startBin; i < endBin; i++) {
    const value = spectrum[i];

    const normalized = Math.min(
      1,
      Math.max(0, value / maxValue)
    );

    const x = (i - offset) * pxPerBin;
    const barHeight = height * normalized;
    const y = offsetY + height - barHeight;

    // 少し隙間を入れるなら *0.9 とか
    const barWidth = pxPerBin * 0.9;

    ctx.fillRect(x, y, barWidth, barHeight);
  }

  ctx.restore();
}