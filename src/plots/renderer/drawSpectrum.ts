export function drawSpectrum(
    ctx: CanvasRenderingContext2D,
    spectrum: number[],
    offsetY: number,
    height: number,
    INNER_WIDTH: number,
    maxValue: number,
) {
    if (!spectrum.length) return;

    const barWidth = INNER_WIDTH / spectrum.length;

    const gradient = ctx.createLinearGradient(0, offsetY, 0, offsetY + height);
    gradient.addColorStop(0.0, "#ff4d4d");
    gradient.addColorStop(0.5, "#f28e2b");
    gradient.addColorStop(1.0, "#1f77b4");

    ctx.beginPath();

    for (let i = 0; i < spectrum.length; i++) {
        const value = spectrum[i];

        const normalized = Math.min(
            1,
            Math.max(0, value / maxValue)
        );

        const x = i * barWidth;
        const y = offsetY + height * (1 - normalized);

        if (i === 0) {
            ctx.moveTo(x, offsetY + height); // 下から開始
            ctx.lineTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.lineTo(INNER_WIDTH, offsetY + height);
    ctx.closePath();

    // 🔥 塗り
    ctx.fillStyle = gradient;
    ctx.fill();

    // 🔥 上に線を重ねる
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.2;
    ctx.stroke();
}
