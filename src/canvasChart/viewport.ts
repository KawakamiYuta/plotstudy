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