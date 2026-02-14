import { MARGIN } from "./layout";

export function drawAxisLabels(
    ctx: CanvasRenderingContext2D,
    sampleCount: number,
    INNER_WIDTH: number,
    WAVE_HEIGHT: number
) {
    ctx.fillStyle = "white";
    ctx.font = "12px monospace";

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    // Y軸（0〜256）
    for (let i = 0; i <= 4; i++) {
        const value = 256 - (256 / 4) * i;
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
            MARGIN.top + WAVE_HEIGHT + 5
        );
    }
}

// FFTエリア用軸ラベル描画
export function drawFftAxisLabels(ctx: CanvasRenderingContext2D, spectrumLength: number, INNER_WIDTH: number, WAVE_HEIGHT: number, MARGIN_HEIGHT: number, FFT_HEIGHT: number) {
    ctx.fillStyle = "white";
    ctx.font = "12px monospace";

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    // Y軸（dB 0〜MAX_DB）
    const MAX_DB = 256;
    for (let i = 0; i <= 4; i++) {
        const value = MAX_DB - (MAX_DB / 4) * i;
        const y = MARGIN.top + WAVE_HEIGHT + MARGIN_HEIGHT + (FFT_HEIGHT / 4) * i;
        ctx.fillText(value.toFixed(0), MARGIN.left - 10, y);
    }

    // X軸
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = 0; i <= 10; i++) {
        const ratio = i / 10;
        const freqIndex = Math.floor(spectrumLength * ratio);
        const x = MARGIN.left + INNER_WIDTH * ratio;
        ctx.fillText(freqIndex.toString(), x, MARGIN.top + WAVE_HEIGHT + MARGIN_HEIGHT + FFT_HEIGHT + 5);
    }
}

