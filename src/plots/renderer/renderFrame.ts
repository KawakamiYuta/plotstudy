import { FrameData } from "../models/FrameStore";
import { drawGrid, drawFftGrid } from "./drawGrid";
import { drawWave } from "./drawWave";
import { drawSpectrum } from "./drawSpectrum";
import { drawAxisLabels, drawFftAxisLabels } from "./drawAxis";
import { MARGIN } from "./layout";

export type Viewport = {
    zoom: number;
    offset: number;
}

export function renderFrame(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    frame: FrameData,
    viewport: Viewport) {
    // const canvas = canvasRef.current!
    // const ctx = ctxRef.current!
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    const innerWidth = width - MARGIN.left - MARGIN.right
    const innerHeight = height - MARGIN.top - MARGIN.bottom

    const waveHeight = innerHeight * 0.475
    const fftHeight = innerHeight * 0.475
    const marginHeight = innerHeight * 0.05

    ctx.clearRect(0, 0, width, height)

    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, width, height)

    ctx.save()
    ctx.translate(MARGIN.left, MARGIN.top)

    drawGrid(ctx, innerWidth, waveHeight)
    drawWave(ctx, frame.samples, innerWidth, waveHeight, viewport.zoom, viewport.offset)

    drawFftGrid(ctx, innerWidth, waveHeight, marginHeight, fftHeight)
    drawSpectrum(
        ctx,
        frame.spectrum,
        waveHeight + marginHeight,
        fftHeight,
        innerWidth
    )

    ctx.restore()

    drawAxisLabels(ctx, frame.samples.length, innerWidth, waveHeight)
    drawFftAxisLabels(ctx, frame.spectrum.length, innerWidth, waveHeight, marginHeight, fftHeight)
}
