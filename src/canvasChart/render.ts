import { Chart } from "./chart"
import { GridLayer } from "./layers/gridLayer"
import { SeriesLayer } from "./layers/seriesLayer"
import { ThresholdLayer } from "./layers/thresholdLayer"
import { AxisLayer } from "./layers/axisLayer"
import { Viewport } from "./viewport"
import { CrosshairLayer } from "./layers/crosshairLayer"
import { HoverLabelLayer } from "./layers/hoverLabelLayer"

// const crosshair = new CrosshairLayer(canvas.width, canvas.height)

// attachMouseTracker(canvas, crosshair, render)

// attachZoomPan(canvas, viewport, render)

// export function getRenderFunction()

export function renderChart(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  viewport: Viewport,
  series: number[],
  bins: number[],
  threshold: number
) {

  const innerWidth = canvas.width
  const innerHeight = canvas.height

  ctx.clearRect(0, 0, innerWidth, innerHeight)

  const chart = new Chart()

  const maxValue = 200

  const seriesLayer = new SeriesLayer(
    series,
    viewport,
    innerWidth,
    0,
    innerHeight,
    maxValue,
    "bar",
    (i, v) => {

      if (bins.includes(i)) return "#8bc34a"
      if (v >= threshold) return "#ffeb3b"

      return "#3d3d3d"
    }
  )

  const thresholdLayer = new ThresholdLayer(
    threshold,
    maxValue,
    0,
    innerHeight,
    innerWidth
  )

  const gridLayer = new GridLayer(
    innerWidth,
    0,
    innerHeight,
    viewport,
    20,
    innerHeight / 5
  )

  const axisLayer = new AxisLayer(
    innerWidth,
    0,
    innerHeight,
    viewport,
    maxValue,
    20,
    40
  )

  const crosshairLayer =
    new CrosshairLayer(innerWidth, innerHeight)

  const hoverLabelLayer =
    new HoverLabelLayer(viewport, series, () => crosshairLayer.mouseX, innerWidth, innerHeight)

  chart.layers.push(gridLayer)
  chart.layers.push(seriesLayer)
  chart.layers.push(thresholdLayer)
  chart.layers.push(axisLayer)
  chart.layers.push(crosshairLayer)
  chart.layers.push(hoverLabelLayer)

  chart.draw(ctx)
}