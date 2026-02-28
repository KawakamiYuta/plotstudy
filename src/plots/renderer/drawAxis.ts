import { MARGIN } from "./layout";

export function drawAxisLabels(
    ctx: CanvasRenderingContext2D,
    sampleCount: number,
    INNER_WIDTH: number,
    WAVE_HEIGHT: number,
    maxValue: number,
    pxPerSample: number = 1,
    offset: number = 0
) {
    ctx.fillStyle = "white";
    ctx.font = "12px monospace";

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    // Y軸（0〜maxValue）: ticks are multiples of 5, count limited by height
    {
        const approxLabelHeight = 14; // 12px font + padding
        const maxTicks = Math.floor(WAVE_HEIGHT / approxLabelHeight);
        let tickCount = Math.max(2, Math.min(10, maxTicks));
        // determine step size rounded up to nearest multiple of 5
        const rawStep = maxValue / tickCount;
        const step = Math.max(5, Math.ceil(rawStep / 5) * 5);
        // recalc tick count to fit whole multiples
        tickCount = Math.floor(maxValue / step);
        for (let i = 0; i <= tickCount; i++) {
            const value = maxValue - step * i;
            const y = MARGIN.top + (WAVE_HEIGHT / tickCount) * i;
            ctx.fillText(value.toFixed(0), MARGIN.left - 10, y);
        }
    }

    // X軸
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // determine visible range based on zoom/offset
    const visibleCount = Math.ceil(INNER_WIDTH / pxPerSample);
    const startIndex = Math.floor(offset);
    {
        const targetPxPerLabel = 60; // aim for 60px between labels
        const labelCount = Math.max(2, Math.floor(INNER_WIDTH / targetPxPerLabel));
        // compute step in samples, round to multiple of 5
        const rawStep = visibleCount / labelCount;
        const step = Math.max(5, Math.ceil(rawStep / 5) * 5);
        let first = Math.ceil(startIndex / 5) * 5;
        for (let idx = first; idx <= startIndex + visibleCount; idx += step) {
            const x = MARGIN.left + (idx - offset) * pxPerSample;
            ctx.fillText(idx.toString(), x, MARGIN.top + WAVE_HEIGHT + 5);
        }
    }
}

// FFTエリア用軸ラベル描画
export function drawFftAxisLabels(
    ctx: CanvasRenderingContext2D,
    spectrumLength: number,
    INNER_WIDTH: number,
    WAVE_HEIGHT: number,
    MARGIN_HEIGHT: number,
    FFT_HEIGHT: number,
    maxValue: number,
    pxPerBin: number = 1,
    offset: number = 0
) {
    ctx.fillStyle = "white";
    ctx.font = "12px monospace";

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    // Y軸（dB 0〜MAX_DB） dynamic tick count with multiples of 5
    {
        const approxLabelHeight = 14;
        const availableHeight = FFT_HEIGHT;
        const maxTicks = Math.floor(availableHeight / approxLabelHeight);
        let tickCount = Math.max(2, Math.min(12, maxTicks));
        const rawStep = maxValue / tickCount;
        const step = Math.max(5, Math.ceil(rawStep / 5) * 5);
        tickCount = Math.floor(maxValue / step);
        for (let i = 0; i <= tickCount; i++) {
            const value = maxValue - step * i;
            const y =
                MARGIN.top + WAVE_HEIGHT + MARGIN_HEIGHT +
                (FFT_HEIGHT / tickCount) * i;
            ctx.fillText(value.toFixed(0), MARGIN.left - 10, y);
        }
    }

    // X軸
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const visibleBins = Math.ceil(INNER_WIDTH / pxPerBin);
    const startBin = Math.floor(offset);
    {
        const targetPxPerLabel = 60;
        const labelCount = Math.max(2, Math.floor(INNER_WIDTH / targetPxPerLabel));
        const rawStep = visibleBins / labelCount;
        const step = Math.max(5, Math.ceil(rawStep / 5) * 5);
        let first = Math.ceil(startBin / 5) * 5;
        for (let idx = first; idx <= startBin + visibleBins; idx += step) {
            const x = MARGIN.left + (idx - offset) * pxPerBin;
            ctx.fillText(
                idx.toString(),
                x,
                MARGIN.top + WAVE_HEIGHT + MARGIN_HEIGHT +
                    FFT_HEIGHT + 5
            );
        }
    }
}

