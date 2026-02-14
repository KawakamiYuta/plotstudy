export function drawGrid(ctx: CanvasRenderingContext2D, INNER_WIDTH: number, WAVE_HEIGHT: number) {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.beginPath();

    // 横グリッド（0〜1）
    for (let i = 0; i <= 5; i++) {
        const y = (WAVE_HEIGHT / 5) * i;
        ctx.moveTo(0, y);
        ctx.lineTo(INNER_WIDTH, y);
    }

    // 縦グリッド
    for (let i = 0; i <= 10; i++) {
        const x = (INNER_WIDTH / 10) * i;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, WAVE_HEIGHT);
    }

    ctx.stroke();

    ctx.strokeStyle = "#888";
    ctx.strokeRect(0, 0, INNER_WIDTH, WAVE_HEIGHT);
}

// FFTエリア用グリッド描画
export function drawFftGrid(ctx: CanvasRenderingContext2D, INNER_WIDTH: number, WAVE_HEIGHT: number, MARGIN_HEIGHT: number, FFT_HEIGHT: number) {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.beginPath();

    // 横グリッド（0〜1）
    for (let i = 0; i <= 5; i++) {
        const y = WAVE_HEIGHT + MARGIN_HEIGHT + (FFT_HEIGHT / 5) * i;
        ctx.moveTo(0, y);
        ctx.lineTo(INNER_WIDTH, y);
    }

    // 縦グリッド
    for (let i = 0; i <= 10; i++) {
        const x = (INNER_WIDTH / 10) * i;
        ctx.moveTo(x, WAVE_HEIGHT);
        ctx.lineTo(x, WAVE_HEIGHT + MARGIN_HEIGHT + FFT_HEIGHT);
    }

    ctx.stroke();
    ctx.strokeStyle = "#888";
    ctx.strokeRect(0, WAVE_HEIGHT + MARGIN_HEIGHT, INNER_WIDTH, FFT_HEIGHT);
}