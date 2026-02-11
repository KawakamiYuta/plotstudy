function drawAxisLabels(
  ctx: CanvasRenderingContext2D,
  sampleCount: number
) {
  if (!ctx) return;

  ctx.fillStyle = "white";
  ctx.font = "12px monospace";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  // Y軸（振幅）
  for (let i = 0; i <= 4; i++) {
    const value = 1 - (i / 2);
    const y =
      MARGIN.top + (INNER_HEIGHT / 4) * i;

    ctx.fillText(
      value.toFixed(1),
      MARGIN.left - 10,
      y
    );
  }

  // X軸（サンプル番号）
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  for (let i = 0; i <= 10; i++) {
    const ratio = i / 10;
    const sampleIndex = Math.floor(
      sampleCount * ratio
    );

    const x =
      MARGIN.left + INNER_WIDTH * ratio;

    ctx.fillText(
      sampleIndex.toString(),
      x,
      MARGIN.top + INNER_HEIGHT + 5
    );
  }
}
export { drawAxisLabels };