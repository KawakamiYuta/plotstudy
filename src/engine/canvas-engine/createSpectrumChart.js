import { Chart } from "./chart"
import { SeriesLayer } from "./layers/seriesLayer"
import { HighlightLayer } from "./layers/highlightLayer"
import { ThresholdLayer } from "./layers/thresholdLayer"

export function createSpectrumChart(
  frame,
  view,
  width,
  offsetY,
  height,
  maxValue
) {

  const chart = new Chart()

  const threshold = frame.threshold ?? 0
  const bins = frame.analysis_bins ?? []

  chart.add(
    new SeriesLayer(
      frame.spectrum,
      view,
      width,
      offsetY,
      height,
      maxValue,
      "bar",
      (i,v)=>{

        if (bins.includes(i)) return "#8bc34a"
        if (v >= threshold) return "#ffeb3b"

        return "#3d3d3d"
      }
    )
  )

  chart.add(
    new ThresholdLayer(
      threshold,
      maxValue,
      offsetY,
      height,
      width
    )
  )

  return chart
}