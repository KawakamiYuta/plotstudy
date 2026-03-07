import { Chart } from "./chart"
import { clampViewport, Viewport } from "./viewport"

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

export class ChartEngine {

  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  viewport: Viewport
  margin: Margin
  transform: ChartTransform

  series: number[] = []
  bins: number[] = []
  threshold = 0
  maxValue = 200

  crosshair: CrosshairLayer

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

    // 初期サイズ反映
    this.resize()
  }

  setSeries(series: number[]) { this.series = series }
  setBins(bins: number[]) { this.bins = bins }
  setThreshold(t: number) { this.threshold = t }

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

    console.log("virewport", this.viewport)

    clampViewport(this.viewport, this.series.length, this.transform.chartWidth);
    console.log("virewport(clamp)", this.viewport)

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)

    const chart = new Chart()

    // 内側描画領域に translate
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
          if (this.bins.includes(i)) return "#8bc34a"
          if (v >= this.threshold) return "#ffeb3b"
          return "#3d3d3d"
        }
      )
    )

    chart.layers.push(
      new ThresholdLayer(
        this.threshold,
        this.maxValue,
        this.transform.chartWidth,
        this.transform.chartHeight
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

    // Axisはtranslate外で描画
    const axis = new AxisLayer(
      this.margin.left,
      this.margin.top,
      this.margin.bottom,
      this.transform.chartWidth,
      this.transform.chartHeight,
      this.viewport,
      this.maxValue,
      20,
      40
    )
    axis.draw(ctx)
  }
}