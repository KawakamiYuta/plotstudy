import { FrameData } from "../models/frameStore";
import { drawGrid, drawFftGrid } from "./drawGrid";
import { drawWave } from "./drawWave";
import { drawSpectrum } from "./drawSpectrum";
import { drawAxisLabels, drawFftAxisLabels } from "./drawAxis";
import { MARGIN } from "./layout";

type Viewport = {
  pxPerUnit: number
  offset: number
}

/**
 * Composite frame renderer that draws waveform, spectrum, grids, and axes.
 *
 * @param ctx canvas context
 * @param canvas the canvas element for sizing information
 * @param frame current frame data
 * @param viewport view parameters for waveform (ignored if showWave=false)
 * @param fftViewPort view parameters for spectrum
 * @param showWave whether to render waveform portion
 * @param analysisMode whether to render analysis style (coloring/lock)
 *
 * The various metadata values (threshold, highlight range, bin list) are
 * expected to be carried inside `frame` itself; callers no longer need to
 * pass them separately.
 */
export function renderFrame(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    frame: FrameData,
    viewport: Viewport,
    fftViewPort: Viewport,
    showWave: boolean = true,
    analysisMode: boolean = false,
    selectedBins: number[] = [],
    selectedCenter: number | null = null
) {
    // ctx and canvas already checked by caller
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const innerWidth = width - MARGIN.left - MARGIN.right;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;

    // heights depend on whether we're drawing the waveform
    const waveHeight = showWave ? innerHeight * 0.475 : 0;
    const fftHeight = showWave ? innerHeight * 0.475 : innerHeight;
    const marginHeight = showWave ? innerHeight * 0.05 : 0;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(MARGIN.left, MARGIN.top);

    const linMax = 1;
    const dbMax = 200;

    const highlightStartBin = frame.highlight_range ? frame.highlight_range.start : null;
    const highlightEndBin = frame.highlight_range ? frame.highlight_range.end : null;
    const threshold = frame.threshold ?? 0;
    const analysisBins = frame.analysis_bins ?? [];

    if (showWave) {
        drawWave(
            ctx,
            frame.samples,
            innerWidth,
            waveHeight,
            viewport.pxPerUnit,
            viewport.offset,
            linMax
        );
        drawGrid(ctx, innerWidth, waveHeight, viewport.pxPerUnit, viewport.offset);
    }

    drawSpectrum(
        ctx,
        frame.spectrum,
        waveHeight + marginHeight,
        fftHeight,
        innerWidth,
        dbMax,
        fftViewPort.pxPerUnit,
        fftViewPort.offset,
        highlightStartBin,
        highlightEndBin,
        analysisMode,
        threshold,
        analysisBins,
        selectedBins,
        selectedCenter
    );

    drawFftGrid(
        ctx,
        innerWidth,
        waveHeight,
        marginHeight,
        fftHeight,
        fftViewPort.pxPerUnit,
        fftViewPort.offset
    );

    ctx.restore();

    if (showWave) {
        drawAxisLabels(
            ctx,
            frame.samples.length,
            innerWidth,
            waveHeight,
            linMax,
            viewport.pxPerUnit,
            viewport.offset
        );
    }
    drawFftAxisLabels(
        ctx,
        frame.spectrum.length,
        innerWidth,
        waveHeight,
        marginHeight,
        fftHeight,
        dbMax,
        fftViewPort.pxPerUnit,
        fftViewPort.offset
    );
}
