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

    // Y軸（0〜256）
    for (let i = 0; i <= 4; i++) {
        const value = maxValue - (maxValue / 4) * i;
        const y =
            MARGIN.top + (WAVE_HEIGHT / 4) * i;

        ctx.fillText(
            value.toFixed(0),
            MARGIN.left - 10,
            y
        );
    }

    // X軸
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // determine visible range based on zoom/offset
    const visibleCount = Math.ceil(INNER_WIDTH / pxPerSample);
    const startIndex = Math.floor(offset);

    for (let i = 0; i <= 10; i++) {
        const ratio = i / 10;
        const sampleIndex = Math.floor(
            startIndex + visibleCount * ratio
        );

        const x =
            MARGIN.left + (sampleIndex - offset) * pxPerSample;

        ctx.fillText(
            sampleIndex.toString(),
            x,
            MARGIN.top + WAVE_HEIGHT + 5
        );
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

    // Y軸（dB 0〜MAX_DB）
    for (let i = 0; i <= 10; i++) {
        const value = maxValue - (maxValue / 10) * i;
        const y = MARGIN.top + WAVE_HEIGHT + MARGIN_HEIGHT + (FFT_HEIGHT / 10) * i;
        ctx.fillText(value.toFixed(0), MARGIN.left - 10, y);
    }

    // X軸
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const visibleBins = Math.ceil(INNER_WIDTH / pxPerBin);
    const startBin = Math.floor(offset);

    for (let i = 0; i <= 10; i++) {
        const ratio = i / 10;
        const freqIndex = Math.floor(startBin + visibleBins * ratio);
        const x = MARGIN.left + (freqIndex - offset) * pxPerBin;
        ctx.fillText(freqIndex.toString(), x, MARGIN.top + WAVE_HEIGHT + MARGIN_HEIGHT + FFT_HEIGHT + 5);
    }
}

