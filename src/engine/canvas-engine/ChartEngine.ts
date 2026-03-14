import { Chart } from "./chart"
import { clampViewport, resetViewport, Viewport, zoomToRange } from "./viewport"

import { SeriesLayer } from "./layers/seriesLayer"
import { ChartClipLayer } from "./layers/chartClipLayer"
import { GridLayer } from "./layers/gridLayer"
import { ThresholdLayer } from "./layers/thresholdLayer"
import { AxisLayer } from "./layers/axisLayer"
import { CrosshairLayer } from "./layers/crosshairLayer"
import { HoverBinLabelLayer } from "./layers/hoverBinLabelLayer"
import { HoverValueLabelLayer } from "./layers/hoverValueLabelLayer"

import { attachMouseTracker } from "./controllers/attachMouseTracker"
import { attachZoomPan } from "./controllers/attachZoomPan"
import { attachHighlightAnalysis } from "./controllers/attachHighlightAnalysis"

import { ChartTransform } from "./chartTransform"
import { Margin } from "./types/margin"
import { HighlightRange, HighlightLayer } from "./layers/highlightLayer"
import { attachBinSelection } from "./controllers/attachBinSelection"

import { FrameData } from "../../stores/frameStore"

type ChartMode = "spectrum" | "analysis"

export class ChartEngine {

  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  viewport: Viewport
  margin: Margin
  transform: ChartTransform

  series: number[] = []
  bins: number[] = []
  highlightRanges: HighlightRange[] = []
  threshold = 0
  bandDict: { [key: number]: HighlightRange } | null = null

  maxValue = 200

  crosshair: CrosshairLayer

  mode: ChartMode = "spectrum"
  currentAnalysisRange: HighlightRange | null = null
  selectedBin: number | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!

    this.viewport = { pxPerUnit: 2, offset: 0 }

    this.margin = { left: 60, top: 10, right: 20, bottom: 30 }

    this.transform = new ChartTransform(
      canvas.width,
      canvas.height,
      this.margin,
      this.viewport
    )

    this.crosshair = new CrosshairLayer(
      this.transform.chartWidth,
      this.transform.chartHeight
    )

    attachMouseTracker(canvas, this.crosshair, this.transform, () => this.render())
    attachZoomPan(canvas, this.viewport, this.transform, () => this.render())
    attachHighlightAnalysis(
      canvas,
      this.viewport,
      this.transform,
      () => this.highlightRanges,
      (range) => {
        console.log("Entering analysis for range:", range)
        zoomToRange(this.viewport, range.start, range.end, this.transform.chartWidth)
        this.mode = "analysis"
        this.currentAnalysisRange = range
      },
      () => {
        console.log("Exiting analysis")
        this.mode = "spectrum"
        this.currentAnalysisRange = null
        this.selectedBin = null
        resetViewport(this.viewport, this.series.length, this.transform.chartWidth)
      },
      () => this.render()
    )
    attachBinSelection(canvas, this.transform,
      () => this.mode,
      () => this.currentAnalysisRange ?? null,
      (bin) => {
        this.selectedBin = bin
      },
      () => this.render()
    )

    this.resize()
  }

    setSeries(series: number[]) {
      this.series = series
      resetViewport(this.viewport, series.length, this.transform.chartWidth)
    }
    setBins(bins: number[]) { this.bins = bins }
    setThreshold(t: number) { this.threshold = t }
    setHighlightRanges(ranges: HighlightRange[]) { this.highlightRanges = ranges }
    setBandDict(dict: { [key: number]: HighlightRange }) { this.bandDict = dict }

  updateFromFrame(frame: FrameData) {
      this.setSeries(frame.spectrum)
      this.setBins(frame.analysis_bins || [])
      this.setThreshold(frame.threshold || 0)
      this.setHighlightRanges(
        frame.highlight_range ? [frame.highlight_range] : []
      )

      if (frame.overlay_bins_by_center) {

        const bandDict = Object.fromEntries(
          Object.entries(frame.overlay_bins_by_center).map(
            ([center, bins]) => [
              center,
              { start: Math.min(...bins), end: Math.max(...bins) }
            ]
          )
        )

        this.setBandDict(bandDict)
      }
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    this.transform.resize(rect.width, rect.height)
    this.crosshair.width = this.transform.chartWidth
    this.crosshair.height = this.transform.chartHeight

    this.render()
  }

  render() {
    const ctx = this.ctx
    const canvas = this.canvas

    if (this.mode === "spectrum")
      clampViewport(this.viewport, this.series.length, this.transform.chartWidth);
    else if (this.mode === "analysis") {
      clampViewport(this.viewport,
        this.currentAnalysisRange.end - this.currentAnalysisRange.start,
        this.transform.chartWidth, this.currentAnalysisRange.start);

      if (this.viewport.offset < this.currentAnalysisRange!.start)
        this.viewport.offset = this.currentAnalysisRange!.start
    }
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)

    const chart = new Chart()

    ctx.save()
    ctx.translate(this.margin.left, this.margin.top)

    // chart.layers.push(
    //   new ChartClipLayer(
    //     this.transform.chartWidth,
    //     this.transform.chartHeight
    //   )
    // )

    // Layers
    chart.layers.push(
      new GridLayer(
        this.transform.chartWidth,
        this.transform.chartHeight,
        this.viewport,
        20,
        this.transform.chartHeight / 5
      )
    )

    chart.layers.push(
      new SeriesLayer(
        this.series,
        this.viewport,
        this.transform.chartWidth,
        this.transform.chartHeight,
        this.maxValue,
        "bar",
        (i, v) => {
          if (this.mode === "analysis") {
            if (this.selectedBin !== null && i === this.selectedBin) return "#2196f3"
            if (this.bins.includes(i)) return "#8bc34a"
            if (v >= this.threshold) return "#ffeb3b"
            return "#3d3d3d"
          }
          else {
            const gradient = ctx.createLinearGradient(
              0,
              0,
              0,
              this.transform.chartHeight
            );
            gradient.addColorStop(0.0, "#ff4d4d");
            gradient.addColorStop(0.5, "#f28e2b");
            gradient.addColorStop(1.0, "#1f77b4");
            return gradient
          }
        }
      )
    )

    if (this.mode !== "analysis") {
      for (const range of this.highlightRanges) {
        chart.layers.push(
          new HighlightLayer(
            range.start,
            range.end,
            this.viewport,
            this.transform.chartHeight
          )
        )
      }
    }

    if (this.mode === "analysis" && this.bandDict && this.selectedBin !== null) {
      const range = this.bandDict[this.selectedBin]
      if (range)
        chart.layers.push(
          new HighlightLayer(
            range.start,
            range.end,
            this.viewport,
            this.transform.chartHeight
          )
        )
    }

    if (this.mode === "analysis") {
      chart.layers.push(
        new ThresholdLayer(
          this.threshold,
          this.maxValue,
          this.transform.chartWidth,
          this.transform.chartHeight
        )
      )
    }

    chart.layers.push(this.crosshair)

    chart.layers.push(
      new HoverBinLabelLayer(
        this.viewport,
        this.series,
        () => this.crosshair.mouseX,
        () => this.crosshair.mouseY
      )
    )

    chart.layers.push(
      new HoverValueLabelLayer(
        () => this.crosshair.mouseY,
        this.margin.left,
        this.transform.chartHeight,
        this.maxValue
      )
    )

    chart.draw(ctx)
    ctx.restore()

    const axis = new AxisLayer(
      this.margin.left,
      this.margin.top,
      this.margin.bottom,
      this.transform.chartWidth,
      this.transform.chartHeight,
      this.viewport,
      this.maxValue,
      30,
      40
    )
    axis.draw(ctx)
  }
}