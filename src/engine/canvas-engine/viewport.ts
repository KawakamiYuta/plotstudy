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

export function zoomToRange(view: Viewport, start: number, end: number, 
  canvasWidth: number) {
    const range = Math.max(end - start, 1);
    const newPx = canvasWidth / range;
    view.pxPerUnit = newPx;
    view.offset = start;
};

export function clampViewport(view: Viewport, 
  dataLength: number, chartWidth: number, startOffset = 0) {
  const minPxPerUnit = chartWidth / dataLength
  view.pxPerUnit = Math.max(view.pxPerUnit, minPxPerUnit)
  
  const visible = chartWidth / view.pxPerUnit
  const maxOffset = Math.max(startOffset, dataLength - visible + startOffset)

  if (view.offset < 0) view.offset = 0
  else if (view.offset > maxOffset) view.offset = maxOffset
}

export function resetViewport(view: Viewport, dataLength: number, chartWidth: number) {
  view.pxPerUnit = chartWidth / dataLength
  view.offset = 0
}