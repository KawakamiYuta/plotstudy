export function drawSpectrum(
    ctx: CanvasRenderingContext2D,
    spectrum: number[],
    offsetY: number,
    height: number,
    INNER_WIDTH: number
) {
    if (!spectrum.length) return;

    const MAX_DB = 256; // 適宜調整
    const barWidth = INNER_WIDTH / spectrum.length;

    ctx.fillStyle = "#f28e2b";

    for (let i = 0; i < spectrum.length; i++) {
        const value = spectrum[i];

        // dBなら正規化
        const normalized = Math.max(0, value) / MAX_DB;

        const barHeight = normalized * height;
        const x = i * barWidth;
        const y = offsetY + (height - barHeight);

        ctx.fillRect(x, y, barWidth - 1, barHeight);
    }
}