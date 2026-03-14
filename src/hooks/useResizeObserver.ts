import { useEffect, RefObject } from "react"

export function useResizeObserver(
  ref: RefObject<HTMLElement | null>,
  callback: () => void
) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(callback)
    })

    observer.observe(el)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }

  }, [ref, callback])
}