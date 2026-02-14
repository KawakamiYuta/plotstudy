export function drawWave(
    ctx: CanvasRenderingContext2D,
    samples: number[],
    INNER_WIDTH: number,
    WAVE_HEIGHT: number,
    zoom: number,
    offset: number
) {
    if (samples.length === 0) return;

    const MAX_VALUE = 256;

    const visibleCount = Math.floor(samples.length / zoom);
    const start = Math.floor(offset);
    const end = Math.min(start + visibleCount, samples.length);

    const step = (end - start) / INNER_WIDTH;

    ctx.beginPath();

    for (let x = 0; x < INNER_WIDTH; x++) {
        const sampleIndex = Math.floor(start + x * step);
        const value = samples[sampleIndex] ?? 0;
        const y = WAVE_HEIGHT * (1 - value / MAX_VALUE);

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = "#4e79a7";
    ctx.lineWidth = 1;
    ctx.stroke();
}