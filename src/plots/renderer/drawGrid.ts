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

    // horizontal lines spaced like Y-axis ticks (multiples of 5)
    {
        const approxLabelHeight = 14;
        const maxTicks = Math.floor(WAVE_HEIGHT / approxLabelHeight);
        let tickCount = Math.max(2, Math.min(10, maxTicks));
        const rawStep = 1 / tickCount; // normalized value
        const stepVal = Math.max(5, Math.ceil((rawStep * maxTicks) / 5) * 5);
        tickCount = Math.floor(maxTicks / (stepVal / 1));
        for (let i = 0; i <= tickCount; i++) {
            const y = (WAVE_HEIGHT / tickCount) * i;
            ctx.moveTo(0, y);
            ctx.lineTo(INNER_WIDTH, y);
        }
    }

    // vertical grid lines – same samples multiples of 5 as X-axis labels
    {
        const visibleSamples = Math.ceil(INNER_WIDTH / pxPerSample);
        const startIndex = Math.floor(offset);
        const targetPxPerLabel = 60;
        const labelCount = Math.max(2, Math.floor(INNER_WIDTH / targetPxPerLabel));
        const rawStep = visibleSamples / labelCount;
        const step = Math.max(5, Math.ceil(rawStep / 5) * 5);
        let first = Math.ceil(startIndex / 5) * 5;
        for (let idx = first; idx <= startIndex + visibleSamples; idx += step) {
            const x = (idx - offset) * pxPerSample;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, WAVE_HEIGHT);
        }
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

    // horizontal lines spaced like FFT Y-axis ticks (multiples of 5)
    {
        const approxLabelHeight = 14;
        const availableHeight = FFT_HEIGHT;
        const maxTicks = Math.floor(availableHeight / approxLabelHeight);
        let tickCount = Math.max(2, Math.min(12, maxTicks));
        const rawStep = 1 / tickCount;
        const stepVal = Math.max(5, Math.ceil((rawStep * maxTicks) / 5) * 5);
        tickCount = Math.floor(maxTicks / (stepVal / 1));
        for (let i = 0; i <= tickCount; i++) {
            const y = WAVE_HEIGHT + MARGIN_HEIGHT + (FFT_HEIGHT / tickCount) * i;
            ctx.moveTo(0, y);
            ctx.lineTo(INNER_WIDTH, y);
        }
    }
    // vertical lines – sync with FFT X-axis labels (multiples of 5)
    {
        const visibleBins = Math.ceil(INNER_WIDTH / pxPerBin);
        const startBin = Math.floor(offset);
        const targetPxPerLabel = 60;
        const labelCount = Math.max(2, Math.floor(INNER_WIDTH / targetPxPerLabel));
        const rawStep = visibleBins / labelCount;
        const step = Math.max(5, Math.ceil(rawStep / 5) * 5);
        let first = Math.ceil(startBin / 5) * 5;
        for (let idx = first; idx <= startBin + visibleBins; idx += step) {
            const x = (idx - offset) * pxPerBin;
            ctx.moveTo(x, WAVE_HEIGHT);
            ctx.lineTo(x, WAVE_HEIGHT + MARGIN_HEIGHT + FFT_HEIGHT);
        }
    }

    ctx.stroke();
    ctx.strokeStyle = "#888";
    ctx.strokeRect(0, WAVE_HEIGHT + MARGIN_HEIGHT, INNER_WIDTH, FFT_HEIGHT);
}