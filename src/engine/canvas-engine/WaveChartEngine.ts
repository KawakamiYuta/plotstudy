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

import { ChartTransform } from "./chartTransform"
import { Margin } from "./types/margin"


type ChartMode = "spectrum" | "analysis"

export class WaveChartEngine {

  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  viewport: Viewport
  margin: Margin
  transform: ChartTransform

  series: number[] = []

  maxValue = 200

  crosshair: CrosshairLayer

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!

    this.viewport = { pxPerUnit: 2, offset: 0 }

    this.margin = { left: 60, top: 10, right: 20, bottom: 60 }

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

    this.resize()
  }

  setSeries(series: number[]) { 
    this.series = series
    this.maxValue = Math.max(...series) * 1.1
    resetViewport(this.viewport, series.length, this.transform.chartWidth)
  }

  resize() {
    console.log("Resizing chart to", this.canvas.clientWidth, this.canvas.clientHeight) 
    const rect = this.canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    console.log("Resizing chart to(trans)", this.canvas.clientWidth, this.canvas.clientHeight) 

    this.transform.resize(rect.width, rect.height)
    this.crosshair.width = this.transform.chartWidth
    this.crosshair.height = this.transform.chartHeight

    this.render()
  }

  render() {
    const ctx = this.ctx
    const canvas = this.canvas

    clampViewport(this.viewport, this.series.length, this.transform.chartWidth);

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)

    const chart = new Chart()

    ctx.save()
    ctx.translate(this.margin.left, this.margin.top)

    chart.layers.push(
      new GridLayer(
        this.transform.chartWidth,
        this.transform.chartHeight,
        this.viewport,
        20,
        this.transform.chartHeight / 10
      )
    )

    chart.layers.push(
      new SeriesLayer(
        this.series,
        this.viewport,
        this.transform.chartWidth,
        this.transform.chartHeight,
        this.maxValue,
        "line",
        (i, v) => {
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
      )
    )

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
      this.maxValue / 10,
      v => v.toFixed(5)
    )
    axis.draw(ctx)
  }
}