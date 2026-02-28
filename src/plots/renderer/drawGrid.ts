export function drawGrid(
    ctx: CanvasRenderingContext2D,
    INNER_WIDTH: number,
    WAVE_HEIGHT: number,
    pxPerSample: number = 1,
    offset: number = 0
) {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.beginPath();

    // horizontal lines (0–1)
    for (let i = 0; i <= 5; i++) {
        const y = (WAVE_HEIGHT / 5) * i;
        ctx.moveTo(0, y);
        ctx.lineTo(INNER_WIDTH, y);
    }

    // vertical grid lines aligned to sample indices
    const visibleSamples = Math.ceil(INNER_WIDTH / pxPerSample);
    const startIndex = Math.floor(offset);

    for (let i = 0; i <= 10; i++) {
        const ratio = i / 10;
        const idx = Math.floor(startIndex + visibleSamples * ratio);
        const x = (idx - offset) * pxPerSample;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, WAVE_HEIGHT);
    }

    ctx.stroke();

    ctx.strokeStyle = "#888";
    ctx.strokeRect(0, 0, INNER_WIDTH, WAVE_HEIGHT);
}

// FFTエリア用グリッド描画
export function drawFftGrid(
    ctx: CanvasRenderingContext2D,
    INNER_WIDTH: number,
    WAVE_HEIGHT: number,
    MARGIN_HEIGHT: number,
    FFT_HEIGHT: number,
    pxPerBin: number = 1,
    offset: number = 0
) {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.beginPath();

    // horizontal lines (0–1)
    for (let i = 0; i <= 5; i++) {
        const y = WAVE_HEIGHT + MARGIN_HEIGHT + (FFT_HEIGHT / 5) * i;
        ctx.moveTo(0, y);
        ctx.lineTo(INNER_WIDTH, y);
    }

    // vertical lines – align with visible bins
    const visibleBins = Math.ceil(INNER_WIDTH / pxPerBin);
    const startBin = Math.floor(offset);
    for (let i = 0; i <= 10; i++) {
        const ratio = i / 10;
        const bin = Math.floor(startBin + visibleBins * ratio);
        const x = (bin - offset) * pxPerBin;
        ctx.moveTo(x, WAVE_HEIGHT);
        ctx.lineTo(x, WAVE_HEIGHT + MARGIN_HEIGHT + FFT_HEIGHT);
    }

    ctx.stroke();
    ctx.strokeStyle = "#888";
    ctx.strokeRect(0, WAVE_HEIGHT + MARGIN_HEIGHT, INNER_WIDTH, FFT_HEIGHT);
}