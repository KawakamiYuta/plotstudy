/**
 * Draws the FFT spectrum onto the canvas.  Optionally highlights a bin range
 * with a semi‑transparent overlay so the user can visually inspect a region.
 *
 * @param ctx Canvas rendering context
 * @param spectrum array of bin magnitudes
 * @param offsetY vertical offset where spectrum begins
 * @param height height of the spectrum area
 * @param innerWidth width available for drawing
 * @param maxValue value used to normalize bar heights
 * @param pxPerBin horizontal scale (pixels per bin)
 * @param offset horizontal offset in bins (for scrolling/zooming)
 * @param highlightStartBin optional first bin of highlighted range (inclusive)
 * @param highlightEndBin optional last bin of highlighted range (exclusive)
 * @param analysisMode whether we're in analysis mode
 * @param threshold threshold for drawing/colouring
 * @param analysisBins list of bins returned by backend; those bars get a distinct color
 */
export function drawSpectrum(
  ctx: CanvasRenderingContext2D,
  spectrum: number[],
  offsetY: number,
  height: number,
  innerWidth: number,
  maxValue: number,
  pxPerBin: number,
  offset: number,
  highlightStartBin: number | null = null,
  highlightEndBin: number | null = null,
  analysisMode: boolean = false,
  threshold: number = 0,
  analysisBins: number[] = []
) {
  if (!spectrum.length) return;

  ctx.save();

  const startBin = Math.floor(offset);
  const endBin = Math.min(
    spectrum.length,
    Math.ceil(offset + innerWidth / pxPerBin)
  );

  console.log("highlight range", highlightStartBin, highlightEndBin, "threshold", threshold, "analysisBins", analysisBins);

  // draw overlay if a valid range is provided (not during analysis)
  if (
    !analysisMode &&
    highlightStartBin !== null &&
    highlightEndBin !== null &&
    highlightEndBin > highlightStartBin
  ) {
    const h0 = Math.max(highlightStartBin, startBin);
    const h1 = Math.min(highlightEndBin, endBin);
    if (h1 > h0) {
      const x0 = (h0 - offset) * pxPerBin;
      const x1 = (h1 - offset) * pxPerBin;
      ctx.fillStyle = "rgba(0,255,0,0.1)"; // semi-transparent yellow
      ctx.fillRect(x0, offsetY, x1 - x0, height);
    }
  }

  const gradient = ctx.createLinearGradient(
    0,
    offsetY,
    0,
    offsetY + height
  );
  gradient.addColorStop(0.0, "#ff4d4d");
  gradient.addColorStop(0.5, "#f28e2b");
  gradient.addColorStop(1.0, "#1f77b4");

  ctx.fillStyle = gradient;

  for (let i = startBin; i < endBin; i++) {
    const value = spectrum[i];

    const normalized = Math.min(
      1,
      Math.max(0, value / maxValue)
    );

    const x = (i - offset) * pxPerBin;
    const barHeight = height * normalized;
    const y = offsetY + height - barHeight;

    // analysis mode coloring
    if (analysisMode) {
      if (analysisBins.includes(i)) {
        ctx.fillStyle = "#8bc34a"; // distinct color for backend-provided bins
      } else if (value >= threshold) {
        ctx.fillStyle = "#ffeb3b"; // highlight high values
      } else {
        ctx.fillStyle = "#3d3d3d";
      }
    }

    const barWidth = pxPerBin * 0.9;

    ctx.fillRect(x, y, barWidth, barHeight);
  }

  // draw threshold line during analysis mode
  if (analysisMode) {
    const yLine = offsetY + height - (threshold / maxValue) * height;
    ctx.strokeStyle = "#ffeb3b";
    ctx.beginPath();
    ctx.moveTo(0, yLine);
    ctx.lineTo(innerWidth, yLine);
    ctx.stroke();
  }

  ctx.restore();
}