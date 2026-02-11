const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

function drawGrid(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;

  ctx.beginPath();

  // 横グリッド（振幅）
  for (let i = 0; i <= 4; i++) {
    const y = (INNER_HEIGHT / 4) * i;
    ctx.moveTo(0, y);
    ctx.lineTo(INNER_WIDTH, y);
  }

  // 縦グリッド
  for (let i = 0; i <= 10; i++) {
    const x = (INNER_WIDTH / 10) * i;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, INNER_HEIGHT);
  }

  ctx.stroke();

  // 枠線
  ctx.strokeStyle = "#888";
  ctx.strokeRect(0, 0, INNER_WIDTH, INNER_HEIGHT);
}
export { drawGrid };