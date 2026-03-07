import { Chart } from "./chart"
import { Viewport } from "./viewport"

import { SeriesLayer } from "./layers/seriesLayer"
import { GridLayer } from "./layers/gridLayer"
import { ThresholdLayer } from "./layers/thresholdLayer"
import { AxisLayer } from "./layers/axisLayer"
import { CrosshairLayer } from "./layers/crosshairLayer"
import { HoverLabelLayer } from "./layers/hoverLabelLayer"

import { attachMouseTracker } from "./controllers/attachMouseTracker"
import { attachZoomPan } from "./controllers/attachZoomPan"

import { ChartTransform } from "./chartTransform"
import { Margin } from "./types/margin"
import { HoverBinLabelLayer } from "./layers/hoverBinLabelLayer"
import { HoverValueLabelLayer } from "./layers/hoverValueLabelLayer"
import { ChartClipLayer } from "./layers/chartClipLayer"

export class ChartEngine {

  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  viewport: Viewport

  crosshair: CrosshairLayer

  series: number[] = []
  bins: number[] = []
  threshold = 0

  maxValue = 200
  margin: Margin;
  transform: ChartTransform;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!

    this.viewport = {
      pxPerUnit: 2,
      offset: 0
    }

 this.margin = {
  left: 60,
  top: 10,
  right: 10,
  bottom: 30
}

this.transform = new ChartTransform(
  canvas.width,
  canvas.height,
  this.margin,
  this.viewport
)   

    this.crosshair =
      new CrosshairLayer(this.transform.chartWidth, this.transform.chartHeight)

    attachMouseTracker(
      canvas,
      this.crosshair,
      this.transform,
      ()=>this.render(),
    )

    attachZoomPan(
      canvas,
      this.viewport,
      this.transform,
      ()=>this.render(),
    )
  }

  setSeries(series:number[]){
    this.series = series
  }

  setBins(bins:number[]){
    this.bins = bins
  }

  setThreshold(t:number){
    this.threshold = t
  }

render(){

  const ctx = this.ctx
  const canvas = this.canvas

  ctx.clearRect(0,0, canvas.width, canvas.height)

  const chart = new Chart()

  ctx.save()
  ctx.translate(this.margin.left, this.margin.top)

  chart.layers.push(
    new ChartClipLayer(
      this.transform.chartWidth,
      this.transform.chartHeight
    )
  )

  chart.layers.push(
    new GridLayer(
      this.transform.chartWidth,
      this.transform.chartHeight,
      this.viewport,
      20,
      this.transform.chartHeight/5
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
      (i,v)=>{

        if (this.bins.includes(i))
          return "#8bc34a"

        if (v >= this.threshold)
          return "#ffeb3b"

        return "#3d3d3d"
      }
    )
  )

  chart.layers.push(
    new ThresholdLayer(
      this.threshold,
      this.maxValue,
      this.transform.chartWidth,
      this.transform.chartHeight,
    )
  )

  chart.layers.push(this.crosshair)

  chart.layers.push(
    new HoverBinLabelLayer(
      this.viewport,
      this.series,
      ()=>this.crosshair.mouseX,
      ()=>this.crosshair.mouseY,
    )
  )

  chart.layers.push(
    new HoverValueLabelLayer(
      ()=>this.crosshair.mouseY,
      this.margin.left,
        this.transform.chartHeight,
        this.maxValue
    )
  )

  chart.draw(ctx)

  ctx.restore()

  // axis は translate 外
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