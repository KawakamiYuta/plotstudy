export type Viewport = {
  pxPerUnit: number
  offset: number
}

export function visibleRange(
  dataLength: number,
  width: number,
  view: Viewport
) {
  const start = Math.floor(view.offset)
  const end = Math.min(
    dataLength,
    Math.ceil(view.offset + width / view.pxPerUnit)
  )

  return { start, end }
}

export function clampViewport(view: Viewport, dataLength: number, chartWidth: number) {
  const minPxPerUnit = chartWidth / dataLength
  view.pxPerUnit = Math.max(view.pxPerUnit, minPxPerUnit)
  
  const visible = chartWidth / view.pxPerUnit
  const maxOffset = Math.max(0, dataLength - visible)

  if (view.offset < 0) view.offset = 0
  else if (view.offset > maxOffset) view.offset = maxOffset
}